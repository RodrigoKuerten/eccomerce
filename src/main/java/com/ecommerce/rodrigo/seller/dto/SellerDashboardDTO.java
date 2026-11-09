package com.ecommerce.rodrigo.seller.dto;

import com.ecommerce.rodrigo.order.dto.OrderDTO;
import com.ecommerce.rodrigo.product.dto.ProductDTO;

import java.math.BigDecimal;
import java.util.List;

public record SellerDashboardDTO(
        long productCount,
        long totalStock,
        BigDecimal inventoryValue,
        long outOfStock,
        long orderCount,
        List<ProductDTO> products,
        List<OrderDTO> recentOrders,
        List<DailySalesDTO> salesLast7Days
) {
}
