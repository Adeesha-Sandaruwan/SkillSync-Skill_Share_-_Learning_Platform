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

    // UPDATE THIS FIELD: Allow large strings (Base64 images)
    @Column(columnDefinition = "LONGTEXT")
    // Note: If you use PostgreSQL, use @Column(columnDefinition="TEXT")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // ... (Keep your relationships/OneToMany mappings exactly as they were)
    // Example:
    // @OneToMany(mappedBy = "user")
    // private List<SkillPost> posts;
}