package com.ecommerce.rodrigo.order;

import com.ecommerce.rodrigo.order.dto.CreateOrderDTO;
import com.ecommerce.rodrigo.order.dto.UpdateOrderStatusDTO;
import com.ecommerce.rodrigo.order.entity.Order;
import com.ecommerce.rodrigo.order.OrderController.OrderResponse;
import com.ecommerce.rodrigo.order.exception.OrderException;
import com.ecommerce.rodrigo.product.ProductRepository;
import com.ecommerce.rodrigo.product.entity.Product;
import com.ecommerce.rodrigo.user.UserRepository;
import com.ecommerce.rodrigo.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public OrderResponse createOrder(CreateOrderDTO createOrderDTO) {
        User user = userRepository.findById(createOrderDTO.userId().longValue())
                .orElseThrow(() -> new OrderException(HttpStatus.NOT_FOUND, "Usuário não encontrado!"));
        Product product = productRepository.findById(createOrderDTO.productId())
                .orElseThrow(() -> new OrderException(HttpStatus.NOT_FOUND, "Produto não encontrado!"));

        if (createOrderDTO.quantity() > product.getQuantity()) {
            throw new OrderException(HttpStatus.BAD_REQUEST, "Quantidade solicitada maior que o estoque disponível!");
        }

        Order order = new Order();
        order.setUser(user);
        order.setProduct(product);
        order.setQuantity(createOrderDTO.quantity());
        order.setTotal(product.getPrice().multiply(BigDecimal.valueOf(createOrderDTO.quantity())));
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return new OrderResponse("Pedido criado com sucesso!");
    }

    public List<Order> findOrdersByUser(long userId) {
        return orderRepository.findByUser_Id(userId);
    }

    public OrderResponse updateStatus(UpdateOrderStatusDTO updateOrderStatusDTO) {
        Order order = findOrderById(updateOrderStatusDTO.id());
        order.setStatus(updateOrderStatusDTO.status().name());
        orderRepository.save(order);

        return new OrderResponse("Status do pedido atualizado com sucesso!");
    }

    public OrderResponse deleteOrder(Integer id) {
        Order order = findOrderById(id);
        orderRepository.delete(order);
        return new OrderResponse("Pedido excluído com sucesso!");
    }

    private Order findOrderById(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderException(HttpStatus.NOT_FOUND, "Pedido não encontrado!"));
    }
}
