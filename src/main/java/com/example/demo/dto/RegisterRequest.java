package com.example.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String fullName;

    @NotBlank @Email
    private String email;

    @NotBlank
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "Password must be 8+ chars with uppercase, lowercase, number and special character"
    )
    private String password;

    @NotBlank
    private String shopName;
}
