package agora_backend.controller;

import agora_backend.dto.request.CreateReplyRequest;
import agora_backend.dto.request.CreateThreadRequest;
import agora_backend.dto.request.VoteRequest;
import agora_backend.dto.response.ReplyResponse;
import agora_backend.dto.response.ThreadResponse;
import agora_backend.entity.User;
import agora_backend.service.ForumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ForumController {

    private final ForumService forumService;

    // ---------- THREADS ----------

    @PostMapping("/threads")
    public ResponseEntity<ThreadResponse> createThread(
            @Valid @RequestBody CreateThreadRequest request,
            @AuthenticationPrincipal User author
    ) {
        return ResponseEntity.ok(forumService.createThread(request, author));
    }

    @GetMapping("/threads")
    public ResponseEntity<List<ThreadResponse>> getAllThreads() {
        return ResponseEntity.ok(forumService.getAllThreads());
    }

    @GetMapping("/threads/{id}")
    public ResponseEntity<ThreadResponse> getThreadById(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getThreadById(id));
    }

    @GetMapping("/threads/course/{courseTag}")
    public ResponseEntity<List<ThreadResponse>> getThreadsByCourse(@PathVariable String courseTag) {
        return ResponseEntity.ok(forumService.getThreadsByCourse(courseTag));
    }

    @GetMapping("/threads/search")
    public ResponseEntity<List<ThreadResponse>> searchThreads(@RequestParam String keyword) {
        return ResponseEntity.ok(forumService.searchThreads(keyword));
    }

    @GetMapping("/threads/recent")
    public ResponseEntity<List<ThreadResponse>> getRecentThreads() {
        return ResponseEntity.ok(forumService.getRecentThreads());
    }

    @GetMapping("/threads/top")
    public ResponseEntity<List<ThreadResponse>> getTopThreads() {
        return ResponseEntity.ok(forumService.getTopThreads());
    }

    @DeleteMapping("/threads/{id}")
    public ResponseEntity<Void> deleteThread(
            @PathVariable Long id,
            @AuthenticationPrincipal User requester
    ) {
        forumService.deleteThread(id, requester.getId());
        return ResponseEntity.noContent().build();
    }

    // ---------- REPLIES ----------

    @PostMapping("/threads/{threadId}/replies")
    public ResponseEntity<ReplyResponse> createReply(
            @PathVariable Long threadId,
            @Valid @RequestBody CreateReplyRequest request,
            @AuthenticationPrincipal User author
    ) {
        return ResponseEntity.ok(forumService.createReply(threadId, request, author));
    }

    @GetMapping("/threads/{threadId}/replies")
    public ResponseEntity<List<ReplyResponse>> getRepliesByThread(@PathVariable Long threadId) {
        return ResponseEntity.ok(forumService.getRepliesByThread(threadId));
    }

    @PatchMapping("/threads/{threadId}/replies/{replyId}/accept")
    public ResponseEntity<ReplyResponse> markAsAccepted(
            @PathVariable Long threadId,
            @PathVariable Long replyId,
            @AuthenticationPrincipal User requester
    ) {
        return ResponseEntity.ok(forumService.markAsAccepted(replyId, threadId, requester.getId()));
    }

    @DeleteMapping("/replies/{id}")
    public ResponseEntity<Void> deleteReply(
            @PathVariable Long id,
            @AuthenticationPrincipal User requester
    ) {
        forumService.deleteReply(id, requester.getId());
        return ResponseEntity.noContent().build();
    }

    // ---------- VOTES ----------

    @PostMapping("/votes")
    public ResponseEntity<Void> castVote(
            @Valid @RequestBody VoteRequest request,
            @AuthenticationPrincipal User voter
    ) {
        forumService.castVote(request, voter);
        return ResponseEntity.ok().build();
    }
}