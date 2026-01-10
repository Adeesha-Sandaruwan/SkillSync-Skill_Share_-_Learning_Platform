package com.learning.lms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.learning.lms.enums.ReactionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @Column(length = 2000)
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "post_media", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "media_url")
    private List<String> mediaUrls = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "posts", "followers", "following", "plans", "progressUpdates", "comments", "hibernateLazyInitializer", "handler"})
    private User user;

    // --- NEW: LINK TO LEARNING PLAN (PROGRESS UPDATE) ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_plan_id")
    @JsonIgnoreProperties({"user", "steps", "hibernateLazyInitializer", "handler"})
    private LearningPlan learningPlan;
    // ----------------------------------------------------

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "post_reactions", joinColumns = @JoinColumn(name = "post_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "reaction_type")
    @Enumerated(EnumType.STRING)
    private Map<Long, ReactionType> reactions = new HashMap<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_post_id")
    @JsonIgnoreProperties({"comments", "reactions", "originalPost", "hibernateLazyInitializer", "handler"})
    private SkillPost originalPost;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<Comment> comments = new ArrayList<>();
}