package com.sabanciuniv.demo.model;

public class SalesManager extends User{
    public SalesManager(long user_id, long tax_id, String name, String email, String password, String region) {
        // Initialize inherited fields
        setUserId(user_id);
        setTaxId(tax_id);
        setName(name);
        setEmail(email);
        setPassword(password);
        //setRole(Set<"Sales Manager">);
    }
}
