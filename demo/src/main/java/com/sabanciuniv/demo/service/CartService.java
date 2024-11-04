package com.sabanciuniv.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sabanciuniv.demo.model.CartItem;
import com.sabanciuniv.demo.repository.CartRepository;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;

    public CartItem addToCart(Long productId, int quantity) {
        CartItem cartItem = new CartItem(productId, quantity);
        return cartRepository.save(cartItem);
    }
}
