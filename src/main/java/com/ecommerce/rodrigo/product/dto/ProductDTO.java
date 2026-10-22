package com.ecommerce.rodrigo.product.dto;

import java.math.BigDecimal;

public record ProductDTO(
        Integer id,
        String name,
        String description,
        String category,
        String icon,
        BigDecimal price,
        BigDecimal oldPrice,
        String seller,
        double rating,
        int reviews,
        int quantity,
        boolean available,
        boolean freeShipping
) {}
