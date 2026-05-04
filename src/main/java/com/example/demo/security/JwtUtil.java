package com.example.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.access.secret}")
    private String accessSecret;

    @Value("${jwt.refresh.secret}")
    private String refreshSecret;

    @Value("${jwt.access.expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh.expiration}")
    private long refreshExpiration;

    private SecretKey accessKey() {
        return Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
    }

    private SecretKey refreshKey() {
        return Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(accessKey())
                .compact();
    }

    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(refreshKey())
                .compact();
    }

    public String extractEmailFromAccess(String token) {
        return Jwts.parser().verifyWith(accessKey()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public String extractEmailFromRefresh(String token) {
        return Jwts.parser().verifyWith(refreshKey()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validateAccessToken(String token) {
        try {
            Jwts.parser().verifyWith(accessKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        try {
            Jwts.parser().verifyWith(refreshKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
