package com.ecommerce.rodrigo.product.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RemoveQuantityProductDTO(
        @NotNull(message = "Id é obrigatório para remover quantidade ao produto!")
        Integer id,

        @NotNull(message = "A quantidade é obrigatória para remover no produto!")
        @Positive(message = "A quantidade precisa ser maior que 1 para remover ao produto!")
        int quantity
) {}
