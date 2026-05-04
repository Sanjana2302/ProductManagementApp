package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.User;
import com.example.demo.exception.AppException;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardResponse getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        List<ActivityLogResponse> recentActivity = activityLogRepository
                .findByUserOrderByTimestampDesc(user, PageRequest.of(0, 10))
                .stream()
                .map(log -> ActivityLogResponse.builder()
                        .action(log.getAction())
                        .productName(log.getProductName())
                        .timestamp(log.getTimestamp())
                        .build())
                .toList();

        return DashboardResponse.builder()
                .totalProducts(productRepository.countByUserAndDeletedFalse(user))
                .totalInventoryValue(productRepository.sumInventoryValueByUser(user))
                .lowStockCount(productRepository.countLowStockByUser(user))
                .recentActivity(recentActivity)
                .build();
    }
}
