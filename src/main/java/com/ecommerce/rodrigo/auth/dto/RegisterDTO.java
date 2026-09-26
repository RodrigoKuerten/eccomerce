package com.ecommerce.rodrigo.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record RegisterDTO(
        @NotBlank(message = "O email é obrigatório")
        @Email(message = "O email deve ser válido")
        @Size(max = 254, message = "O email deve ter no máximo 254 caracteres")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(max = 72, message = "A senha deve ter no máximo 72 caracteres")
        String password,

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String fullName,

        @NotBlank(message = "O endereço é obrigatório")
        @Size(max = 500, message = "O endereço deve ter no máximo 500 caracteres")
        String address,

        @NotBlank(message = "O número de telefone é obrigatório")
        @Size(max = 30, message = "O telefone deve ter no máximo 30 caracteres")
        String phoneNumber
) {}
