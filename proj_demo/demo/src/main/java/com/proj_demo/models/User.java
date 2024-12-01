package com.proj_demo.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document(collection = "users") // MongoDB collection name
public class User {

    @Id
    private String id; // MongoDB ID

    @Field("name")
    private String name;

    @Field("email")
    private String email;

    @Field("password")
    private String password; // Should be stored as a hashed value

    @Field("address")
    private String address;

    // Reference to orders (one-to-many relationship)
    @DBRef
    private List<Order> orders = new ArrayList<>();

    // Reference to shopping cart (one-to-one relationship)
    @DBRef
    private ShoppingCart shoppingCart;

    // Default constructor (required for MongoDB)
    public User() {
    }

    // Parameterized constructor
    public User(String name, String email, String password, String address) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.address = address;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password; // Ensure hashing is done before setting
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }

    public ShoppingCart getShoppingCart() {
        return shoppingCart;
    }

    public void setShoppingCart(ShoppingCart shoppingCart) {
        this.shoppingCart = shoppingCart;
    }

    // Business Logic Methods

    /**
     * Adds an order to the user's order history.
     *
     * @param order The order to add.
     */
    public void addOrder(Order order) {
        this.orders.add(order);
    }

    /**
     * Removes an order from the user's order history.
     *
     * @param order The order to remove.
     */
    public void removeOrder(Order order) {
        this.orders.remove(order);
    }

    // Overridden Methods

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", address='" + address + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id) && Objects.equals(email, user.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email);
    }
}