package com.example.demo.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class ProductResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private int stockQty;
    private int lowStockThreshold;
    private boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
