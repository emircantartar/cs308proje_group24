package com.sabanciuniv.demo.service;

import com.sabanciuniv.demo.model.CartItem;
import com.sabanciuniv.demo.model.Client;
import com.sabanciuniv.demo.model.Product;
import com.sabanciuniv.demo.repository.CartRepository;
import com.sabanciuniv.demo.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Add an item to the cart for a logged-in user.
     */
    public CartItem addToCart(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        CartItem cartItem = new CartItem(List.of(product), null); // Assuming no client initially
        cartItem.setQuantity(quantity);
        cartItem.setTotPrice(product.getPrice() * quantity);

        return cartRepository.save(cartItem);
    }

    /**
     * Remove an item from the cart for a logged-in user.
     */
    public void removeFromCart(Long productId) {
        Optional<CartItem> cartItem = cartRepository.findByProductList_ProductId(productId);
        if (cartItem.isPresent()) {
            cartRepository.delete(cartItem.get());
        } else {
            throw new IllegalArgumentException("Cart item not found!");
        }
    }

    /**
     * Transfer session-based cart items to a logged-in user's account.
     */
    public void transferSessionCartToUser(Client user, HttpSession session) {
        List<CartItem> sessionCart = (List<CartItem>) session.getAttribute("cart");
        if (sessionCart != null) {
            for (CartItem cartItem : sessionCart) {
                cartItem.setClient(user); // Link cart item to user
                cartRepository.save(cartItem);
            }
            session.removeAttribute("cart"); // Clear session cart
        }
    }

    /**
     * View cart items for a logged-in user.
     */
    public List<CartItem> viewCart() {
        return cartRepository.findAll();
    }

    /**
     * Update the quantity of a product in the cart for a logged-in user.
     */
    public void updateProductQuantity(Long cartItemId, int quantity) {
        CartItem cartItem = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        cartItem.setQuantity(quantity);
        cartItem.setTotPrice(cartItem.getProductList().stream()
                .mapToDouble(product -> product.getPrice() * quantity)
                .sum());

        cartRepository.save(cartItem);
    }
}
