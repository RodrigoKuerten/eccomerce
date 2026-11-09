package com.ecommerce.rodrigo.product;

import com.ecommerce.rodrigo.product.ProductController.ProductResponse;
import com.ecommerce.rodrigo.product.dto.AddQuantityProductDTO;
import com.ecommerce.rodrigo.product.dto.CreateProductDTO;
import com.ecommerce.rodrigo.product.dto.EditProductDTO;
import com.ecommerce.rodrigo.product.dto.ProductDTO;
import com.ecommerce.rodrigo.product.dto.RemoveQuantityProductDTO;
import com.ecommerce.rodrigo.product.entity.Product;
import com.ecommerce.rodrigo.user.SessionUserService;
import com.ecommerce.rodrigo.user.entity.User;
import com.ecommerce.rodrigo.utils.ImageUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class ProductService {
    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("199.00");
    private static final int FEATURED_LIMIT = 8;

    private final ProductRepository productRepository;
    private final SessionUserService sessionUserService;

    public ProductService(ProductRepository productRepository, SessionUserService sessionUserService) {
        this.productRepository = productRepository;
        this.sessionUserService = sessionUserService;
    }

    public ProductResponse createProduct(CreateProductDTO createProductDTO) {
        User user = sessionUserService.requireSeller();
        Product product = new Product();
        updateProductData(product, createProductDTO);
        product.setSellerUser(user);
        product.setSeller(user.getFullName());

        productRepository.save(product);

        log.info("createProduct - Produto criado: productId={}, userId={}, categoria={}, preco={}, estoque={}, imagemBytes={}",
                product.getId(),
                user.getId(),
                product.getCategory(),
                product.getPrice(),
                product.getQuantity(),
                product.getImage() != null ? product.getImage().length : 0);

        return new ProductResponse("Produto criado com sucesso!");
    }

    public ProductResponse editProduct(EditProductDTO editProductDTO) {
        Product product = findProductById(editProductDTO.id());
        User user = assertOwner(product);

        updateProductData(product, editProductDTO);
        product.setSeller(user.getFullName());
        productRepository.save(product);

        log.info("editProduct - Produto atualizado: productId={}, userId={}, preco={}, estoque={}",
                product.getId(),
                user.getId(),
                product.getPrice(),
                product.getQuantity());

        return new ProductResponse("Produto editado com sucesso!");
    }

    public ProductResponse deleteProduct(Integer id) {
        Product product = findProductById(id);
        User user = assertOwner(product);

        productRepository.delete(product);

        log.info("deleteProduct - Produto excluido: productId={}, userId={}", id, user.getId());

        return new ProductResponse("Produto excluido com sucesso!");
    }

    public ProductResponse addQuantityProduct(AddQuantityProductDTO addQuantityProductDTO) {
        Product product = findProductById(addQuantityProductDTO.id());
        User user = assertOwner(product);

        product.addQuantity(addQuantityProductDTO.quantity());
        productRepository.save(product);

        log.info("addQuantityProduct - Estoque adicionado: productId={}, userId={}, quantidadeAdicionada={}, estoqueAtual={}",
                product.getId(),
                user.getId(),
                addQuantityProductDTO.quantity(),
                product.getQuantity());

        return new ProductResponse("Adicionado quantidade do produto com sucesso!");
    }

    public ProductResponse removeQuantityProduct(RemoveQuantityProductDTO removeQuantityProductDTO) {
        Product product = findProductById(removeQuantityProductDTO.id());
        User user = assertOwner(product);

        product.removeQuantity(removeQuantityProductDTO.quantity());
        productRepository.save(product);

        log.info("removeQuantityProduct - Estoque removido: productId={}, userId={}, quantidadeRemovida={}, estoqueAtual={}",
                product.getId(),
                user.getId(),
                removeQuantityProductDTO.quantity(),
                product.getQuantity());

        return new ProductResponse("Removido quantidade do produto com sucesso!");
    }

    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream().map(this::toDTO).toList();
    }

    public List<ProductDTO> findProductsBySeller(Long sellerId) {
        return productRepository.findBySellerUser_IdOrderByIdDesc(sellerId).stream()
                .map(this::toDTO)
                .toList();
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

    public ResponseEntity<byte[]> findImage(Integer id) {
        Product product = findProductById(id);
        byte[] image = product.getImage();

        if (image == null || image.length == 0) {
            log.debug("findImage - Imagem nao encontrada: productId={}", id);
            return ResponseEntity.notFound().build();
        }

        log.debug("findImage - Imagem servida: productId={}, bytes={}", id, image.length);
        return ResponseEntity.ok().contentType(ImageUtils.contentType(image)).body(image);
    }

    public List<ProductDTO> findDeals() {
        return productRepository.findAll().stream()
                .filter(product -> product.getOldPrice() != null && product.getOldPrice().compareTo(product.getPrice()) > 0)
                .sorted(Comparator.comparing((Product product) -> product.getOldPrice().subtract(product.getPrice()))
                .reversed())
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
                freeShipping,
                product.getImage() != null && product.getImage().length > 0
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
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductException(HttpStatus.NOT_FOUND, "Produto não encontrado!"));
    }

    private User assertOwner(Product product) {
        User user = sessionUserService.requireSeller();

        if (product.getSellerUser() == null || !Objects.equals(product.getSellerUser().getId(), user.getId())) {
            log.warn("assertOwner - Acesso negado ao produto: productId={}, userId={}, donoId={}",
                    product.getId(),
                    user.getId(),
                    product.getSellerUser() != null ? product.getSellerUser().getId() : null);
            throw new ProductException(HttpStatus.FORBIDDEN, "Você só pode alterar os seus próprios produtos.");
        }

        return user;
    }
}
