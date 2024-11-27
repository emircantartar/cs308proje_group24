package com.sabanciuniv.demo.controller;

import com.sabanciuniv.demo.model.CartItem;
import com.sabanciuniv.demo.model.Product;
import com.sabanciuniv.demo.repository.ProductRepository;
import com.sabanciuniv.demo.service.CartService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Add item to cart for both logged-in and session-based users.
     */
    @PostMapping
    public CartItem addToCart(@RequestParam Long productId, @RequestParam int quantity, HttpSession session) {
        if (session.getAttribute("user") != null) {
            return cartService.addToCart(productId, quantity); // Existing logged-in user functionality
        }

        List<CartItem> sessionCart = (List<CartItem>) session.getAttribute("cart");
        if (sessionCart == null) {
            sessionCart = new ArrayList<>();
            session.setAttribute("cart", sessionCart);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        CartItem newItem = new CartItem(List.of(product), null);
        newItem.setQuantity(quantity);
        newItem.setTotPrice(product.getPrice() * quantity);
        sessionCart.add(newItem);
        return newItem;
    }

    /**
     * Remove item from cart for both logged-in and session-based users.
     */
    @PostMapping("/remove")
    public ResponseEntity<String> removeFromCart(@RequestParam Long productId, HttpSession session) {
        if (session.getAttribute("user") != null) {
            cartService.removeFromCart(productId); // Logged-in user removal functionality
            return ResponseEntity.ok("Item removed from cart successfully!");
        }

        List<CartItem> sessionCart = (List<CartItem>) session.getAttribute("cart");
        if (sessionCart != null) {
            sessionCart.removeIf(item -> item.getProductList().stream()
                    .anyMatch(product -> product.getProductId().equals(productId)));
            session.setAttribute("cart", sessionCart);
        }
        return ResponseEntity.ok("Item removed from session-based cart successfully!");
    }

    /**
     * Update product quantity in cart for both logged-in and session-based users.
     */
    @PutMapping("/update")
    public ResponseEntity<String> updateProductQuantity(
            @RequestParam Long cartItemId,
            @RequestParam int quantity,
            HttpSession session) {
        if (session.getAttribute("user") != null) {
            cartService.updateProductQuantity(cartItemId, quantity);
            return ResponseEntity.ok("Product quantity updated successfully!");
        }

        List<CartItem> sessionCart = (List<CartItem>) session.getAttribute("cart");
        if (sessionCart != null) {
            for (CartItem item : sessionCart) {
                if (item.getCartId().equals(cartItemId)) {
                    item.setQuantity(quantity);
                    item.setTotPrice(item.getProductList().stream()
                            .mapToDouble(product -> product.getPrice() * quantity)
                            .sum());
                    session.setAttribute("cart", sessionCart);
                    return ResponseEntity.ok("Product quantity updated successfully in session-based cart!");
                }
            }
        }
        return ResponseEntity.status(404).body("Cart item not found in session-based cart!");
    }
}
