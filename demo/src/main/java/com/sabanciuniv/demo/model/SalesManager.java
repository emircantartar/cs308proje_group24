package com.sabanciuniv.demo.model;

public class SalesManager extends User{
    public SalesManager(long user_id, long tax_id, String name, String email, String password, String region) {
        // Initialize inherited fields
        setUser_id(user_id);
        setTax_id(tax_id);
        setName(name);
        setEmail(email);
        setPassword(password);
        role = "Sales Manager";
    }
}
