package agora_backend.dto.request;

import agora_backend.entity.VoteTargetType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VoteRequest {

    @NotNull(message = "Target type is required")
    private VoteTargetType targetType;

    @NotNull(message = "Target ID is required")
    private Long targetId;

    @NotNull(message = "Vote value is required")
    @Min(value = -1, message = "Vote value must be 1 or -1")
    @Max(value = 1, message = "Vote value must be 1 or -1")
    private Integer value;
}