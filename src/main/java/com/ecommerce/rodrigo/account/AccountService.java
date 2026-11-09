package com.ecommerce.rodrigo.account;

import com.ecommerce.rodrigo.account.dto.AccountDTO;
import com.ecommerce.rodrigo.account.dto.ChangePasswordDTO;
import com.ecommerce.rodrigo.account.dto.UpdateProfileDTO;
import com.ecommerce.rodrigo.auth.exception.AuthException;
import com.ecommerce.rodrigo.user.SessionUserService;
import com.ecommerce.rodrigo.user.UserRepository;
import com.ecommerce.rodrigo.user.entity.User;
import com.ecommerce.rodrigo.utils.DocumentUtils;
import com.ecommerce.rodrigo.utils.SeredUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionUserService sessionUserService;

    public AccountService(UserRepository userRepository, PasswordEncoder passwordEncoder, SessionUserService sessionUserService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionUserService = sessionUserService;
    }

    public AccountDTO getProfile(Authentication authentication) {
        User user = sessionUserService.require(authentication);
        return toDTO(user);
    }

    public AccountDTO updateProfile(Authentication authentication, UpdateProfileDTO dto) {
        User user = sessionUserService.require(authentication);
        String cpf = DocumentUtils.normalizeCpf(dto.cpf());

        if (cpf != null && !DocumentUtils.isValidCpf(cpf)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "O CPF deve ter 11 dígitos.");
        }

        if (cpf != null) {
            userRepository.findByCpf(cpf).ifPresent(owner -> {
                if (owner.getId() != user.getId()) {
                    throw new AuthException(HttpStatus.CONFLICT, "Este CPF já está cadastrado em outra conta.");
                }
            });
        }

        user.setFullName(dto.fullName().trim());
        user.setPhoneNumber(dto.phoneNumber().trim());
        user.setAddress(dto.address().trim());
        user.setCpf(cpf);
        userRepository.save(user);

        log.info("updateProfile - Perfil atualizado: userId={}, campos=fullName/phoneNumber/address/cpf, cpfPresente={}", user.getId(), cpf != null);

        return toDTO(user);
    }

    public void changePassword(Authentication authentication, ChangePasswordDTO dto) {
        User user = sessionUserService.require(authentication);

        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            log.warn("changePassword - Troca de senha recusada: senha atual incorreta, userId={}", user.getId());
            throw new AuthException(HttpStatus.BAD_REQUEST, "A senha atual está incorreta.");
        }

        if (!SeredUtils.verifyStrengthPassword(dto.newPassword())) {
            log.warn("changePassword - Troca de senha recusada: senha nova fraca, userId={}", user.getId());
            throw new AuthException(HttpStatus.BAD_REQUEST, "A nova senha precisa ter 8+ caracteres, com maiúscula, minúscula, número e símbolo.");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);
        log.info("changePassword - Senha alterada com sucesso: userId={}", user.getId());
    }

    private AccountDTO toDTO(User user) {
        return new AccountDTO(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getCpf()
        );
    }
}
