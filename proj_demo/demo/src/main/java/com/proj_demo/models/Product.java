package com.proj_demo.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@Document(collection = "products") // This maps to the MongoDB "products" collection
public class Product {

    @Id
    private String id; // MongoDB uses String for IDs by default

    private String name;
    private String model;
    private String serialNumber;
    private String description;
    private int stock;
    private double price;
    private boolean warrantyStatus;
    private String distributorInfo;
    private String category;

    private double averageRating;
    private int totalRatings;
    private int ratingSum;

    // Default constructor
    public Product() {
    }

    // Parameterized constructor
    public Product(String name, String model, String serialNumber, String description,
                   int stock, double price, boolean warrantyStatus, String distributorInfo, String category) {
        this.name = name;
        this.model = model;
        this.serialNumber = serialNumber;
        this.description = description;
        this.stock = stock;
        this.price = price;
        this.warrantyStatus = warrantyStatus;
        this.distributorInfo = distributorInfo;
        this.category = category;
        this.averageRating = 0.0;
        this.totalRatings = 0;
        this.ratingSum = 0;
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

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public boolean isWarrantyStatus() {
        return warrantyStatus;
    }

    public void setWarrantyStatus(boolean warrantyStatus) {
        this.warrantyStatus = warrantyStatus;
    }

    public String getDistributorInfo() {
        return distributorInfo;
    }

    public void setDistributorInfo(String distributorInfo) {
        this.distributorInfo = distributorInfo;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getTotalRatings() {
        return totalRatings;
    }

    public void setTotalRatings(int totalRatings) {
        this.totalRatings = totalRatings;
    }

    public int getRatingSum() {
        return ratingSum;
    }

    public void setRatingSum(int ratingSum) {
        this.ratingSum = ratingSum;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    // Business Logic Methods
    public boolean reduceStock(int quantity) {
        if (quantity <= 0 || quantity > stock) {
            return false;
        }
        this.stock -= quantity;
        return true;
    }

    public void addStock(int quantity) {
        if (quantity > 0) {
            this.stock += quantity;
        }
    }

    public boolean addRating(int rating) {
        if (rating < 1 || rating > 5) {
            return false;
        }
        this.ratingSum += rating;
        this.totalRatings++;
        this.averageRating = (double) this.ratingSum / this.totalRatings;
        return true;
    }

    public boolean isOutOfStock() {
        return this.stock <= 0;
    }

    // Overridden Methods
    @Override
    public String toString() {
        return "Product{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", model='" + model + '\'' +
                ", serialNumber='" + serialNumber + '\'' +
                ", description='" + description + '\'' +
                ", stock=" + stock +
                ", price=" + price +
                ", warrantyStatus=" + warrantyStatus +
                ", distributorInfo='" + distributorInfo + '\'' +
                ", category='" + category + '\'' +
                ", averageRating=" + averageRating +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return stock == product.stock &&
                Double.compare(product.price, price) == 0 &&
                warrantyStatus == product.warrantyStatus &&
                Objects.equals(id, product.id) &&
                Objects.equals(name, product.name) &&
                Objects.equals(model, product.model) &&
                Objects.equals(serialNumber, product.serialNumber) &&
                Objects.equals(description, product.description) &&
                Objects.equals(distributorInfo, product.distributorInfo) &&
                Objects.equals(category, product.category);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, model, serialNumber, description, stock, price, warrantyStatus, distributorInfo, category);
    }
}