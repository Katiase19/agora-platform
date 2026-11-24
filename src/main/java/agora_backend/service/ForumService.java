package agora_backend.service;

import agora_backend.dto.request.CreateReplyRequest;
import agora_backend.dto.request.CreateThreadRequest;
import agora_backend.dto.request.VoteRequest;
import agora_backend.dto.response.ReplyResponse;
import agora_backend.dto.response.ThreadResponse;
import agora_backend.dto.response.VoteResponse;
import agora_backend.entity.*;
import agora_backend.exception.ApiException;
import agora_backend.repository.ReplyRepository;
import agora_backend.repository.ThreadRepository;
import agora_backend.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ForumService {

    /** Reputation gained/lost per vote point on a user's thread or reply. */
    private static final int REPUTATION_PER_VOTE = 5;
    /** Reputation gained when a user's reply is accepted as the answer. */
    private static final int REPUTATION_PER_ACCEPTED_ANSWER = 15;

    private final ThreadRepository threadRepository;
    private final ReplyRepository replyRepository;
    private final VoteRepository voteRepository;

    // ---------- THREADS ----------

    public ThreadResponse createThread(CreateThreadRequest request, User author) {
        DiscussionThread thread = DiscussionThread.builder()
                .title(request.getTitle().trim())
                .body(request.getBody().trim())
                .courseTag(normalizeCourseTag(request.getCourseTag()))
                .author(author)
                .isResolved(false)
                .voteScore(0)
                .viewCount(0)
                .build();

        DiscussionThread saved = threadRepository.save(thread);
        return mapThreadToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ThreadResponse> getAllThreads() {
        return mapThreads(threadRepository.findAllByOrderByCreatedAtDesc());
    }

    public ThreadResponse getThreadById(Long id, User viewer) {
        DiscussionThread thread = findThread(id);

        thread.setViewCount(thread.getViewCount() + 1);
        threadRepository.save(thread);

        ThreadResponse response = mapThreadToResponse(thread);
        if (viewer != null) {
            response.setUserVote(
                    voteRepository.findByUserIdAndTargetTypeAndTargetId(viewer.getId(), VoteTargetType.THREAD, id)
                            .map(Vote::getValue)
                            .orElse(0)
            );
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<ThreadResponse> getThreadsByCourse(String courseTag) {
        return mapThreads(threadRepository.findByCourseTagIgnoreCaseOrderByCreatedAtDesc(courseTag));
    }

    @Transactional(readOnly = true)
    public List<ThreadResponse> getThreadsByAuthor(Long authorId) {
        return mapThreads(threadRepository.findByAuthorIdOrderByCreatedAtDesc(authorId));
    }

    @Transactional(readOnly = true)
    public List<ThreadResponse> searchThreads(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllThreads();
        }
        return mapThreads(threadRepository.searchByKeyword(keyword.trim()));
    }

    @Transactional(readOnly = true)
    public List<ThreadResponse> getRecentThreads() {
        return mapThreads(threadRepository.findTop20ByOrderByCreatedAtDesc());
    }

    @Transactional(readOnly = true)
    public List<ThreadResponse> getTopThreads() {
        return mapThreads(threadRepository.findTop20ByOrderByVoteScoreDesc());
    }

    @Transactional(readOnly = true)
    public List<String> getCourseTags() {
        return threadRepository.findDistinctCourseTags();
    }

    public ThreadResponse updateThread(Long id, CreateThreadRequest request, User requester) {
        DiscussionThread thread = findThread(id);

        if (!thread.getAuthor().getId().equals(requester.getId())) {
            throw ApiException.forbidden("You can only edit your own threads");
        }

        thread.setTitle(request.getTitle().trim());
        thread.setBody(request.getBody().trim());
        thread.setCourseTag(normalizeCourseTag(request.getCourseTag()));
        return mapThreadToResponse(threadRepository.save(thread));
    }

    public void deleteThread(Long id, User requester) {
        DiscussionThread thread = findThread(id);

        if (!thread.getAuthor().getId().equals(requester.getId()) && !isModerator(requester)) {
            throw ApiException.forbidden("You are not authorized to delete this thread");
        }

        // Remove replies and all votes first, otherwise the foreign keys block the delete
        List<Reply> replies = replyRepository.findByThreadId(id);
        List<Long> replyIds = replies.stream().map(Reply::getId).toList();
        if (!replyIds.isEmpty()) {
            voteRepository.deleteByTargetTypeAndTargetIdIn(VoteTargetType.REPLY, replyIds);
            replyRepository.deleteAll(replies);
        }
        voteRepository.deleteByTargetTypeAndTargetIdIn(VoteTargetType.THREAD, List.of(id));
        threadRepository.delete(thread);
    }

    // ---------- REPLIES ----------

    public ReplyResponse createReply(Long threadId, CreateReplyRequest request, User author) {
        DiscussionThread thread = findThread(threadId);

        Reply reply = Reply.builder()
                .body(request.getBody().trim())
                .thread(thread)
                .author(author)
                .isAccepted(false)
                .voteScore(0)
                .build();

        Reply saved = replyRepository.save(reply);
        ReplyResponse response = mapReplyToResponse(saved);
        response.setUserVote(0);
        return response;
    }

    @Transactional(readOnly = true)
    public List<ReplyResponse> getRepliesByThread(Long threadId, User viewer) {
        List<Reply> replies = replyRepository.findByThreadIdOrderByVoteScoreDesc(threadId);

        Map<Long, Integer> userVotes = Collections.emptyMap();
        if (viewer != null && !replies.isEmpty()) {
            List<Long> replyIds = replies.stream().map(Reply::getId).toList();
            userVotes = voteRepository
                    .findByUserIdAndTargetTypeAndTargetIdIn(viewer.getId(), VoteTargetType.REPLY, replyIds)
                    .stream()
                    .collect(Collectors.toMap(Vote::getTargetId, Vote::getValue));
        }

        final Map<Long, Integer> votes = userVotes;
        return replies.stream()
                // Accepted answer always first, then by votes
                .sorted((a, b) -> Boolean.compare(b.getIsAccepted(), a.getIsAccepted()))
                .map(reply -> {
                    ReplyResponse response = mapReplyToResponse(reply);
                    if (viewer != null) {
                        response.setUserVote(votes.getOrDefault(reply.getId(), 0));
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    public ReplyResponse markAsAccepted(Long replyId, Long threadId, User requester) {
        DiscussionThread thread = findThread(threadId);

        // Only the thread author can mark an accepted answer
        if (!thread.getAuthor().getId().equals(requester.getId())) {
            throw ApiException.forbidden("Only the thread author can mark an accepted answer");
        }

        Reply reply = findReply(replyId);
        if (!reply.getThread().getId().equals(threadId)) {
            throw ApiException.badRequest("This reply does not belong to this thread");
        }

        // Toggle: accepting the already-accepted reply un-accepts it
        if (Boolean.TRUE.equals(reply.getIsAccepted())) {
            reply.setIsAccepted(false);
            adjustReputation(reply.getAuthor(), requester, -REPUTATION_PER_ACCEPTED_ANSWER);
            thread.setIsResolved(false);
            threadRepository.save(thread);
            return mapReplyToResponse(replyRepository.save(reply));
        }

        // Only one accepted answer per thread
        for (Reply other : replyRepository.findByThreadId(threadId)) {
            if (Boolean.TRUE.equals(other.getIsAccepted())) {
                other.setIsAccepted(false);
                adjustReputation(other.getAuthor(), requester, -REPUTATION_PER_ACCEPTED_ANSWER);
                replyRepository.save(other);
            }
        }

        reply.setIsAccepted(true);
        adjustReputation(reply.getAuthor(), requester, REPUTATION_PER_ACCEPTED_ANSWER);
        Reply saved = replyRepository.save(reply);

        thread.setIsResolved(true);
        threadRepository.save(thread);

        return mapReplyToResponse(saved);
    }

    public ReplyResponse updateReply(Long id, CreateReplyRequest request, User requester) {
        Reply reply = findReply(id);

        if (!reply.getAuthor().getId().equals(requester.getId())) {
            throw ApiException.forbidden("You can only edit your own replies");
        }

        reply.setBody(request.getBody().trim());
        return mapReplyToResponse(replyRepository.save(reply));
    }

    public void deleteReply(Long id, User requester) {
        Reply reply = findReply(id);

        if (!reply.getAuthor().getId().equals(requester.getId()) && !isModerator(requester)) {
            throw ApiException.forbidden("You are not authorized to delete this reply");
        }

        // If the accepted answer is deleted, the thread is no longer resolved
        if (Boolean.TRUE.equals(reply.getIsAccepted())) {
            DiscussionThread thread = reply.getThread();
            thread.setIsResolved(false);
            threadRepository.save(thread);
        }

        voteRepository.deleteByTargetTypeAndTargetIdIn(VoteTargetType.REPLY, List.of(id));
        replyRepository.delete(reply);
    }

    // ---------- VOTING ----------

    public VoteResponse castVote(VoteRequest request, User voter) {
        if (request.getValue() != 1 && request.getValue() != -1) {
            throw ApiException.badRequest("Vote value must be 1 or -1");
        }

        User targetAuthor = request.getTargetType() == VoteTargetType.THREAD
                ? findThread(request.getTargetId()).getAuthor()
                : findReply(request.getTargetId()).getAuthor();

        if (targetAuthor.getId().equals(voter.getId())) {
            throw ApiException.badRequest("You cannot vote on your own post");
        }

        var existingVote = voteRepository.findByUserIdAndTargetTypeAndTargetId(
                voter.getId(), request.getTargetType(), request.getTargetId()
        );

        int delta;
        int userVote;

        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            if (vote.getValue().equals(request.getValue())) {
                // Same vote again -> remove the vote (toggle off)
                voteRepository.delete(vote);
                delta = -request.getValue();
                userVote = 0;
            } else {
                // Switching vote (e.g. upvote to downvote)
                delta = request.getValue() - vote.getValue();
                vote.setValue(request.getValue());
                voteRepository.save(vote);
                userVote = request.getValue();
            }
        } else {
            Vote vote = Vote.builder()
                    .targetType(request.getTargetType())
                    .targetId(request.getTargetId())
                    .value(request.getValue())
                    .user(voter)
                    .build();
            voteRepository.save(vote);
            delta = request.getValue();
            userVote = request.getValue();
        }

        int newScore = adjustVoteScore(request.getTargetType(), request.getTargetId(), delta);
        adjustReputation(targetAuthor, voter, delta * REPUTATION_PER_VOTE);

        return VoteResponse.builder()
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .voteScore(newScore)
                .userVote(userVote)
                .build();
    }

    private int adjustVoteScore(VoteTargetType targetType, Long targetId, int delta) {
        if (targetType == VoteTargetType.THREAD) {
            DiscussionThread thread = findThread(targetId);
            thread.setVoteScore(thread.getVoteScore() + delta);
            return threadRepository.save(thread).getVoteScore();
        } else {
            Reply reply = findReply(targetId);
            reply.setVoteScore(reply.getVoteScore() + delta);
            return replyRepository.save(reply).getVoteScore();
        }
    }

    // ---------- HELPERS ----------

    private DiscussionThread findThread(Long id) {
        return threadRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Thread not found"));
    }

    private Reply findReply(Long id) {
        return replyRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Reply not found"));
    }

    private boolean isModerator(User user) {
        return user.getRole() == Role.MODERATOR || user.getRole() == Role.ADMIN;
    }

    /** Changes a user's reputation, ignoring changes a user would cause on themselves. */
    private void adjustReputation(User user, User actor, int amount) {
        if (amount == 0 || user.getId().equals(actor.getId())) return;
        int current = user.getReputationScore() == null ? 0 : user.getReputationScore();
        user.setReputationScore(current + amount);
    }

    private String normalizeCourseTag(String courseTag) {
        if (courseTag == null || courseTag.isBlank()) return null;
        return courseTag.trim().toUpperCase().replaceAll("\\s+", "");
    }

    // ---------- MAPPERS ----------

    private List<ThreadResponse> mapThreads(List<DiscussionThread> threads) {
        return threads.stream()
                .map(this::mapThreadToResponse)
                .collect(Collectors.toList());
    }

    private ThreadResponse mapThreadToResponse(DiscussionThread thread) {
        int replyCount = (int) replyRepository.countByThreadId(thread.getId());

        return ThreadResponse.builder()
                .id(thread.getId())
                .title(thread.getTitle())
                .body(thread.getBody())
                .courseTag(thread.getCourseTag())
                .isResolved(thread.getIsResolved())
                .voteScore(thread.getVoteScore())
                .viewCount(thread.getViewCount())
                .replyCount(replyCount)
                .authorName(thread.getAuthor().getFirstName() + " " + thread.getAuthor().getLastName())
                .authorId(thread.getAuthor().getId())
                .createdAt(thread.getCreatedAt())
                .build();
    }

    private ReplyResponse mapReplyToResponse(Reply reply) {
        return ReplyResponse.builder()
                .id(reply.getId())
                .body(reply.getBody())
                .isAccepted(reply.getIsAccepted())
                .voteScore(reply.getVoteScore())
                .threadId(reply.getThread().getId())
                .authorName(reply.getAuthor().getFirstName() + " " + reply.getAuthor().getLastName())
                .authorId(reply.getAuthor().getId())
                .createdAt(reply.getCreatedAt())
                .build();
    }
}
