package com.sabanciuniv.demo.model;

public class ProductManager extends User {
    public ProductManager(long user_id, long tax_id, String name, String email, String password, String department) {
        // Initialize inherited fields
        setUserId(user_id);
        setTaxId(tax_id);
        setName(name);
        setEmail(email);
        setPassword(password);
        setRole("Product Manager");
    }
}
