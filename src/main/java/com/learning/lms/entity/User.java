package com.learning.lms.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;
    // FIX: Change LONGTEXT to TEXT for PostgreSQL
    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // ... (Keep your relationships/OneToMany mappings exactly as they were)
    // Example:
    // @OneToMany(mappedBy = "user")
    // private List<SkillPost> posts;
}