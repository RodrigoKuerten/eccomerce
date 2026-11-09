package com.ecommerce.rodrigo.seller;

import com.ecommerce.rodrigo.seller.dto.SellerDashboardDTO;
import com.ecommerce.rodrigo.seller.dto.SellerUpgradeDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<SellerDashboardDTO> dashboard(Authentication authentication) {
        return ResponseEntity.ok(sellerService.dashboard(authentication));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<Map<String, String>> upgrade(Authentication authentication, @Valid @RequestBody SellerUpgradeDTO dto) {
        sellerService.upgrade(authentication, dto);
        return ResponseEntity.ok(Map.of("message", "Loja ativada com sucesso."));
    }
}
