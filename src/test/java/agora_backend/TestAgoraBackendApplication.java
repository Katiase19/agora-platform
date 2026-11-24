package agora_backend;

import org.springframework.boot.SpringApplication;

/**
 * Runs the backend with the test classpath, i.e. with an in-memory H2 database
 * instead of MySQL. Handy for frontend development and demos:
 *
 *   ./mvnw spring-boot:test-run
 *
 * Data is lost when the server stops.
 */
public class TestAgoraBackendApplication {

    public static void main(String[] args) {
        SpringApplication.from(AgoraBackendApplication::main).run(args);
    }
}
