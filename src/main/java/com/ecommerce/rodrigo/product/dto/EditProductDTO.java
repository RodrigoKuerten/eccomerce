package com.ecommerce.rodrigo.product.dto;

import com.ecommerce.rodrigo.product.ProductData;
import com.ecommerce.rodrigo.product.ProductTypeCategoriesEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record EditProductDTO(
        @NotNull(message = "O id é obrigatório para editar o produto!")
        Integer id,

        @NotBlank(message = "O nome do produto é obrigatório!")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String name,

        @NotBlank(message = "A descrição é obrigatória!")
        @Size(max = 2000, message = "A descrição deve ter no máximo 2000 caracteres")
        String description,

        @NotNull(message = "A categoria é obrigatória!")
        ProductTypeCategoriesEnum category,

        @NotNull(message = "O preço é obrigatório!")
        @Positive(message = "O preço tem que ser maior que zero!")
        BigDecimal price,

        @NotNull(message = "A quantidade de produtos é obrigatória")
        @Positive(message = "A quantidade de produtos tem que ser maior que zero")
        Integer quantity,

        @Size(max = 5_000_000, message = "A imagem deve ter no máximo 5 MB")
        byte[] image
) implements ProductData {}
