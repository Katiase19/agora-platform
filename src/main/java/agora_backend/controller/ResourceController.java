package agora_backend.controller;

import agora_backend.dto.request.ResourceUploadRequest;
import agora_backend.dto.response.ResourceResponse;
import agora_backend.entity.ResourceType;
import agora_backend.entity.User;
import agora_backend.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<ResourceResponse> uploadResource(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("resourceType") ResourceType resourceType,
            @RequestParam("courseCode") String courseCode,
            @RequestParam(value = "courseName", required = false) String courseName,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "semester", required = false) String semester,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User uploader
    ) {
        ResourceUploadRequest request = ResourceUploadRequest.builder()
                .title(title)
                .description(description)
                .resourceType(resourceType)
                .courseCode(courseCode)
                .courseName(courseName)
                .year(year)
                .semester(semester)
                .build();

        return ResponseEntity.ok(resourceService.uploadResource(request, file, uploader));
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ResourceResponse>> searchResources(@RequestParam String keyword) {
        return ResponseEntity.ok(resourceService.searchResources(keyword));
    }

    @GetMapping("/course/{courseCode}")
    public ResponseEntity<List<ResourceResponse>> getResourcesByCourse(@PathVariable String courseCode) {
        return ResponseEntity.ok(resourceService.getResourcesByCourse(courseCode));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<ResourceResponse>> getTrendingResources() {
        return ResponseEntity.ok(resourceService.getTrendingResources());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ResourceResponse>> getRecentResources() {
        return ResponseEntity.ok(resourceService.getRecentResources());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long id,
            @AuthenticationPrincipal User requester
    ) {
        resourceService.deleteResource(id, requester.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<String> downloadResource(@PathVariable Long id) {
        String fileUrl = resourceService.incrementDownloadCount(id);
        return ResponseEntity.ok(fileUrl);
    }
}