package com.ecommerce.rodrigo.order;

import com.ecommerce.rodrigo.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUser_Id(long userId);
}
