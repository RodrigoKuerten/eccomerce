package com.ecommerce.rodrigo.product;

import com.ecommerce.rodrigo.product.dto.AddQuantityProductDTO;
import com.ecommerce.rodrigo.product.dto.CreateProductDTO;
import com.ecommerce.rodrigo.product.dto.EditProductDTO;
import com.ecommerce.rodrigo.product.dto.RemoveQuantityProductDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/product")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/create")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductDTO createProductDTO) {
        return ResponseEntity.status(HttpStatus.OK).body(productService.createProduct(createProductDTO));
    }

    @PutMapping("/edit")
    public ResponseEntity<ProductResponse> editProduct(@Valid @RequestBody EditProductDTO editProductDTO) {
        return ResponseEntity.ok(productService.editProduct(editProductDTO));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ProductResponse> deleteProduct(@RequestBody Integer id) {
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @PatchMapping("/add-quantity")
    public ResponseEntity<ProductResponse> addQuantity(@Valid @RequestBody AddQuantityProductDTO addQuantityProductDTO) {
        return ResponseEntity.ok(productService.addQuantityProduct(addQuantityProductDTO));
    }

    @PatchMapping("/remove-quantity")
    public ResponseEntity<ProductResponse> removeQuantity(@Valid @RequestBody RemoveQuantityProductDTO removeQuantityProductDTO) {
        return ResponseEntity.ok(productService.removeQuantityProduct(removeQuantityProductDTO));
    }

    public record ProductResponse(String message) {}
}
