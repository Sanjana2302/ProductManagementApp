package com.example.demo.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class DashboardResponse {
    private long totalProducts;
    private BigDecimal totalInventoryValue;
    private long lowStockCount;
    private List<ActivityLogResponse> recentActivity;
}
