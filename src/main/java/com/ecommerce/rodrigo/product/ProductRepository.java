package com.ecommerce.rodrigo.product;

import com.ecommerce.rodrigo.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {}
