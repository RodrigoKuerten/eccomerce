package com.ecommerce.rodrigo.product;

import com.ecommerce.rodrigo.product.ProductController.ProductResponse;

import com.ecommerce.rodrigo.product.dto.AddQuantityProductDTO;
import com.ecommerce.rodrigo.product.dto.CreateProductDTO;
import com.ecommerce.rodrigo.product.dto.EditProductDTO;
import com.ecommerce.rodrigo.product.dto.RemoveQuantityProductDTO;
import com.ecommerce.rodrigo.product.entity.Product;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductResponse createProduct(CreateProductDTO createProductDTO) {
        Product product = new Product();
        updateProductData(product, createProductDTO);

        productRepository.save(product);

        return new ProductResponse("Produto criado com sucesso!");
    }

    public ProductResponse editProduct(EditProductDTO editProductDTO) {
        Product product = findProductById(editProductDTO.id());

        updateProductData(product, editProductDTO);
        productRepository.save(product);

        return new ProductResponse("Produto editado com sucesso!");
    }

    public ProductResponse deleteProduct(Integer id) {
        Product product = findProductById(id);

        productRepository.delete(product);

        return new ProductResponse("Produto excluido com sucesso!");
    }

    public ProductResponse addQuantityProduct(AddQuantityProductDTO addQuantityProductDTO) {
        Product product = findProductById(addQuantityProductDTO.id());

        product.addQuantity(addQuantityProductDTO.quantity());
        productRepository.save(product);

        return new ProductResponse("Adicionado quantidade do produto com sucesso!");
    }

    public ProductResponse removeQuantityProduct(RemoveQuantityProductDTO removeQuantityProductDTO) {
        Product product = findProductById(removeQuantityProductDTO.id());

        product.removeQuantity(removeQuantityProductDTO.quantity());
        productRepository.save(product);

        return new ProductResponse("Removido quantidade do produto com sucesso!");
    }

    private void updateProductData(Product product, ProductData dto) {
        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setCategory(dto.category());
        product.setPrice(dto.price());
        product.setQuantity(dto.quantity());

        if (dto.image() != null) {
            product.setImage(dto.image());
        }
    }

    private Product findProductById(Integer id) {
        return productRepository.findById(id).orElseThrow(() -> new ProductException(HttpStatus.NOT_FOUND, "Produto não encontrado!"));
    }
}
