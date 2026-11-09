package com.ecommerce.rodrigo.auth;

import com.ecommerce.rodrigo.auth.dto.LoginDTO;
import com.ecommerce.rodrigo.auth.dto.RegisterDTO;
import com.ecommerce.rodrigo.auth.dto.SellerRegistrationDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterDTO registerDTO, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(registerDTO, request));
    }

    @PostMapping("/register-seller")
    public ResponseEntity<AuthResponse> registerSeller(@Valid @RequestBody SellerRegistrationDTO sellerRegistrationDTO, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerSeller(sellerRegistrationDTO, request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginDTO loginDTO, HttpServletRequest request) {
        return ResponseEntity.ok(authService.login(loginDTO, request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthService.SessionUser> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(authService.me(authentication));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(new AuthResponse("Sessão encerrada."));
    }

    public record AuthResponse(String message) {}
}
