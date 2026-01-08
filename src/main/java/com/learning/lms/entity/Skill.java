package com.learning.lms.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity @Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Skill {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    @ManyToOne @JoinColumn(name = "user_id") @JsonIgnore private User user;
}