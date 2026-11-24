package agora_backend.dto.response;

import agora_backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Public view of a user (never includes the password hash).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private Integer reputationScore;
    private String courseOfStudy;
    private Integer academicYear;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .reputationScore(user.getReputationScore())
                .courseOfStudy(user.getCourseOfStudy())
                .academicYear(user.getAcademicYear())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
