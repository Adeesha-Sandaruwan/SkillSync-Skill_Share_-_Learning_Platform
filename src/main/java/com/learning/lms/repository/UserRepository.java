package com.learning.lms.repository;

import com.learning.lms.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

    // --- SEARCH & DISCOVERY (Added Lastname check) ---
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.firstname) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.lastname) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchUsers(@Param("query") String query);

    @Query("SELECT u FROM User u WHERE u.id != :currentUserId AND u.id NOT IN " +
            "(SELECT f.id FROM User me JOIN me.following f WHERE me.id = :currentUserId)")
    List<User> findSuggestedUsers(@Param("currentUserId") Long currentUserId, Pageable pageable);
}