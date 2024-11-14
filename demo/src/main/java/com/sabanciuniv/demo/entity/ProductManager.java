package com.sabanciuniv.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_managers")
public class ProductManager extends User {

    // Constructors
    public ProductManager() {
        super();
        setRole("Product Manager");
    }

    public ProductManager(long taxId, String name, String email, String password) {
        super(name, email, password, taxId); // Call the parent constructor for common fields
        setRole("Product Manager");
    }

    // Additional methods for ProductManager can be added here if needed
}
