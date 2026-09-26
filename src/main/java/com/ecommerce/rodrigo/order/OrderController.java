package com.ecommerce.rodrigo.order;

import com.ecommerce.rodrigo.order.dto.CreateOrderDTO;
import com.ecommerce.rodrigo.order.dto.UpdateOrderStatusDTO;
import com.ecommerce.rodrigo.order.entity.Order;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/create")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderDTO createOrderDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(createOrderDTO));
    }

    @GetMapping("/user/{userId}")
    public List<Order> findOrdersByUser(@PathVariable("userId") long userId) {
        return orderService.findOrdersByUser(userId);
    }

    @PatchMapping("/status")
    public ResponseEntity<OrderResponse> updateStatus(@Valid @RequestBody UpdateOrderStatusDTO updateOrderStatusDTO) {
        return ResponseEntity.ok(orderService.updateStatus(updateOrderStatusDTO));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<OrderResponse> deleteOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.deleteOrder(id));
    }

    public record OrderResponse(String message){}
}
