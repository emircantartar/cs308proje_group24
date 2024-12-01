package com.proj_demo.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document(collection = "categories") // Map to MongoDB collection "categories"
public class Category {

    @Id
    private String id; // MongoDB uses String (or ObjectId) for IDs

    private String name; // Name of the category

    private List<String> productIds = new ArrayList<>(); // List of product IDs in this category

    // Default constructor
    public Category() {
    }

    // Parameterized constructor
    public Category(String name) {
        this.name = name;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<String> productIds) {
        this.productIds = productIds;
    }

    // Business Logic Methods

    /**
     * Adds a product ID to the category.
     *
     * @param productId The product ID to add.
     */
    public void addProduct(String productId) {
        if (!this.productIds.contains(productId)) {
            this.productIds.add(productId);
        }
    }

    /**
     * Removes a product ID from the category.
     *
     * @param productId The product ID to remove.
     */
    public void removeProduct(String productId) {
        this.productIds.remove(productId);
    }

    // Overridden Methods

    @Override
    public String toString() {
        return "Category{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", productIds=" + productIds +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return Objects.equals(id, category.id) && Objects.equals(name, category.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}