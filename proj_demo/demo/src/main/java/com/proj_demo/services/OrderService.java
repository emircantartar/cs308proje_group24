package com.proj_demo.services;

import com.proj_demo.models.*;
import com.proj_demo.repositories.OrderItemRepository;
import com.proj_demo.repositories.OrderRepository;
import com.proj_demo.repositories.ShoppingCartRepository;
import com.proj_demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ShoppingCartRepository shoppingCartRepository;

    @Autowired
    private UserRepository userRepository;

    // Fetch all orders for a user
    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }

    // Fetch order by ID
    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    // Place a new order
    public boolean placeOrder(String userId) {
        // Find the user's shopping cart
        Optional<ShoppingCart> cartOptional = shoppingCartRepository.findByUserId(userId);
        if (cartOptional.isEmpty()) {
            return false; // No cart found
        }

        ShoppingCart cart = cartOptional.get();
        if (cart.getItems().isEmpty()) {
            return false; // Empty cart
        }

        // Find the user
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return false; // User not found
        }

        User user = userOptional.get();

        // Create a new order
        Order order = new Order();
        double totalPrice = 0.0;

        // Transfer items from the cart to the order
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem(
            );
            totalPrice += orderItem.calculateTotalPrice();
            order.addItem(orderItem);
        }

        // Set total price and save the order
        order.setTotalPrice(totalPrice);
        orderRepository.save(order);

        // Clear the user's cart
        cart.clearCart();
        shoppingCartRepository.save(cart);

        return true;
    }

    // Update the status of an order
    public boolean updateOrderStatus(String orderId, String status) {
        Optional<Order> orderOptional = orderRepository.findById(orderId);
        if (orderOptional.isPresent()) {
            Order order = orderOptional.get();
            order.setStatus(status);
            orderRepository.save(order);
            return true;
        }
        return false;
    }
}