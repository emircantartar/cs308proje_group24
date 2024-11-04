package com.sabanciuniv.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.util.List;
import java.util.ArrayList;

//@Entity
public class Product{
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long product_id;
    private SalesManager seller;
    private double rating;
    private String name;
    private double price;
    private List<String> description;
    private int stock;
    private String category;
    // Constructors
    public Product() {}

    public Product(long product_id, String name, double price, List<String> description, int stock, SalesManager manager) {
        this.name = name;
        this.product_id = product_id;
        this.price = price;
        this.description = description;
        this.stock = stock;
        this.rating = 0.0;
        this.seller = manager;
    }

    // Getters and Setters
    public Long getId() {
        return product_id;
    }

    public void setId(Long id) {
        this.product_id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public List<String> getDescription() {
        return description;
    }

    public void setDescription(List<String> description) {
        this.description = description;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public SalesManager getSeller() {
        return seller;
    }
    public void setSeller(SalesManager seller) {
        this.seller = seller;
    }
    public double getRating(){return rating;}
    public String getCategory(){return category;}
    public void setCategory(String category){this.category = category;}

}
