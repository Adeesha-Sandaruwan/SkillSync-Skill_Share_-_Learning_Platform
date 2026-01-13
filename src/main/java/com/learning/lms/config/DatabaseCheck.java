package com.learning.lms.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DatabaseCheck {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @PostConstruct
    public void printConfig() {
        System.out.println("=================================================");
        System.out.println("🚨 CURRENT DATABASE URL: " + dbUrl);
        System.out.println("=================================================");
    }
}