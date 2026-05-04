package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.exception.AppException;
import com.example.demo.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public List<ProductResponse> getProducts(String email, String search) {
        User user = getUser(email);
        String term = search == null ? "" : sanitize(search);
        return productRepository
                .findByUserAndDeletedFalseAndNameContainingIgnoreCase(user, term)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProductResponse addProduct(String email, ProductRequest req) {
        User user = getUser(email);
        Product product = Product.builder()
                .name(sanitize(req.getName()))
                .price(req.getPrice())
                .stockQty(req.getStockQty())
                .lowStockThreshold(req.getLowStockThreshold())
                .user(user)
                .build();
        productRepository.save(product);
        log(user, "ADDED", product.getName());
        return toResponse(product);
    }

    @Transactional
    public ProductResponse editProduct(String email, Long productId, EditProductRequest req) {
        User user = getUser(email);
        Product product = productRepository.findByIdAndUserAndDeletedFalse(productId, user)
                .orElseThrow(() -> new AppException("Product not found", HttpStatus.NOT_FOUND));

        product.setName(sanitize(req.getName()));
        product.setPrice(req.getPrice());
        product.setStockQty(product.getStockQty() + req.getAddStockQty());
        productRepository.save(product);
        log(user, "EDITED", product.getName());
        return toResponse(product);
    }

    @Transactional
    public void deleteProduct(String email, Long productId) {
        User user = getUser(email);
        Product product = productRepository.findByIdAndUserAndDeletedFalse(productId, user)
                .orElseThrow(() -> new AppException("Product not found", HttpStatus.NOT_FOUND));

        product.setDeleted(true);
        productRepository.save(product);
        log(user, "DELETED", product.getName());
    }

    // --- Helpers ---

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }

    private void log(User user, String action, String productName) {
        activityLogRepository.save(ActivityLog.builder()
                .user(user)
                .action(action)
                .productName(productName)
                .build());
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .stockQty(p.getStockQty())
                .lowStockThreshold(p.getLowStockThreshold())
                .lowStock(p.getStockQty() <= p.getLowStockThreshold())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private String sanitize(String input) {
        if (input == null) return "";
        return input.replaceAll("[<>\"'%;()&+]", "").trim();
    }
}
