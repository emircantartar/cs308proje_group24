package com.sabanciuniv.demo.repository;

import com.sabanciuniv.demo.model.Order;
import com.sabanciuniv.demo.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Existing method to find an order by client ID
    Order findByClientId(Long clientId);

    // New method to find orders by status
    List<Order> findByStatus(OrderStatus status);

    // New method to find all orders for a specific client
    List<Order> findAllByClientId(Long clientId);
}
