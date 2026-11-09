package com.ecommerce.rodrigo.seller;

import com.ecommerce.rodrigo.auth.exception.AuthException;
import com.ecommerce.rodrigo.order.OrderMapper;
import com.ecommerce.rodrigo.order.OrderRepository;
import com.ecommerce.rodrigo.order.dto.OrderDTO;
import com.ecommerce.rodrigo.order.entity.Order;
import com.ecommerce.rodrigo.product.ProductService;
import com.ecommerce.rodrigo.product.dto.ProductDTO;
import com.ecommerce.rodrigo.seller.dto.DailySalesDTO;
import com.ecommerce.rodrigo.seller.dto.SellerDashboardDTO;
import com.ecommerce.rodrigo.seller.dto.SellerUpgradeDTO;
import com.ecommerce.rodrigo.user.SessionUserService;
import com.ecommerce.rodrigo.user.UserRepository;
import com.ecommerce.rodrigo.user.UserRole;
import com.ecommerce.rodrigo.user.entity.User;
import com.ecommerce.rodrigo.utils.DocumentUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SellerService {

    private static final Logger log = LoggerFactory.getLogger(SellerService.class);
    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd/MM");

    private final ProductService productService;
    private final OrderRepository orderRepository;
    private final SessionUserService sessionUserService;
    private final OrderMapper orderMapper;
    private final UserRepository userRepository;

    public SellerService(ProductService productService, OrderRepository orderRepository, SessionUserService sessionUserService, OrderMapper orderMapper, UserRepository userRepository) {
        this.productService = productService;
        this.orderRepository = orderRepository;
        this.sessionUserService = sessionUserService;
        this.orderMapper = orderMapper;
        this.userRepository = userRepository;
    }

    public void upgrade(Authentication authentication, SellerUpgradeDTO dto) {
        User user = sessionUserService.require(authentication);
        String cpf = DocumentUtils.normalizeCpf(dto.cpf());

        if (user.getCpf() == null && cpf == null) {
            log.warn("upgrade - Loja recusada: CPF ausente, userId={}", user.getId());
            throw new AuthException(HttpStatus.BAD_REQUEST, "Informe seu CPF para começar a vender.");
        }

        if (cpf != null) {
            if (!DocumentUtils.isValidCpf(cpf)) {
                log.warn("upgrade - Loja recusada: CPF invalido, userId={}", user.getId());
                throw new AuthException(HttpStatus.BAD_REQUEST, "O CPF deve ter 11 dígitos.");
            }

            userRepository.findByCpf(cpf).ifPresent(owner -> {
                if (owner.getId() != user.getId()) {
                    log.warn("upgrade - Loja recusada: CPF de outra conta, userId={}", user.getId());
                    throw new AuthException(HttpStatus.CONFLICT, "Este CPF já está cadastrado em outra conta.");
                }
            });
            user.setCpf(cpf);
        }

        user.setRole(UserRole.SELLER);
        user.setStoreName(dto.storeName().trim());
        user.setStoreDescription(dto.storeDescription().trim());
        userRepository.save(user);

        log.info("upgrade - Loja ativada: userId={}, storeNamePresente={}, cpfPresente={}",
                user.getId(),
                !user.getStoreName().isBlank(),
                user.getCpf() != null
        );
    }

    public SellerDashboardDTO dashboard(Authentication authentication) {
        User seller = sessionUserService.requireSeller(authentication);
        List<ProductDTO> products = productService.findProductsBySeller(seller.getId());

        long totalStock = products.stream().mapToLong(ProductDTO::quantity).sum();
        long outOfStock = products.stream().filter(product -> product.quantity() == 0).count();
        BigDecimal inventoryValue = products.stream()
                .map(product -> product.price().multiply(BigDecimal.valueOf(product.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Order> orders = orderRepository.findByProduct_SellerUser_Id(seller.getId());
        List<OrderDTO> recentOrders = orders.stream()
                .sorted(Comparator.comparing(
                        Order::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(5)
                .map(orderMapper::toDTO)
                .toList();
        long orderCount = orders.size();
        List<DailySalesDTO> salesLast7Days = buildSalesLast7Days(orders);

        log.info("dashboard - Dashboard do vendedor consultado: userId={}, produtos={}, estoque={}, esgotados={}, pedidos={}, pontosGrafico={}",
                seller.getId(),
                products.size(),
                totalStock,
                outOfStock,
                orderCount,
                salesLast7Days.size());

        return new SellerDashboardDTO(
                products.size(),
                totalStock,
                inventoryValue,
                outOfStock,
                orderCount,
                products,
                recentOrders,
                salesLast7Days
        );
    }

    private List<DailySalesDTO> buildSalesLast7Days(List<Order> orders) {
        LocalDate today = LocalDate.now();
        List<DailySalesDTO> sales = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            BigDecimal revenue = BigDecimal.ZERO;
            long dayOrders = 0;

            for (Order order : orders) {
                if (order.getCreatedAt() == null || !order.getCreatedAt().toLocalDate().equals(day)) {
                    continue;
                }

                revenue = revenue.add(order.getTotal() != null ? order.getTotal() : BigDecimal.ZERO);
                dayOrders++;
            }

            sales.add(new DailySalesDTO(day.format(DAY_LABEL), revenue, dayOrders));
        }

        return sales;
    }
}
