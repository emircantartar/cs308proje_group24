package com.proj_demo.repositories;

import com.proj_demo.models.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    // Find all orders for a specific user
    List<Order> findByUserId(String userId);
}