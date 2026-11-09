package com.ecommerce.rodrigo.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileDTO(
        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.")
        String fullName,

        @NotBlank(message = "O telefone é obrigatório.")
        @Size(max = 30, message = "O telefone deve ter no máximo 30 caracteres.")
        String phoneNumber,

        @NotBlank(message = "O endereço é obrigatório.")
        @Size(max = 500, message = "O endereço deve ter no máximo 500 caracteres.")
        String address,

        @Size(max = 14, message = "O CPF deve ter no máximo 14 caracteres.")
        String cpf
) {
}
