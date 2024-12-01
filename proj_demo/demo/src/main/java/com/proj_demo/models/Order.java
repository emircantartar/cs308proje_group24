package com.proj_demo.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document(collection = "orders") // Map to MongoDB collection "orders"
public class Order {

    @Id
    private String id; // MongoDB's primary key

    @Field("user_id")
    private String userId; // Reference to the associated user's ID

    @Field("items")
    private List<OrderItem> items = new ArrayList<>(); // Embedded list of order items

    @Field("status")
    private String status = "processing"; // Default status for a new order

    @Field("total_price")
    private double totalPrice = 0.0; // Initial total price

    @Field("delivery_address")
    private String deliveryAddress; // Delivery address for the order

    // Default constructor
    public Order() {}

    // Parameterized constructor
    public Order(String userId, String deliveryAddress) {
        this.userId = userId;
        this.deliveryAddress = deliveryAddress;
        this.status = "processing"; // Default status for a new order
        this.totalPrice = 0.0; // Initial total price
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

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
        updateTotalPrice(); // Recalculate total price when items are updated
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    // Business Logic Methods

    /**
     * Adds an item to the order and updates the total price.
     *
     * @param orderItem The item to add.
     */
    public void addItem(OrderItem orderItem) {
        this.items.add(orderItem);
        updateTotalPrice();
    }

    /**
     * Removes an item from the order and updates the total price.
     *
     * @param orderItem The item to remove.
     */
    public void removeItem(OrderItem orderItem) {
        this.items.remove(orderItem);
        updateTotalPrice();
    }

    /**
     * Updates the total price of the order based on the order items.
     */
    public void updateTotalPrice() {
        this.totalPrice = items.stream()
                .mapToDouble(item -> item.getQuantity() * item.getPriceAtPurchase())
                .sum();
    }

    /**
     * Checks if the order is complete (e.g., all items delivered).
     *
     * @return true if all items are delivered, false otherwise.
     */
    public boolean isComplete() {
        return "delivered".equalsIgnoreCase(this.status);
    }

    // Overridden Methods

    @Override
    public String toString() {
        return "Order{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", status='" + status + '\'' +
                ", totalPrice=" + totalPrice +
                ", deliveryAddress='" + deliveryAddress + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Order order = (Order) o;
        return Objects.equals(id, order.id) &&
               Objects.equals(userId, order.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, userId);
    }
}