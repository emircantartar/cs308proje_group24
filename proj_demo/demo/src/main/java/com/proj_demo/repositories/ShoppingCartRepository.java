package com.proj_demo.repositories;

import com.proj_demo.models.ShoppingCart;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShoppingCartRepository extends MongoRepository<ShoppingCart, String> {
    // Find a shopping cart by the user ID
    Optional<ShoppingCart> findByUserId(String userId);
}