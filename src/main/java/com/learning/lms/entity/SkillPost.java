package com.learning.lms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "skill_posts")
public class SkillPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String description;

    private String imageUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // CHANGED TO LAZY
    // JsonIgnoreProperties helps avoid serialization errors with Lazy objects
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "posts", "followers", "following", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "plans", "progressUpdates", "comments"})
    private User user;

    @ElementCollection(fetch = FetchType.EAGER) // IDs are small, safe to keep Eager
    @CollectionTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "user_id")
    private Set<Long> likedUserIds = new HashSet<>();

    // CHANGED TO LAZY
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<Comment> comments = new ArrayList<>();
}