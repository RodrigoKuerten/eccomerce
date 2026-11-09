package com.ecommerce.rodrigo.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordDTO(
        @NotBlank(message = "A senha atual é obrigatória.")
        String currentPassword,

        @NotBlank(message = "A nova senha é obrigatória.")
        @Size(max = 72, message = "A nova senha deve ter no máximo 72 caracteres.")
        String newPassword
) {
}
