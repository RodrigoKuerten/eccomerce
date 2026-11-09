package com.ecommerce.rodrigo.utils;

import org.springframework.http.MediaType;

public final class ImageUtils {

    private ImageUtils() {
    }

    public static MediaType contentType(byte[] image) {
        if (image.length >= 8
                && (image[0] & 0xFF) == 0x89
                && image[1] == 'P'
                && image[2] == 'N'
                && image[3] == 'G') {
            return MediaType.IMAGE_PNG;
        }

        if (image.length >= 3
                && (image[0] & 0xFF) == 0xFF
                && (image[1] & 0xFF) == 0xD8
                && (image[2] & 0xFF) == 0xFF) {
            return MediaType.IMAGE_JPEG;
        }

        if (image.length >= 6
                && image[0] == 'G'
                && image[1] == 'I'
                && image[2] == 'F') {
            return MediaType.IMAGE_GIF;
        }

        if (image.length >= 12
                && image[0] == 'R'
                && image[1] == 'I'
                && image[2] == 'F'
                && image[3] == 'F'
                && image[8] == 'W'
                && image[9] == 'E'
                && image[10] == 'B'
                && image[11] == 'P') {
            return MediaType.parseMediaType("image/webp");
        }

        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
