package com.sabanciuniv.demo.service;

import com.sabanciuniv.demo.model.*;
import com.sabanciuniv.demo.repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentService paymentService;

    /**
     * Create an order with payment processing.
     *
     * @param cartItem      The cart containing the products to order.
     * @param client        The client placing the order.
     * @param paymentMethod The payment method (e.g., "Credit Card").
     * @return The created order.
     */
    public Order createOrder(CartItem cartItem, Client client, String paymentMethod) {
        // Iterate through the products in the cart and update stock
        for (Product product : cartItem.getProductList()) {
            if (product.getStock() < 1) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }
            productService.updateStock(product.getProductId(), 1); // Decrease stock by 1 per product
        }

        // Process payment
        Payment payment = paymentService.processPayment(cartItem.getTot_price(), paymentMethod);

        // Create and save the order
        Order order = new Order();
        order.setMyCart(cartItem); // Assuming `Order` is linked to the cart
        order.setClient(client); // Link the order to the client
        order.setPayment(payment); // Link the payment details
        order.setOrderDate(new Date());
        order.setTotalPrice(cartItem.getTot_price());
        order.setStatus(OrderStatus.PROCESSING); // Default status
        orderRepository.save(order);

        return order;
    }

    /**
     * Update the status of an order.
     *
     * @param orderId The ID of the order to update.
     * @param status  The new status to set (e.g., IN_TRANSIT, DELIVERED).
     * @return The updated order.
     */
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    /**
     * Retrieve all orders with a specific status.
     *
     * @param status The status to filter orders by (e.g., PROCESSING, DELIVERED).
     * @return A list of orders with the specified status.
     */
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    /**
     * Retrieve all orders for a specific client.
     *
     * @param clientId The ID of the client.
     * @return A list of orders associated with the client.
     */
    public List<Order> getOrdersByClient(Long clientId) {
        return orderRepository.findAllByClientId(clientId);
    }
}
