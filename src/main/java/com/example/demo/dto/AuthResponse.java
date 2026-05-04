package com.example.demo.dto;

import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class AuthResponse {
    private String accessToken;
    private String fullName;
    private String email;
    private String shopName;
}
