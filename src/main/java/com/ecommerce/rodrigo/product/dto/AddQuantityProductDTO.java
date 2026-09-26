package com.ecommerce.rodrigo.product.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddQuantityProductDTO(
        @NotNull(message = "Id é obrigatório para adicionar quantidade ao produto!")
        Integer id,

        @NotNull(message = "A quantidade é obrigatória para adicionar no produto!")
        @Positive(message = "A quantidade precisa ser maior que 1 para adicionar ao produto!")
        int quantity
) {}
