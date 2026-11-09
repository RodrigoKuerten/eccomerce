package com.ecommerce.rodrigo.account;

import com.ecommerce.rodrigo.account.dto.AccountDTO;
import com.ecommerce.rodrigo.account.dto.ChangePasswordDTO;
import com.ecommerce.rodrigo.account.dto.UpdateProfileDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<AccountDTO> profile(Authentication authentication) {
        return ResponseEntity.ok(accountService.getProfile(authentication));
    }

    @PutMapping("/profile")
    public ResponseEntity<AccountDTO> updateProfile(Authentication authentication, @Valid @RequestBody UpdateProfileDTO dto) {
        return ResponseEntity.ok(accountService.updateProfile(authentication, dto));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordDTO dto) {
        accountService.changePassword(authentication, dto);
        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso."));
    }
}
