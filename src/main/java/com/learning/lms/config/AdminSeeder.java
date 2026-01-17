package com.learning.lms.config;

import com.learning.lms.entity.Role;
import com.learning.lms.entity.User;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .firstname("Super")
                    .lastname("Admin")
                    .username("admin")
                    .email("admin@skillsync.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .bio("System Administrator")
                    .build();
            userRepository.save(admin);
            System.out.println("✅ ADMIN USER CREATED: Username: admin | Pass: admin123");
        }
    }
}