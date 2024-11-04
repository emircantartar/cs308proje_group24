package com.sabanciuniv.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.util.List;
//@Entity
public class CartItem {
    //@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Client client;
    private Long cart_id;
    private List<Product> productList;
    private int quantity;
    private double tot_price;

    // Constructors
    public CartItem() {}

    public CartItem(List<Product> products, Client cli) {
        client = cli;
        this.productList = products;
        this.quantity = products.size();
        tot_price = getTot_price();
    }
    public double getTot_price(){
        double price = 0;
        for (Product pr: productList){
            price += pr.getPrice();
        }
        return price;
    }
    // Getters and Setters
    public Long getId() {
        return cart_id;
    }

    public void setId(Long id) {
        this.cart_id = id;
    }

    public List<Product> getProductList() {
        return productList;
    }

    public void setProductList(List<Product> productId) {
        this.productList = productId;
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
}
