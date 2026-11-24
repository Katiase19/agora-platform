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
public class ReplyResponse {

    private Long id;
    private String body;
    private Boolean isAccepted;
    private Integer voteScore;
    private Long threadId;
    private String authorName;
    private Long authorId;
    private LocalDateTime createdAt;

    // The logged-in user's vote on this item: 1, -1 or 0 (null when not known)
    private Integer userVote;
}