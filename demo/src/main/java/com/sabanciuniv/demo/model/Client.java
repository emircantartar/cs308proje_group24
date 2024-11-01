package com.sabanciuniv.demo.model;

import java.util.List;

public class Client extends User {
    private String address;
    public WishList wishlist;
    public Client(long user_id, long tax_id, String name, String email, String password, String adres) {
        // Initialize inherited fields
        setUser_id(user_id);
        setTax_id(tax_id);
        setName(name);
        setEmail(email);
        setPassword(password);
        setRole(role);
        wishlist = null;
        address = adres;
        role = "Client";
    }
    public String getAddress() {
        return address;
    }
    public void setAddress(String address) {
        this.address = address;
    }

}
