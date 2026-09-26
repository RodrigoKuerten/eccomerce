package com.ecommerce.rodrigo.auth;

import com.ecommerce.rodrigo.auth.dto.LoginDTO;
import com.ecommerce.rodrigo.auth.dto.RegisterDTO;
import com.ecommerce.rodrigo.auth.exception.AuthException;
import com.ecommerce.rodrigo.user.UserRepository;
import com.ecommerce.rodrigo.user.entity.User;
import com.ecommerce.rodrigo.utils.SeredUtils;
import com.ecommerce.rodrigo.auth.AuthController.AuthResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthService(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    public AuthResponse register(RegisterDTO registerDTO) {
        if (userRepository.findByEmail(registerDTO.email()).isPresent()) {
            throw new AuthException(HttpStatus.CONFLICT, "Já existe uma conta registrada nesse email!");
        }

        if (!SeredUtils.verifyStrengthPassword(registerDTO.password())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Senha fraca, faça uma senha mais forte!");
        }

        User userEntity = new User();
        userEntity.setEmail(registerDTO.email());
        userEntity.setPassword(passwordEncoder.encode(registerDTO.password()));
        userEntity.setFullName(registerDTO.fullName());
        userEntity.setPhoneNumber(registerDTO.phoneNumber());
        userEntity.setAddress(registerDTO.address());

        userRepository.save(userEntity);

        return new AuthResponse("Registrado com sucesso!");
    }

    public AuthResponse login(LoginDTO loginDTO) {
        User user = userRepository.findByEmail(loginDTO.email()).orElseThrow(() -> new AuthException(HttpStatus.BAD_REQUEST, "Usuário não encontrado com esse email!"));

        if (!passwordEncoder.matches(loginDTO.password(), user.getPassword())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Senha incorreta.");
        }

        return new AuthResponse("Login realizado com sucesso!");
    }
}
