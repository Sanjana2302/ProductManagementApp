package com.example.demo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class ActivityLogResponse {
    private String action;
    private String productName;
    private LocalDateTime timestamp;
}
