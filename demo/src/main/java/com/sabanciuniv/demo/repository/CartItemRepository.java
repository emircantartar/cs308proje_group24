package com.sabanciuniv.demo.repository;

import com.sabanciuniv.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sabanciuniv.demo.entity.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    CartItem AddToCart(Product product);
}
