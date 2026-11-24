package agora_backend.controller;

import agora_backend.dto.request.CreateReplyRequest;
import agora_backend.dto.request.CreateThreadRequest;
import agora_backend.dto.request.VoteRequest;
import agora_backend.dto.response.ReplyResponse;
import agora_backend.dto.response.ThreadResponse;
import agora_backend.dto.response.VoteResponse;
import agora_backend.entity.User;
import agora_backend.service.ForumService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Discussion Forum", description = "Endpoints for threads, replies, voting and accepted answers")
@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    // ---------- THREADS ----------

    @Operation(summary = "Create a new discussion thread")
    @PostMapping("/threads")
    public ResponseEntity<ThreadResponse> createThread(
            @Valid @RequestBody CreateThreadRequest request,
            @AuthenticationPrincipal User author
    ) {
        return ResponseEntity.ok(forumService.createThread(request, author));
    }

    @Operation(summary = "Get all discussion threads (newest first)")
    @GetMapping("/threads")
    public ResponseEntity<List<ThreadResponse>> getAllThreads() {
        return ResponseEntity.ok(forumService.getAllThreads());
    }

    @Operation(summary = "Get a thread by ID (also increments view count)")
    @GetMapping("/threads/{id}")
    public ResponseEntity<ThreadResponse> getThreadById(
            @PathVariable Long id,
            @AuthenticationPrincipal User viewer
    ) {
        return ResponseEntity.ok(forumService.getThreadById(id, viewer));
    }

    @Operation(summary = "Update a thread (author only)")
    @PutMapping("/threads/{id}")
    public ResponseEntity<ThreadResponse> updateThread(
            @PathVariable Long id,
            @Valid @RequestBody CreateThreadRequest request,
            @AuthenticationPrincipal User requester
    ) {
        return ResponseEntity.ok(forumService.updateThread(id, request, requester));
    }

    @Operation(summary = "Get threads by course tag")
    @GetMapping("/threads/course/{courseTag}")
    public ResponseEntity<List<ThreadResponse>> getThreadsByCourse(@PathVariable String courseTag) {
        return ResponseEntity.ok(forumService.getThreadsByCourse(courseTag));
    }

    @Operation(summary = "Get threads posted by a user")
    @GetMapping("/threads/user/{userId}")
    public ResponseEntity<List<ThreadResponse>> getThreadsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(forumService.getThreadsByAuthor(userId));
    }

    @Operation(summary = "Search threads by keyword")
    @GetMapping("/threads/search")
    public ResponseEntity<List<ThreadResponse>> searchThreads(@RequestParam String keyword) {
        return ResponseEntity.ok(forumService.searchThreads(keyword));
    }

    @Operation(summary = "Get the 20 most recent threads")
    @GetMapping("/threads/recent")
    public ResponseEntity<List<ThreadResponse>> getRecentThreads() {
        return ResponseEntity.ok(forumService.getRecentThreads());
    }

    @Operation(summary = "Get the 20 top voted threads")
    @GetMapping("/threads/top")
    public ResponseEntity<List<ThreadResponse>> getTopThreads() {
        return ResponseEntity.ok(forumService.getTopThreads());
    }

    @Operation(summary = "Get all course tags used in the forum")
    @GetMapping("/courses")
    public ResponseEntity<List<String>> getCourseTags() {
        return ResponseEntity.ok(forumService.getCourseTags());
    }

    @Operation(summary = "Delete a thread (author or moderator only)")
    @DeleteMapping("/threads/{id}")
    public ResponseEntity<Void> deleteThread(
            @PathVariable Long id,
            @AuthenticationPrincipal User requester
    ) {
        forumService.deleteThread(id, requester);
        return ResponseEntity.noContent().build();
    }

    // ---------- REPLIES ----------

    @Operation(summary = "Reply to a discussion thread")
    @PostMapping("/threads/{threadId}/replies")
    public ResponseEntity<ReplyResponse> createReply(
            @PathVariable Long threadId,
            @Valid @RequestBody CreateReplyRequest request,
            @AuthenticationPrincipal User author
    ) {
        return ResponseEntity.ok(forumService.createReply(threadId, request, author));
    }

    @Operation(summary = "Get all replies for a thread (accepted answer first, then by vote score)")
    @GetMapping("/threads/{threadId}/replies")
    public ResponseEntity<List<ReplyResponse>> getRepliesByThread(
            @PathVariable Long threadId,
            @AuthenticationPrincipal User viewer
    ) {
        return ResponseEntity.ok(forumService.getRepliesByThread(threadId, viewer));
    }

    @Operation(summary = "Mark (or unmark) a reply as the accepted answer (thread author only)")
    @PatchMapping("/threads/{threadId}/replies/{replyId}/accept")
    public ResponseEntity<ReplyResponse> markAsAccepted(
            @PathVariable Long threadId,
            @PathVariable Long replyId,
            @AuthenticationPrincipal User requester
    ) {
        return ResponseEntity.ok(forumService.markAsAccepted(replyId, threadId, requester));
    }

    @Operation(summary = "Update a reply (author only)")
    @PutMapping("/replies/{id}")
    public ResponseEntity<ReplyResponse> updateReply(
            @PathVariable Long id,
            @Valid @RequestBody CreateReplyRequest request,
            @AuthenticationPrincipal User requester
    ) {
        return ResponseEntity.ok(forumService.updateReply(id, request, requester));
    }

    @Operation(summary = "Delete a reply (author or moderator only)")
    @DeleteMapping("/replies/{id}")
    public ResponseEntity<Void> deleteReply(
            @PathVariable Long id,
            @AuthenticationPrincipal User requester
    ) {
        forumService.deleteReply(id, requester);
        return ResponseEntity.noContent().build();
    }

    // ---------- VOTES ----------

    @Operation(summary = "Cast an upvote (+1) or downvote (-1) on a thread or reply. Voting the same way twice removes the vote.")
    @PostMapping("/votes")
    public ResponseEntity<VoteResponse> castVote(
            @Valid @RequestBody VoteRequest request,
            @AuthenticationPrincipal User voter
    ) {
        return ResponseEntity.ok(forumService.castVote(request, voter));
    }
}
