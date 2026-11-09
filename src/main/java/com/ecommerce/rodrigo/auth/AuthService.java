package com.ecommerce.rodrigo.auth;

import com.ecommerce.rodrigo.auth.AuthController.AuthResponse;
import com.ecommerce.rodrigo.auth.dto.LoginDTO;
import com.ecommerce.rodrigo.auth.dto.RegisterDTO;
import com.ecommerce.rodrigo.auth.dto.SellerRegistrationDTO;
import com.ecommerce.rodrigo.auth.exception.AuthException;
import com.ecommerce.rodrigo.user.SessionUserService;
import com.ecommerce.rodrigo.user.UserRepository;
import com.ecommerce.rodrigo.user.UserRole;
import com.ecommerce.rodrigo.user.entity.User;
import com.ecommerce.rodrigo.utils.DocumentUtils;
import com.ecommerce.rodrigo.utils.SeredUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final SessionUserService sessionUserService;

    public AuthService(PasswordEncoder passwordEncoder, UserRepository userRepository, SessionUserService sessionUserService) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.sessionUserService = sessionUserService;
    }

    public AuthResponse register(RegisterDTO registerDTO, HttpServletRequest request) {
        if (userRepository.findByEmail(registerDTO.email()).isPresent()) {
            log.warn("register - Cadastro recusado: email ja cadastrado ({})", maskEmail(registerDTO.email()));
            throw new AuthException(HttpStatus.CONFLICT, "Já existe uma conta registrada nesse email!");
        }

        if (!SeredUtils.verifyStrengthPassword(registerDTO.password())) {
            log.warn("register - Cadastro recusado: senha fraca ({})", maskEmail(registerDTO.email()));
            throw new AuthException(HttpStatus.BAD_REQUEST, "Senha fraca, faça uma senha mais forte!");
        }

        User userEntity = new User();
        userEntity.setEmail(registerDTO.email());
        userEntity.setPassword(passwordEncoder.encode(registerDTO.password()));
        userEntity.setFullName(registerDTO.fullName());
        userEntity.setPhoneNumber(registerDTO.phoneNumber());
        userEntity.setAddress(registerDTO.address());
        userEntity.setRole(UserRole.BUYER);

        userRepository.save(userEntity);
        startSession(userEntity, request);

        log.info("register - Usuario cadastrado e autenticado: userId={}, role=BUYER", userEntity.getId());

        return new AuthResponse("Registrado com sucesso!");
    }

    public AuthResponse registerSeller(SellerRegistrationDTO sellerDTO, HttpServletRequest request) {
        if (userRepository.findByEmail(sellerDTO.email()).isPresent()) {
            log.warn("registerSeller - Cadastro de vendedor recusado: email ja cadastrado ({})", maskEmail(sellerDTO.email()));
            throw new AuthException(HttpStatus.CONFLICT, "Já existe uma conta registrada nesse email!");
        }

        if (!SeredUtils.verifyStrengthPassword(sellerDTO.password())) {
            log.warn("registerSeller - Cadastro de vendedor recusado: senha fraca ({})", maskEmail(sellerDTO.email()));
            throw new AuthException(HttpStatus.BAD_REQUEST, "Senha fraca, faça uma senha mais forte!");
        }

        String cpf = DocumentUtils.normalizeCpf(sellerDTO.cpf());
        if (!DocumentUtils.isValidCpf(cpf)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "O CPF deve ter 11 dígitos.");
        }

        if (userRepository.findByCpf(cpf).isPresent()) {
            log.warn("registerSeller - Cadastro de vendedor recusado: CPF ja cadastrado ({})", maskEmail(sellerDTO.email()));
            throw new AuthException(HttpStatus.CONFLICT, "Este CPF já está cadastrado em outra conta.");
        }

        User userEntity = new User();
        userEntity.setEmail(sellerDTO.email());
        userEntity.setPassword(passwordEncoder.encode(sellerDTO.password()));
        userEntity.setFullName(sellerDTO.fullName());
        userEntity.setPhoneNumber(sellerDTO.phoneNumber());
        userEntity.setAddress(sellerDTO.address());
        userEntity.setCpf(cpf);
        userEntity.setRole(UserRole.SELLER);
        userEntity.setStoreName(sellerDTO.storeName());
        userEntity.setStoreDescription(sellerDTO.storeDescription());

        userRepository.save(userEntity);
        startSession(userEntity, request);

        log.info("registerSeller - Vendedor cadastrado e autenticado: userId={}, storeNamePresente={}", userEntity.getId(), userEntity.getStoreName() != null && !userEntity.getStoreName().isBlank());

        return new AuthResponse("Vendedor registrado com sucesso!");
    }

    public AuthResponse login(LoginDTO loginDTO, HttpServletRequest request) {
        User user = userRepository.findByEmail(loginDTO.email())
                .orElseThrow(() -> {
                    log.warn("login - Login recusado: email nao encontrado ({})", maskEmail(loginDTO.email()));
                    return new AuthException(HttpStatus.BAD_REQUEST, "Usuário não encontrado com esse email!");
                });

        if (!passwordEncoder.matches(loginDTO.password(), user.getPassword())) {
            log.warn("login - Login recusado: senha incorreta, userId={}", user.getId());
            throw new AuthException(HttpStatus.BAD_REQUEST, "Senha incorreta.");
        }

        startSession(user, request);

        log.info("login - Login realizado: userId={}, role={}", user.getId(), user.getRole());

        return new AuthResponse("Login realizado com sucesso!");
    }

    public SessionUser me(Authentication authentication) {
        User user = sessionUserService.require(authentication);

        return new SessionUser(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getStoreName()
        );
    }

    public void logout(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        log.info("logout - Sessao encerrada pelo usuario");
    }

    private void startSession(User user, HttpServletRequest request) {
        var authentication = UsernamePasswordAuthenticationToken.authenticated(user.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        var session = request.getSession(true);
        request.changeSessionId();
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        log.debug("startSession - Sessao autenticada criada para userId={}, role={}", user.getId(), user.getRole());
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "(vazio)";
        }

        int at = email.indexOf('@');
        if (at <= 0) {
            return "***";
        }

        String domain = email.substring(at);
        return email.charAt(0) + "***" + domain;
    }

    public record SessionUser(long id, String email, String fullName, String role, String storeName) {}
}
