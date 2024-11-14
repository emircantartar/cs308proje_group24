package com.sabanciuniv.demo.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartId;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToMany
    @JoinTable(
            name = "cart_item_products",
            joinColumns = @JoinColumn(name = "cart_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> productList;

    private int quantity;
    private double totPrice;

    // Default constructor required by JPA
    public CartItem() {}

    // Constructor with parameters
    public CartItem(List<Product> products, Client cli) {
        this.client = cli;
        this.productList = products;
        this.quantity = products.size();
        this.totPrice = getTotPrice();
    }

    // Method to calculate total price of products in the cart
    public double getTotPrice() {
        double price = 0;
        for (Product pr : productList) {
            price += pr.getPrice();
        }
        return price;
    }

    // Getters and Setters
    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public List<Product> getProductList() {
        return productList;
    }

    public void setProductList(List<Product> productList) {
        this.productList = productList;
        this.quantity = productList.size();
        this.totPrice = getTotPrice();
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public void setTotPrice(double totPrice) {
        this.totPrice = totPrice;
    }
}
