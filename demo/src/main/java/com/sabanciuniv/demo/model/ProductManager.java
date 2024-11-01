package com.sabanciuniv.demo.model;

public class ProductManager extends User {
    public ProductManager(long user_id, long tax_id, String name, String email, String password, String department) {
        // Initialize inherited fields
        setUser_id(user_id);
        setTax_id(tax_id);
        setName(name);
        setEmail(email);
        setPassword(password);
        role = "Product Manager";
    }
}
