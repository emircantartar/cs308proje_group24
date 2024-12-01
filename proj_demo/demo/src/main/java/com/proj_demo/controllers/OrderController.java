package com.proj_demo.controllers;

import com.proj_demo.models.Order;
import com.proj_demo.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Get all orders for a user
    @GetMapping
    public ResponseEntity<List<Order>> getOrdersByUserId(@RequestParam String userId) {
        try {
            List<Order> orders = orderService.getOrdersByUserId(userId);
            if (orders != null && !orders.isEmpty()) {
                return ResponseEntity.ok(orders);
            } else {
                return ResponseEntity.noContent().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get details of a specific order
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable String orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            if (order != null) {
                return ResponseEntity.ok(order);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Place a new order
    @PostMapping
    public ResponseEntity<String> placeOrder(@RequestParam String userId) {
        try {
            boolean success = orderService.placeOrder(userId);
            if (success) {
                return ResponseEntity.ok("Order placed successfully.");
            } else {
                return ResponseEntity.badRequest().body("Failed to place the order.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while placing the order.");
        }
    }

    // Update the status of an order
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status) {
        try {
            boolean success = orderService.updateOrderStatus(orderId, status);
            if (success) {
                return ResponseEntity.ok("Order status updated successfully.");
            } else {
                return ResponseEntity.badRequest().body("Failed to update order status.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while updating the order status.");
        }
    }
}