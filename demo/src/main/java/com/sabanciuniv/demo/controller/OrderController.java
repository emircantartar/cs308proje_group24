package com.sabanciuniv.demo.controller;

import com.sabanciuniv.demo.model.Order;
import com.sabanciuniv.demo.model.CartItem;
import com.sabanciuniv.demo.model.Client;
import com.sabanciuniv.demo.model.OrderStatus;
import com.sabanciuniv.demo.service.OrderService;
import com.sabanciuniv.demo.repository.CartRepository;
import com.sabanciuniv.demo.repository.ClientRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ClientRepository clientRepository;

    /**
     * Endpoint to place an order.
     *
     * @param cartId        ID of the cart to process.
     * @param clientId      ID of the client placing the order.
     * @param paymentMethod Payment method for the order (e.g., "Credit Card").
     * @return ResponseEntity with success or failure message.
     */
    @PostMapping
    public ResponseEntity<String> placeOrder(@RequestParam Long cartId, @RequestParam Long clientId, @RequestParam String paymentMethod) {
        // Retrieve the cart item
        CartItem cartItem = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        // Retrieve the client
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));

        // Create the order
        Order order = orderService.createOrder(cartItem, client, paymentMethod);

        return ResponseEntity.ok("Order placed successfully. Order ID: " + order.getOrderId());
    }

    /**
     * Endpoint to update the status of an order.
     *
     * @param orderId ID of the order to update.
     * @param status  New status to set (e.g., PROCESSING, IN_TRANSIT, DELIVERED).
     * @return ResponseEntity with success message.
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<String> updateOrderStatus(@PathVariable Long orderId, @RequestParam OrderStatus status) {
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok("Order status updated to " + status);
    }

    /**
     * Endpoint to get all orders by status.
     *
     * @param status Status to filter orders by (e.g., PROCESSING, IN_TRANSIT, DELIVERED).
     * @return List of orders with the specified status.
     */
    @GetMapping("/status")
    public ResponseEntity<List<Order>> getOrdersByStatus(@RequestParam OrderStatus status) {
        List<Order> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    /**
     * Endpoint to get all orders for a specific client.
     *
     * @param clientId ID of the client.
     * @return List of orders placed by the specified client.
     */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Order>> getOrdersByClient(@PathVariable Long clientId) {
        List<Order> orders = orderService.getOrdersByClient(clientId);
        return ResponseEntity.ok(orders);
    }
}
