package com.example.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class EditProductRequest {

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal price;

    // Can be positive (restock) or negative (sell)
    private Integer addStockQty;
}