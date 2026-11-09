package com.ecommerce.rodrigo.user;

import com.ecommerce.rodrigo.auth.exception.AuthException;
import com.ecommerce.rodrigo.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class SessionUserService {

    private static final Logger log = LoggerFactory.getLogger(SessionUserService.class);

    private final UserRepository userRepository;

    public SessionUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User require(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Sessão inválida ou expirada.");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));
    }

    public User requireSeller(Authentication authentication) {
        User user = require(authentication);

        if (user.getRole() != UserRole.SELLER) {
            log.warn("requireSeller - Acesso negado: usuario nao e vendedor, userId={}, role={}", user.getId(), user.getRole());
            throw new AuthException(HttpStatus.FORBIDDEN, "Apenas vendedores podem acessar este recurso.");
        }

        return user;
    }

    public User requireSeller() {
        return requireSeller(SecurityContextHolder.getContext().getAuthentication());
    }
}
