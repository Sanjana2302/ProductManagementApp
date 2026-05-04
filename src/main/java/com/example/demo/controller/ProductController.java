package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(required = false, defaultValue = "") String search) {
        return ResponseEntity.ok(productService.getProducts(user.getUsername(), search));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> addProduct(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ProductRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.addProduct(user.getUsername(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> editProduct(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody EditProductRequest req) {
        return ResponseEntity.ok(productService.editProduct(user.getUsername(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        productService.deleteProduct(user.getUsername(), id);
        return ResponseEntity.ok(Map.of("message", "Product deleted"));
    }
}
