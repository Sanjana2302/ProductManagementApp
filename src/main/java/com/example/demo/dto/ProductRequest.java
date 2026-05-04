package com.example.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal price;

    @Min(0)
    private int stockQty;

    @Min(0)
    private int lowStockThreshold;
}
