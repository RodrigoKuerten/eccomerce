package com.ecommerce.rodrigo.order.exception;

import org.springframework.http.HttpStatus;

public class OrderException extends RuntimeException {
    private final HttpStatus httpStatus;

    public OrderException(HttpStatus httpStatus, String message) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
