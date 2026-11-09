package com.ecommerce.rodrigo.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderDTO(
        Integer id,
        String status,
        int quantity,
        BigDecimal total,
        LocalDateTime createdAt,
        Integer productId,
        String productName,
        boolean productHasImage
) {
}
