package com.ecommerce.rodrigo.account.dto;

public record AccountDTO(
        long id,
        String email,
        String fullName,
        String phoneNumber,
        String address,
        String cpf
) {
}
