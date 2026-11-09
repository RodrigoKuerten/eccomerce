package com.ecommerce.rodrigo.seller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SellerUpgradeDTO(
        @NotBlank(message = "O nome da loja é obrigatório.")
        @Size(max = 150, message = "O nome da loja deve ter no máximo 150 caracteres.")
        String storeName,

        @NotBlank(message = "A descrição da loja é obrigatória.")
        @Size(max = 2000, message = "A descrição deve ter no máximo 2000 caracteres.")
        String storeDescription,

        @Size(max = 14, message = "O CPF deve ter no máximo 14 caracteres.")
        String cpf
) {
}
