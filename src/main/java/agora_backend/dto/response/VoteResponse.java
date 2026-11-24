package agora_backend.dto.response;

import agora_backend.entity.VoteTargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result of casting a vote: the new score of the target and the
 * current user's vote on it (1, -1, or 0 if the vote was toggled off).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VoteResponse {

    private VoteTargetType targetType;
    private Long targetId;
    private Integer voteScore;
    private Integer userVote;
}
