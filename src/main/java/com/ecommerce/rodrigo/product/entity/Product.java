package com.ecommerce.rodrigo.product.entity;

import com.ecommerce.rodrigo.product.ProductTypeCategoriesEnum;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "PRODUCT")
public class Product {

    @GeneratedValue
    @Id
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ProductTypeCategoriesEnum category;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Version
    private Long version;

    @Column(name = "image")
    private byte[] image;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProductTypeCategoriesEnum getCategory() {
        return category;
    }

    public void setCategory(ProductTypeCategoriesEnum category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void addQuantity(int quantity) {
        this.quantity += quantity;
    }

    public void removeQuantity(Integer quantity) {
        if (quantity > this.quantity) {
            throw new IllegalArgumentException("Estoque insuficiente para ser removido dessa quantidade!");
        }

        this.quantity -= quantity;
    }

    public byte[] getImage() {
        return image;
    }

    public void setImage(byte[] image) {
        this.image = image;
    }
}
