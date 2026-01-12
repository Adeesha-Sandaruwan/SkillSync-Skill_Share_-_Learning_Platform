package com.learning.lms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // e.g., "EXPERIENCE", "CERTIFICATE"
    private String title;
    private String company; // or issuer
    private String years; // or date

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}