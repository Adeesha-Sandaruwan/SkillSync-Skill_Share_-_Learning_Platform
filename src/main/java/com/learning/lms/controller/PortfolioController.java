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

    // --- GET ALL ---
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getPortfolio(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of(
                "experience", experienceRepository.findByUserId(userId),
                "certificates", certificateRepository.findByUserId(userId),
                "skills", skillRepository.findByUserId(userId)
        ));
    }

    // --- ADD ITEMS ---
    @PostMapping("/{userId}/experience")
    public ResponseEntity<Experience> addExp(@PathVariable Long userId, @RequestBody Experience req) {
        req.setUser(userRepository.findById(userId).orElseThrow());
        return ResponseEntity.ok(experienceRepository.save(req));
    }

    @PostMapping("/{userId}/certificate")
    public ResponseEntity<Certificate> addCert(@PathVariable Long userId, @RequestBody Certificate req) {
        req.setUser(userRepository.findById(userId).orElseThrow());
        return ResponseEntity.ok(certificateRepository.save(req));
    }

    @PostMapping("/{userId}/skill")
    public ResponseEntity<Skill> addSkill(@PathVariable Long userId, @RequestBody Skill req) {
        req.setUser(userRepository.findById(userId).orElseThrow());
        return ResponseEntity.ok(skillRepository.save(req));
    }

    // --- DELETE ---
    @DeleteMapping("/experience/{id}")
    public void deleteExp(@PathVariable Long id) { experienceRepository.deleteById(id); }

    @DeleteMapping("/certificate/{id}")
    public void deleteCert(@PathVariable Long id) { certificateRepository.deleteById(id); }

    @DeleteMapping("/skill/{id}")
    public void deleteSkill(@PathVariable Long id) { skillRepository.deleteById(id); }
}