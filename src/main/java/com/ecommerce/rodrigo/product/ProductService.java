package com.ecommerce.rodrigo.product;

import com.ecommerce.rodrigo.product.ProductController.ProductResponse;
import com.ecommerce.rodrigo.product.dto.AddQuantityProductDTO;
import com.ecommerce.rodrigo.product.dto.CreateProductDTO;
import com.ecommerce.rodrigo.product.dto.EditProductDTO;
import com.ecommerce.rodrigo.product.dto.ProductDTO;
import com.ecommerce.rodrigo.product.dto.RemoveQuantityProductDTO;
import com.ecommerce.rodrigo.product.entity.Product;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class ProductService {
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("199.00");
    private static final int FEATURED_LIMIT = 8;

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

    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream().map(this::toDTO).toList();
    }

    public List<ProductDTO> search(String term) {
        if (term == null || term.isBlank()) {
            return findAll();
        }

        return productRepository
                .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(term, term)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public ProductDTO findDTOById(Integer id) {
        return toDTO(findProductById(id));
    }

    public List<ProductDTO> findDeals() {
        return productRepository.findAll().stream()
                .filter(product -> product.getOldPrice() != null
                        && product.getOldPrice().compareTo(product.getPrice()) > 0)
                .sorted(Comparator.comparing(
                        (Product product) -> product.getOldPrice().subtract(product.getPrice())
                ).reversed())
                .limit(FEATURED_LIMIT)
                .map(this::toDTO)
                .toList();
    }

    public List<ProductDTO> findRecommended() {
        return productRepository.findAll().stream()
                .sorted(Comparator.comparingDouble(Product::getRating).reversed()
                        .thenComparing(Product::getId, Comparator.reverseOrder()))
                .limit(FEATURED_LIMIT)
                .map(this::toDTO)
                .toList();
    }

    private ProductDTO toDTO(Product product) {
        ProductTypeCategoriesEnum category = product.getCategory();
        boolean freeShipping = product.getPrice() != null
                && product.getPrice().compareTo(FREE_SHIPPING_THRESHOLD) >= 0;

        return new ProductDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                category != null ? category.getLabel() : null,
                category != null ? category.getIcon() : null,
                product.getPrice(),
                product.getOldPrice(),
                product.getSeller(),
                product.getRating(),
                product.getReviews(),
                product.getQuantity(),
                product.getQuantity() > 0,
                freeShipping
        );
    }

    private void updateProductData(Product product, ProductData dto) {
        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setCategory(dto.category());
        product.setPrice(dto.price());
        product.setOldPrice(dto.oldPrice());
        product.setSeller(dto.seller());
        product.setRating(dto.rating() != null ? dto.rating() : 0.0);
        product.setReviews(dto.reviews() != null ? dto.reviews() : 0);
        product.setQuantity(dto.quantity());

        if (dto.image() != null) {
            product.setImage(dto.image());
        }
    }

    private Product findProductById(Integer id) {
        return productRepository.findById(id).orElseThrow(() -> new ProductException(HttpStatus.NOT_FOUND, "Produto não encontrado!"));
    }
}
