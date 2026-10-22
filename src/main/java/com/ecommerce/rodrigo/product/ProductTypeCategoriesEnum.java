package com.ecommerce.rodrigo.product;

public enum ProductTypeCategoriesEnum {
    ELECTRONICS("Eletrônicos", "tv"),
    FASHION("Moda", "checkroom"),
    HOUSE("Casa & Decoração", "weekend"),
    SPORTS("Esportes", "fitness_center"),
    BEAUTY("Beleza", "spa"),
    TOYS("Brinquedos", "toys"),
    GAMES("Games", "sports_esports"),
    BOOKS("Livros", "menu_book"),
    AUTOMOTIVE("Automotivo", "directions_car"),
    PET("Pet Shop", "pets"),
    TOOLS("Ferramentas", "handyman"),
    FOOD("Mercado", "shopping_cart");

    private final String label;
    private final String icon;

    ProductTypeCategoriesEnum(String label, String icon) {
        this.label = label;
        this.icon = icon;
    }

    public String getLabel() {
        return label;
    }

    public String getIcon() {
        return icon;
    }
}
