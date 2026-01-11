package com.learning.lms.controller;

import com.learning.lms.entity.*;
import com.learning.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final ExperienceRepository experienceRepository;
    private final CertificateRepository certificateRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    // --- GET ALL PORTFOLIO ITEMS ---
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getPortfolio(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of(
                "experience", experienceRepository.findByUserId(userId),
                "certificates", certificateRepository.findByUserId(userId),
                "skills", skillRepository.findByUserId(userId)
        ));
    }

    // --- ADD ITEMS ---
    @PostMapping("/experience/{userId}")
    public ResponseEntity<Experience> addExp(@PathVariable Long userId, @RequestBody Experience req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        req.setUser(user);
        return ResponseEntity.ok(experienceRepository.save(req));
    }

    @PostMapping("/certificate/{userId}")
    public ResponseEntity<Certificate> addCert(@PathVariable Long userId, @RequestBody Certificate req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        req.setUser(user);
        return ResponseEntity.ok(certificateRepository.save(req));
    }

    @PostMapping("/skill/{userId}") // Front-end might send to /skill or /skills, adjusting for singular
    public ResponseEntity<Skill> addSkill(@PathVariable Long userId, @RequestBody Skill req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        req.setUser(user);
        return ResponseEntity.ok(skillRepository.save(req));
    }

    // --- DELETE ITEMS ---
    @DeleteMapping("/experience/{id}")
    public void deleteExp(@PathVariable Long id) { experienceRepository.deleteById(id); }

    @DeleteMapping("/certificate/{id}")
    public void deleteCert(@PathVariable Long id) { certificateRepository.deleteById(id); }

    @DeleteMapping("/skill/{id}")
    public void deleteSkill(@PathVariable Long id) { skillRepository.deleteById(id); }
}