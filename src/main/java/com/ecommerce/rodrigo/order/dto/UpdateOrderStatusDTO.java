package com.ecommerce.rodrigo.order.dto;

import com.ecommerce.rodrigo.order.OrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusDTO(
        @NotNull(message = "O id do pedido é obrigatório!")
        Integer id,

        @NotNull(message = "O status do pedido é obrigatório!")
        OrderStatus status
) {
}
