package com.ecommerce.rodrigo.product;

import java.math.BigDecimal;

public interface ProductData {
    String name();
    String description();
    ProductTypeCategoriesEnum category();
    BigDecimal price();
    Integer quantity();
    byte [] image();
}
