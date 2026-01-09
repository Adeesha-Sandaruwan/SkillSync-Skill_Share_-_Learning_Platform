package com.learning.lms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. Get the absolute path to the "uploads" folder in your project
        Path uploadDir = Paths.get("uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        // 2. Fix for Windows: Convert backslashes to forward slashes and add "file:///"
        // Example result: file:///D:/lms/SkillSync.../uploads/
        if (uploadPath.startsWith("/")) {
            // Mac/Linux
            uploadPath = "file:" + uploadPath + "/";
        } else {
            // Windows
            uploadPath = "file:///" + uploadPath.replace("\\", "/") + "/";
        }

        // 3. Map the URL "/uploads/**" to this file system path
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}