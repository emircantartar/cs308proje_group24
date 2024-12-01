package com.proj_demo.repositories;

import com.proj_demo.models.OrderItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends MongoRepository<OrderItem, String> {
    // No custom methods needed for now, standard CRUD operations suffice
}