package agora_backend.controller;

import agora_backend.dto.request.ResourceUploadRequest;
import agora_backend.dto.response.ResourceResponse;
import agora_backend.entity.ResourceType;
import agora_backend.entity.User;
import agora_backend.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Resources", description = "Endpoints for uploading, browsing, searching and downloading study materials")
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    @Operation(summary = "Upload a newstudey resource (lecture notes, past questions etc.)")
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

    @Operation(summary = "Get all available resources")
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @Operation(summary = "Get a resource by ID (also increments view count)")
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @Operation(summary = "Search resources by keywords in title, description or course code")
    @GetMapping("/search")
    public ResponseEntity<List<ResourceResponse>> searchResources(@RequestParam String keyword) {
        return ResponseEntity.ok(resourceService.searchResources(keyword));
    }

    @Operation(summary = "Get all resources for a specific course code")
    @GetMapping("/course/{courseCode}")
    public ResponseEntity<List<ResourceResponse>> getResourcesByCourse(@PathVariable String courseCode) {
        return ResponseEntity.ok(resourceService.getResourcesByCourse(courseCode));
    }

    @Operation(summary = "Get the top 10 most downloaded resources")
    @GetMapping("/trending")
    public ResponseEntity<List<ResourceResponse>> getTrendingResources() {
        return ResponseEntity.ok(resourceService.getTrendingResources());
    }

    @Operation(summary = "Get the top 10 most recently uploaded resources")
    @GetMapping("/recent")
    public ResponseEntity<List<ResourceResponse>> getRecentResources() {
        return ResponseEntity.ok(resourceService.getRecentResources());
    }

    @Operation(summary = "Delete a resource (only the uploader can delete their own resource)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long id,
            @AuthenticationPrincipal User requester
    ) {
        resourceService.deleteResource(id, requester.getId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Increment download count and get the file URL for downloading")
    @GetMapping("/{id}/download")
    public ResponseEntity<String> downloadResource(@PathVariable Long id) {
        String fileUrl = resourceService.incrementDownloadCount(id);
        return ResponseEntity.ok(fileUrl);
    }
}