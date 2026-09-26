package com.ecommerce.rodrigo.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record LoginDTO(
        @NotBlank(message = "O email é obrigatório")
        @Email(message = "O email deve ser válido")
        @Size(max = 254, message = "O email deve ter no máximo 254 caracteres")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(max = 72, message = "A senha deve ter no máximo 72 caracteres")
        String password
) {}
