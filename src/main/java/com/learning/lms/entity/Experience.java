package com.learning.lms.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Experience {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String title;
    private String company;
    private String description;
    private String years; // e.g. "2020-2022"
    @ManyToOne @JoinColumn(name = "user_id") @JsonIgnore private User user;
}