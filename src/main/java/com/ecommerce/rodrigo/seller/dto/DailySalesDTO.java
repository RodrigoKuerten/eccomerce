package com.ecommerce.rodrigo.seller.dto;

import java.math.BigDecimal;

public record DailySalesDTO(
        String label,
        BigDecimal revenue,
        long orders
) {
}
