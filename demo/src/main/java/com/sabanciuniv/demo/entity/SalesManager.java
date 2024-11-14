package com.sabanciuniv.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "sales_managers")
public class SalesManager extends User {

    @Column(nullable = false)
    private String region;

    // Default constructor required by JPA
    public SalesManager() {}

    // Constructor with parameters
    public SalesManager(long userId, long taxId, String name, String email, String password, String region) {
        // Initialize inherited fields using setters
        setUserId(userId);
        setTaxId(taxId);
        setName(name);
        setEmail(email);
        setPassword(password);
        setRole("Sales Manager");

        // Initialize SalesManager-specific fields
        this.region = region;
    }

    // Getter and Setter for region
    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }
}
