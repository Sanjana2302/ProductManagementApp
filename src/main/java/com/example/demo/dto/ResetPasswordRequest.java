package com.example.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6, max = 6)
    private String otp;

    @NotBlank
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "Password must be 8+ chars with uppercase, lowercase, number and special character"
    )
    private String newPassword;
}
