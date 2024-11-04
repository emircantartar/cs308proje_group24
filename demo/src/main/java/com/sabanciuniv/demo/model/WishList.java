package com.sabanciuniv.demo.model;
import java.util.List;
import java.util.ArrayList;
public class WishList {
    private long wishlist_id;
    private Client myclient;
    public int sizeofwishlist;
    private List<Product> products;
    private double costOfList;

    public WishList(long wishlist_id, Client cl) {
        this.myclient = cl;
        this.wishlist_id = wishlist_id;
        this.products = new ArrayList<>(); // Initialize products list
        this.sizeofwishlist = 0; // Initialize size of the+ list
        this.costOfList = 0.0; // Initialize total cost
    }

    public void addToWishlist(Product p){
        products.add(p);
        sizeofwishlist++;
    }
    public void removeFromWishList(Product p){
        products.remove(p);
        sizeofwishlist--;
    }
    public Boolean IsExist(Product p){
        return (products.contains(p));
    }
    public void calculateCostOfWishList(){
        double total_price = 0;
        for(Product pr: products){
            total_price += pr.getPrice();
        }
        costOfList = total_price;
    }
    public double getCostOfList(){
        calculateCostOfWishList();
        return costOfList;
    }

    public List<Product> getProducts() {
        return products;
    }
}
