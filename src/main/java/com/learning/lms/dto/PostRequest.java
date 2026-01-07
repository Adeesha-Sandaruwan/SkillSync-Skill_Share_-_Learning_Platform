package com.learning.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class PostRequest {

    @NotBlank
    private String description;

    private List<String> mediaUrls;
}