package agora_backend.service;

import agora_backend.dto.request.ResourceUploadRequest;
import agora_backend.dto.response.ResourceResponse;
import agora_backend.entity.Resource;
import agora_backend.entity.Role;
import agora_backend.exception.ApiException;
import agora_backend.entity.User;
import agora_backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final FileStorageService fileStorageService;

    public ResourceResponse uploadResource(
            ResourceUploadRequest request,
            MultipartFile file,
            User uploader
    ) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Please choose a file to upload");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw ApiException.badRequest("Title is required");
        }
        if (request.getCourseCode() == null || request.getCourseCode().isBlank()) {
            throw ApiException.badRequest("Course code is required");
        }

        // Store the file on disk and get back its URL
        String fileUrl = fileStorageService.storeFile(file);

        // Get the file extension as the file type
        String originalFileName = file.getOriginalFilename();
        String fileType = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileType = originalFileName.substring(originalFileName.lastIndexOf(".") + 1).toUpperCase();
        }

        // Build the Resource entity
        Resource resource = Resource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .fileUrl(fileUrl)
                .fileName(originalFileName)
                .fileType(fileType)
                .resourceType(request.getResourceType())
                .courseCode(request.getCourseCode().trim().toUpperCase().replaceAll("\\s+", ""))
                .courseName(request.getCourseName())
                .year(request.getYear())
                .semester(request.getSemester())
                .uploader(uploader)
                .downloadCount(0)
                .viewCount(0)
                .averageRating(0.0)
                .build();

        Resource savedResource = resourceRepository.save(resource);

        return mapToResponse(savedResource);
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ResourceResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Resource not found"));

        // Increment view count every time someone views the resource
        resource.setViewCount(resource.getViewCount() + 1);
        resourceRepository.save(resource);

        return mapToResponse(resource);
    }

    public List<ResourceResponse> searchResources(String keyword) {
        return resourceRepository.searchByKeyword(keyword)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ResourceResponse> getResourcesByCourse(String courseCode) {
        return resourceRepository.findByCourseCode(courseCode)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ResourceResponse> getResourcesByUploader(Long uploaderId) {
        return resourceRepository.findByUploaderIdOrderByCreatedAtDesc(uploaderId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ResourceResponse> getTrendingResources() {
        return resourceRepository.findTop10ByOrderByDownloadCountDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ResourceResponse> getRecentResources() {
        return resourceRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteResource(Long id, User requester) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Resource not found"));

        // Only the uploader (or a moderator/admin) can delete a resource
        boolean isModerator = requester.getRole() == Role.MODERATOR || requester.getRole() == Role.ADMIN;
        if (!resource.getUploader().getId().equals(requester.getId()) && !isModerator) {
            throw ApiException.forbidden("You are not authorized to delete this resource");
        }

        fileStorageService.deleteFile(resource.getFileUrl());
        resourceRepository.delete(resource);
    }

    public String incrementDownloadCount(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Resource not found"));

        resource.setDownloadCount(resource.getDownloadCount() + 1);
        resourceRepository.save(resource);

        return resource.getFileUrl();
    }

    private ResourceResponse mapToResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .fileUrl(resource.getFileUrl())
                .fileName(resource.getFileName())
                .fileType(resource.getFileType())
                .resourceType(resource.getResourceType())
                .courseCode(resource.getCourseCode())
                .courseName(resource.getCourseName())
                .year(resource.getYear())
                .semester(resource.getSemester())
                .averageRating(resource.getAverageRating())
                .downloadCount(resource.getDownloadCount())
                .viewCount(resource.getViewCount())
                .uploaderName(resource.getUploader().getFirstName() + " " + resource.getUploader().getLastName())
                .uploaderId(resource.getUploader().getId())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}