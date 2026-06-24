package agora_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ThreadResponse {

    private Long id;
    private String title;
    private String body;
    private String courseTag;
    private Boolean isResolved;
    private Integer voteScore;
    private Integer viewCount;
    private Integer replyCount;
    private String authorName;
    private Long authorId;
    private LocalDateTime createdAt;
}