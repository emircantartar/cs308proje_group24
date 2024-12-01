package com.proj_demo.services;

import com.proj_demo.models.CartItem;
import com.proj_demo.models.Product;
import com.proj_demo.models.ShoppingCart;
import com.proj_demo.repositories.CartItemRepository;
import com.proj_demo.repositories.ProductRepository;
import com.proj_demo.repositories.ShoppingCartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    @Autowired
    private ShoppingCartRepository shoppingCartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    // Retrieve the cart by user ID
    public ShoppingCart getCartByUserId(String userId) {
        return shoppingCartRepository.findByUserId(userId).orElse(null);
    }

    // Add an item to the cart
    public boolean addItemToCart(String userId, String productId, int quantity) {
        if (quantity <= 0) {
            return false; // Invalid quantity
        }

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null || product.isOutOfStock() || product.getStock() < quantity) {
            return false; // Product not found or insufficient stock
        }

        ShoppingCart cart = shoppingCartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            return false; // Cart not found for the user
        }

        // Check if the product is already in the cart
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);

        if (cartItem == null) {
            // Add new item to the cart
            cartItem = new CartItem(productId, product.getPrice(), quantity);
            cart.addItem(cartItem);
        } else {
            // Update quantity for existing item
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        }

        // Reduce the product stock
        product.reduceStock(quantity);
        productRepository.save(product);

        // Save the updated cart
        shoppingCartRepository.save(cart);
        return true;
    }

    // Remove an item from the cart
    public boolean removeItemFromCart(String userId, String productId) {
        ShoppingCart cart = shoppingCartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            return false; // Cart not found
        }

        // Find the cart item
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);

        if (cartItem == null) {
            return false; // Item not found in the cart
        }

        // Restore the product stock
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.addStock(cartItem.getQuantity());
            productRepository.save(product);
        }

        // Remove the item from the cart
        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);

        return true;
    }

    // Clear the entire cart
    public boolean clearCart(String userId) {
        ShoppingCart cart = shoppingCartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            return false; // Cart not found
        }

        // Restore stock for all items in the cart
        for (CartItem cartItem : cart.getItems()) {
            String productId = cartItem.getProductId();
            Product product = productRepository.findById(productId).orElse(null);
            if (product != null) {
                product.addStock(cartItem.getQuantity());
                productRepository.save(product);
            }
        }

        // Clear the cart items
        cart.clearCart();
        shoppingCartRepository.save(cart);
        return true;
    }
}