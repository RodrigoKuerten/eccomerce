package com.ecommerce.rodrigo.config;

import com.ecommerce.rodrigo.auth.exception.AuthException;
import com.ecommerce.rodrigo.order.exception.OrderException;
import com.ecommerce.rodrigo.product.ProductException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({AuthException.class, OrderException.class, ProductException.class})
    public ResponseEntity<Map<String, String>> handleBusinessException(RuntimeException exception) {
        var status = switch (exception) {
            case AuthException error -> error.getHttpStatus();
            case OrderException error -> error.getHttpStatus();
            case ProductException error -> error.getHttpStatus();
            default -> throw new IllegalStateException("Exceção não suportada", exception);
        };

        return ResponseEntity.status(status).body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException exception) {
        var message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Dados inválidos");
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}
