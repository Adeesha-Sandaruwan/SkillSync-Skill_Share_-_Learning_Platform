package com.learning.lms.repository;

import com.learning.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    // We added this so AppConfig can find users by email
    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}