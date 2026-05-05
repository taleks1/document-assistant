package documentassistant.bootstrap;

import documentassistant.model.enums.Role;
import documentassistant.model.entity.User;
import documentassistant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/*DataHolder class for seeding the DB on startup for easier testing
*
* Creates 2 users with the following credentials:
*   email: johndoe@gmail.com password: johndoe123 role: CITIZEN
*   email: admin@gov.com     password: admin123   role: ADMIN
*
* */

@Configuration
@RequiredArgsConstructor
public class DataHolder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String @NonNull ... args) {
        if (userRepository.findByEmail("admin@gov.com").isEmpty()) {

            User admin = User.builder()
                    .firstname("Admin")
                    .lastname("User")
                    .email("admin@gov.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);
        }
        if (userRepository.findByEmail("johndoe@gmail.com").isEmpty()) {

            User admin = User.builder()
                    .firstname("John")
                    .lastname("Doe")
                    .email("johndoe@gmail.com")
                    .password(passwordEncoder.encode("johndoe123"))
                    .role(Role.CITIZEN)
                    .build();

            userRepository.save(admin);
        }
    }
}
