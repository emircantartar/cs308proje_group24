package com.sabanciuniv.demo.repository;

import com.sabanciuniv.demo.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartItem, Long> {
    
    // Custom query method to find a cart item by product ID
    Optional<CartItem> findByProductList_ProductId(Long productId);
}
