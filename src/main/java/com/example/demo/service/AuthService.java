package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.exception.AppException;
import com.example.demo.repository.*;
import com.example.demo.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;

    @Transactional
    public AuthResponse register(RegisterRequest req, HttpServletResponse response) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new AppException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .fullName(sanitize(req.getFullName()))
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .shopName(sanitize(req.getShopName()))
                .build();

        userRepository.save(user);
        return issueTokens(user, response);
    }

    @Transactional
    public AuthResponse login(LoginRequest req, HttpServletResponse response) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new AppException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        if (user.getLockUntil() != null && user.getLockUntil().isAfter(LocalDateTime.now())) {
            throw new AppException("Account locked. Try again after " + LOCK_MINUTES + " minutes", HttpStatus.LOCKED);
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
            }
            userRepository.save(user);
            throw new AppException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        userRepository.save(user);

        return issueTokens(user, response);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken, HttpServletResponse response) {
        if (rawRefreshToken == null || !jwtUtil.validateRefreshToken(rawRefreshToken)) {
            throw new AppException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED);
        }

        String tokenHash = hash(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AppException("Refresh token not found", HttpStatus.UNAUTHORIZED));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException("Refresh token expired or revoked", HttpStatus.UNAUTHORIZED);
        }

        // Rotate — revoke old, issue new
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return issueTokens(stored.getUser(), response);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null) return;
        String tokenHash = hash(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email.toLowerCase()).ifPresent(user -> {
            otpRepository.invalidateAllByEmail(email.toLowerCase());
            String otp = String.format("%06d", new Random().nextInt(999999));
            PasswordResetOtp entity = PasswordResetOtp.builder()
                    .email(email.toLowerCase())
                    .otp(otp)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build();
            otpRepository.save(entity);
            emailService.sendOtp(email, otp);
        });
        // Always return success to prevent email enumeration
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetOtp otpEntity = otpRepository
                .findTopByEmailAndUsedFalseOrderByExpiresAtDesc(req.getEmail().toLowerCase())
                .orElseThrow(() -> new AppException("Invalid or expired OTP", HttpStatus.BAD_REQUEST));

        if (otpEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException("OTP has expired", HttpStatus.BAD_REQUEST);
        }

        if (!otpEntity.getOtp().equals(req.getOtp())) {
            throw new AppException("Invalid OTP", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);

        // Revoke all refresh tokens on password reset
        refreshTokenRepository.revokeAllByUser(user);
    }

    // --- Helpers ---

    private AuthResponse issueTokens(User user, HttpServletResponse response) {
        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        RefreshToken tokenEntity = RefreshToken.builder()
                .tokenHash(hash(refreshToken))
                .user(user)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(tokenEntity);

        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth/refresh");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        // cookie.setSecure(true); // Enable in production (HTTPS)
        response.addCookie(cookie);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .shopName(user.getShopName())
                .build();
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Hashing failed", e);
        }
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.replaceAll("[<>\"'%;()&+]", "").trim();
    }
}
