package com.sabanciuniv.demo.repository;

import com.sabanciuniv.demo.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Order findByClientId(Long clientId);  // Custom query method
}
