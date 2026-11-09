package com.ecommerce.rodrigo.order;

import com.ecommerce.rodrigo.order.dto.OrderDTO;
import com.ecommerce.rodrigo.order.entity.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderDTO toDTO(Order order) {
        return new OrderDTO(
                order.getId(),
                order.getStatus(),
                order.getQuantity(),
                order.getTotal(),
                order.getCreatedAt(),
                order.getProduct().getId(),
                order.getProduct().getName(),
                order.getProduct().getImage() != null && order.getProduct().getImage().length > 0
        );
    }
}
