package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.AuthService;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req,
                                                  HttpServletResponse response) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req, response));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req,
                                               HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(req, response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request,
                                                 HttpServletResponse response) {
        String token = extractRefreshCookie(request);
        return ResponseEntity.ok(authService.refresh(token, response));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request,
                                                       HttpServletResponse response) {
        String token = extractRefreshCookie(request);
        authService.logout(token);

        Cookie clear = new Cookie("refreshToken", "");
        clear.setHttpOnly(true);
        clear.setPath("/api/auth/refresh");
        clear.setMaxAge(0);
        response.addCookie(clear);

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req.getEmail());
        return ResponseEntity.ok(Map.of("message", "If that email exists, an OTP has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
