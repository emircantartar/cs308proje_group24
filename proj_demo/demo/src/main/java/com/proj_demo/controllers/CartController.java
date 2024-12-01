package com.proj_demo.controllers;

import com.proj_demo.models.ShoppingCart;
import com.proj_demo.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // Get the user's current shopping cart
    @GetMapping
    public ResponseEntity<ShoppingCart> getCart(@RequestParam String userId) {
        try {
            ShoppingCart cart = cartService.getCartByUserId(userId);
            if (cart != null) {
                return ResponseEntity.ok(cart);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    // Add an item to the cart
    @PostMapping("/add")
    public ResponseEntity<String> addItemToCart(
            @RequestParam String userId,
            @RequestParam String productId,
            @RequestParam int quantity) {
        try {
            boolean success = cartService.addItemToCart(userId, productId, quantity);
            if (success) {
                return ResponseEntity.ok("Item added to cart successfully.");
            } else {
                return ResponseEntity.badRequest().body("Failed to add item to cart. Check product stock or cart existence.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while adding the item to the cart.");
        }
    }

    // Remove an item from the cart
    @DeleteMapping("/remove")
    public ResponseEntity<String> removeItemFromCart(
            @RequestParam String userId,
            @RequestParam String productId) {
        try {
            boolean success = cartService.removeItemFromCart(userId, productId);
            if (success) {
                return ResponseEntity.ok("Item removed from cart successfully.");
            } else {
                return ResponseEntity.badRequest().body("Failed to remove item from cart. Item may not exist.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while removing the item from the cart.");
        }
    }

    // Clear all items from the cart
    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart(@RequestParam String userId) {
        try {
            boolean success = cartService.clearCart(userId);
            if (success) {
                return ResponseEntity.ok("Cart cleared successfully.");
            } else {
                return ResponseEntity.badRequest().body("Failed to clear the cart. The cart may not exist.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while clearing the cart.");
        }
    }
}