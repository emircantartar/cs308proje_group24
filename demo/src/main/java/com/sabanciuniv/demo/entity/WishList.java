package com.sabanciuniv.demo.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wishlists")
public class WishList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wishlist_id")
    private long wishlistId;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "size_of_wishlist", nullable = false)
    private int sizeOfWishlist = 0;

    @ManyToMany
    @JoinTable(
            name = "wishlist_products",
            joinColumns = @JoinColumn(name = "wishlist_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> products = new ArrayList<>();

    @Column(name = "cost_of_list", nullable = false)
    private double costOfList = 0.0;

    // Constructors
    public WishList() {}

    public WishList(Client client) {
        this.client = client;
    }

    // Methods
    public void addToWishlist(Product product) {
        products.add(product);
        sizeOfWishlist++;
        calculateCostOfWishList();
    }

    public void removeFromWishList(Product product) {
        products.remove(product);
        sizeOfWishlist--;
        calculateCostOfWishList();
    }

    public boolean isExist(Product product) {
        return products.contains(product);
    }

    private void calculateCostOfWishList() {
        costOfList = products.stream().mapToDouble(Product::getPrice).sum();
    }

    public double getCostOfList() {
        calculateCostOfWishList();
        return costOfList;
    }

    // Getters and Setters
    public long getWishlistId() {
        return wishlistId;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public int getSizeOfWishlist() {
        return sizeOfWishlist;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
        this.sizeOfWishlist = products.size();
        calculateCostOfWishList();
    }
}
