package com.ecommerce.rodrigo.category;

import com.ecommerce.rodrigo.product.ProductTypeCategoriesEnum;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @GetMapping
    public List<CategoryResponse> findAll() {
        return Arrays.stream(ProductTypeCategoriesEnum.values())
                .map(category -> new CategoryResponse(
                        category.name().toLowerCase(),
                        category.getLabel(),
                        category.getIcon()
                ))
                .toList();
    }

    public record CategoryResponse(String slug, String name, String icon) {}
}
