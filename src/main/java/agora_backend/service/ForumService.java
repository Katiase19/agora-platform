package agora_backend.service;

import agora_backend.dto.request.CreateReplyRequest;
import agora_backend.dto.request.CreateThreadRequest;
import agora_backend.dto.request.VoteRequest;
import agora_backend.dto.response.ReplyResponse;
import agora_backend.dto.response.ThreadResponse;
import agora_backend.entity.*;
import agora_backend.repository.ReplyRepository;
import agora_backend.repository.ThreadRepository;
import agora_backend.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ThreadRepository threadRepository;
    private final ReplyRepository replyRepository;
    private final VoteRepository voteRepository;

    // ---------- THREADS ----------

    public ThreadResponse createThread(CreateThreadRequest request, User author) {
        DiscussionThread thread = DiscussionThread.builder()
                .title(request.getTitle())
                .body(request.getBody())
                .courseTag(request.getCourseTag())
                .author(author)
                .isResolved(false)
                .voteScore(0)
                .viewCount(0)
                .build();

        DiscussionThread saved = threadRepository.save(thread);
        return mapThreadToResponse(saved);
    }

    public List<ThreadResponse> getAllThreads() {
        return threadRepository.findAll()
                .stream()
                .map(this::mapThreadToResponse)
                .collect(Collectors.toList());
    }

    public ThreadResponse getThreadById(Long id) {
        DiscussionThread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        thread.setViewCount(thread.getViewCount() + 1);
        threadRepository.save(thread);

        return mapThreadToResponse(thread);
    }

    public List<ThreadResponse> getThreadsByCourse(String courseTag) {
        return threadRepository.findByCourseTag(courseTag)
                .stream()
                .map(this::mapThreadToResponse)
                .collect(Collectors.toList());
    }

    public List<ThreadResponse> searchThreads(String keyword) {
        return threadRepository.searchByKeyword(keyword)
                .stream()
                .map(this::mapThreadToResponse)
                .collect(Collectors.toList());
    }

    public List<ThreadResponse> getRecentThreads() {
        return threadRepository.findTop20ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapThreadToResponse)
                .collect(Collectors.toList());
    }

    public List<ThreadResponse> getTopThreads() {
        return threadRepository.findTop20ByOrderByVoteScoreDesc()
                .stream()
                .map(this::mapThreadToResponse)
                .collect(Collectors.toList());
    }

    public void deleteThread(Long id, Long requesterId) {
        DiscussionThread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        if (!thread.getAuthor().getId().equals(requesterId)) {
            throw new RuntimeException("You are not authorized to delete this thread");
        }

        threadRepository.delete(thread);
    }

    // ---------- REPLIES ----------

    public ReplyResponse createReply(Long threadId, CreateReplyRequest request, User author) {
        DiscussionThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        Reply reply = Reply.builder()
                .body(request.getBody())
                .thread(thread)
                .author(author)
                .isAccepted(false)
                .voteScore(0)
                .build();

        Reply saved = replyRepository.save(reply);
        return mapReplyToResponse(saved);
    }

    public List<ReplyResponse> getRepliesByThread(Long threadId) {
        return replyRepository.findByThreadIdOrderByVoteScoreDesc(threadId)
                .stream()
                .map(this::mapReplyToResponse)
                .collect(Collectors.toList());
    }

    public ReplyResponse markAsAccepted(Long replyId, Long threadId, Long requesterId) {
        DiscussionThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        // Only the thread author can mark an accepted answer
        if (!thread.getAuthor().getId().equals(requesterId)) {
            throw new RuntimeException("Only the thread author can mark an accepted answer");
        }

        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        reply.setIsAccepted(true);
        Reply saved = replyRepository.save(reply);

        thread.setIsResolved(true);
        threadRepository.save(thread);

        return mapReplyToResponse(saved);
    }

    public void deleteReply(Long id, Long requesterId) {
        Reply reply = replyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        if (!reply.getAuthor().getId().equals(requesterId)) {
            throw new RuntimeException("You are not authorized to delete this reply");
        }

        replyRepository.delete(reply);
    }

    // ---------- VOTING ----------

    public void castVote(VoteRequest request, User voter) {
        var existingVote = voteRepository.findByUserIdAndTargetTypeAndTargetId(
                voter.getId(), request.getTargetType(), request.getTargetId()
        );

        if (existingVote.isPresent()) {
            // User already voted - if same value, remove vote (toggle off)
            if (existingVote.get().getValue().equals(request.getValue())) {
                voteRepository.delete(existingVote.get());
                adjustVoteScore(request.getTargetType(), request.getTargetId(), -request.getValue());
                return;
            } else {
                // Switching vote (e.g. upvote to downvote)
                int scoreDifference = request.getValue() - existingVote.get().getValue();
                existingVote.get().setValue(request.getValue());
                voteRepository.save(existingVote.get());
                adjustVoteScore(request.getTargetType(), request.getTargetId(), scoreDifference);
                return;
            }
        }

        // New vote
        Vote vote = Vote.builder()
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .value(request.getValue())
                .user(voter)
                .build();

        voteRepository.save(vote);
        adjustVoteScore(request.getTargetType(), request.getTargetId(), request.getValue());
    }

    private void adjustVoteScore(VoteTargetType targetType, Long targetId, int delta) {
        if (targetType == VoteTargetType.THREAD) {
            DiscussionThread thread = threadRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Thread not found"));
            thread.setVoteScore(thread.getVoteScore() + delta);
            threadRepository.save(thread);
        } else {
            Reply reply = replyRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Reply not found"));
            reply.setVoteScore(reply.getVoteScore() + delta);
            replyRepository.save(reply);
        }
    }

    // ---------- MAPPERS ----------

    private ThreadResponse mapThreadToResponse(DiscussionThread thread) {
        int replyCount = replyRepository.findByThreadIdOrderByVoteScoreDesc(thread.getId()).size();

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