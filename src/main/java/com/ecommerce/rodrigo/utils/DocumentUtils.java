package com.ecommerce.rodrigo.utils;

public final class DocumentUtils {

    private DocumentUtils() {
    }

    public static String normalizeCpf(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.replaceAll("\\D", "");
    }

    public static boolean isValidCpf(String digits) {
        return digits != null && digits.matches("\\d{11}");
    }
}
