package agora_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token;
    private UserResponse user;

    // Kept at the top level for backwards compatibility with existing clients
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
