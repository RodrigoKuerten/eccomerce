package com.ecommerce.rodrigo.product;

import java.math.BigDecimal;

public interface ProductData {
    String name();
    String description();
    ProductTypeCategoriesEnum category();
    BigDecimal price();
    BigDecimal oldPrice();
    String seller();
    Double rating();
    Integer reviews();
    Integer quantity();
    byte [] image();
}
