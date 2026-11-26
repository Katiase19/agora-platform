package agora_backend.controller;

import agora_backend.dto.response.ThreadResponse;
import agora_backend.entity.User;
import agora_backend.service.ForumService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Bookmarks", description = "Threads the logged-in user has saved")
@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final ForumService forumService;

    @Operation(summary = "Get your bookmarked threads, most recently saved first")
    @GetMapping
    public ResponseEntity<List<ThreadResponse>> getBookmarks(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(forumService.getBookmarkedThreads(user));
    }

    @Operation(summary = "Bookmark a thread")
    @PostMapping("/threads/{threadId}")
    public ResponseEntity<Map<String, Boolean>> addBookmark(@PathVariable Long threadId, @AuthenticationPrincipal User user) {
        forumService.addBookmark(threadId, user);
        return ResponseEntity.ok(Map.of("bookmarked", true));
    }

    @Operation(summary = "Remove a bookmark")
    @DeleteMapping("/threads/{threadId}")
    public ResponseEntity<Map<String, Boolean>> removeBookmark(@PathVariable Long threadId, @AuthenticationPrincipal User user) {
        forumService.removeBookmark(threadId, user);
        return ResponseEntity.ok(Map.of("bookmarked", false));
    }
}
