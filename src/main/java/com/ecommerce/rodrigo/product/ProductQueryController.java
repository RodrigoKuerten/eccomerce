package com.ecommerce.rodrigo.product;

import com.ecommerce.rodrigo.product.dto.ProductDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductQueryController {

    private final ProductService productService;

    public ProductQueryController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductDTO> find(@RequestParam(name = "q", required = false) String q) {
        return productService.search(q);
    }

    @GetMapping("/deals")
    public List<ProductDTO> findDeals() {
        return productService.findDeals();
    }

    @GetMapping("/recommended")
    public List<ProductDTO> findRecommended() {
        return productService.findRecommended();
    }

    @GetMapping("/{id}")
    public ProductDTO findById(@PathVariable("id") Integer id) {
        return productService.findDTOById(id);
    }
}
