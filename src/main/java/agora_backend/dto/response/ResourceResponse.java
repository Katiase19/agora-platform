package agora_backend.dto.response;

import agora_backend.entity.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResourceResponse {

    private Long id;
    private String title;
    private String description;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private ResourceType resourceType;
    private String courseCode;
    private String courseName;
    private Integer year;
    private String semester;
    private Double averageRating;
    private Integer downloadCount;
    private Integer viewCount;
    private String uploaderName;
    private Long uploaderId;
    private LocalDateTime createdAt;
}