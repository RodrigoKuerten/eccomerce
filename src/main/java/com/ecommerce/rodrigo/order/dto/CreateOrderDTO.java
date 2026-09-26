package com.ecommerce.rodrigo.order.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateOrderDTO(
        @NotNull(message = "O id do usuário é obrigatório!")
        Integer userId,

        @NotNull(message = "O id do produto é obrigatório!")
        Integer productId,

        @NotNull(message = "A quantidade é obrigatória!")
        @Positive(message = "A quantidade deve ser maior que zero!")
        Integer quantity
) {
}
