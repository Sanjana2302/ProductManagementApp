package com.example.demo.repository;

import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByUserAndDeletedFalseAndNameContainingIgnoreCase(User user, String name);

    List<Product> findByUserAndDeletedFalse(User user);

    Optional<Product> findByIdAndUserAndDeletedFalse(Long id, User user);

    long countByUserAndDeletedFalse(User user);

    @Query("SELECT COALESCE(SUM(p.price * p.stockQty), 0) FROM Product p WHERE p.user = :user AND p.deleted = false")
    BigDecimal sumInventoryValueByUser(User user);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.user = :user AND p.deleted = false AND p.stockQty <= p.lowStockThreshold")
    long countLowStockByUser(User user);
}
