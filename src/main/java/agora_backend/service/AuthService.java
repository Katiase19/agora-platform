package agora_backend.service;

import agora_backend.dto.request.LoginRequest;
import agora_backend.dto.request.RegisterRequest;
import agora_backend.dto.response.AuthResponse;
import agora_backend.dto.response.UserResponse;
import agora_backend.entity.Role;
import agora_backend.entity.User;
import agora_backend.exception.ApiException;
import agora_backend.repository.UserRepository;
import agora_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("An account with this email already exists");
        }

        // Build and save the new user
        var user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .courseOfStudy(request.getCourseOfStudy())
                .academicYear(request.getAcademicYear())
                .isVerified(false)
                .isActive(true)
                .reputationScore(0)
                .build();

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Authenticate the user (throws BadCredentialsException -> 401 if wrong)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        // If we get here, credentials are valid
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        return buildAuthResponse(user);
    }

    public UserResponse getProfile(Long userId) {
        // Re-read from the database so the reputation score is up to date
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        return UserResponse.from(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .user(UserResponse.from(user))
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
    }
}
