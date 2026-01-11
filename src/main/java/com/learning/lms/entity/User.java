package com.learning.lms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_user")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstname;
    private String lastname;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    @JsonIgnore
    private String password;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    // --- GAMIFICATION FIELDS (Safe Defaults) ---
    @Column(nullable = false)
    private Integer xp = 0;

    @Column(nullable = false)
    private Integer level = 1;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_badges", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "badge_name")
    private Set<String> badges = new HashSet<>();

    // --- RELATIONSHIPS ---
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_following",
            joinColumns = @JoinColumn(name = "follower_id"),
            inverseJoinColumns = @JoinColumn(name = "following_id")
    )
    private Set<User> following = new HashSet<>();

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany(mappedBy = "following", fetch = FetchType.LAZY)
    private Set<User> followers = new HashSet<>();

    // --- SAFETY HOOK: Ensure values exist before saving ---
    @PrePersist
    @PreUpdate
    protected void onSave() {
        if (this.xp == null) this.xp = 0;
        if (this.level == null) this.level = 1;
        if (this.badges == null) this.badges = new HashSet<>();
    }

    // --- HELPER METHODS ---
    public void follow(User userToFollow) {
        this.following.add(userToFollow);
        userToFollow.getFollowers().add(this);
    }

    public void unfollow(User userToUnfollow) {
        this.following.remove(userToUnfollow);
        userToUnfollow.getFollowers().remove(this);
    }

    // --- SECURITY ---
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("USER"));
    }

    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return username; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}