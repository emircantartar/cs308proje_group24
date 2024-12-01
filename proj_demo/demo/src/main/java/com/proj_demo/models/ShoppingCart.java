package com.proj_demo.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document(collection = "shopping_carts")
public class ShoppingCart {

    @Id
    private String id; // MongoDB document ID

    @Field("user_id")
    private String userId; // Reference to the user's ID

    @Field("items")
    private List<CartItem> items = new ArrayList<>(); // Embedded list of cart items

    // Default constructor
    public ShoppingCart() {
    }

    // Parameterized constructor
    public ShoppingCart(String userId) {
        this.userId = userId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }

    // Adds an item to the shopping cart
    public void addItem(CartItem cartItem) {
        for (CartItem item : items) {
            if (item.getProductId().equals(cartItem.getProductId())) {
                item.setQuantity(item.getQuantity() + cartItem.getQuantity());
                return;
            }
        }
        items.add(cartItem);
    }

    // Removes an item by product ID
    public void removeItem(String productId) {
        items.removeIf(item -> item.getProductId().equals(productId));
    }

    // Calculates the total price
    public double calculateTotal() {
        return items.stream()
                .mapToDouble(item -> item.calculateTotalPrice())
                .sum();
    }

    // Clears the shopping cart
    public void clearCart() {
        items.clear();
    }

    @Override
    public String toString() {
        return "ShoppingCart{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", items=" + items +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ShoppingCart that = (ShoppingCart) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, userId);
    }
}