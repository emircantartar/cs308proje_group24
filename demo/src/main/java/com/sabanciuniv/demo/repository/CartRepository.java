package com.sabanciuniv.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sabanciuniv.demo.model.CartItem;

@Repository
public interface CartRepository extends JpaRepository<CartItem, Long> {
}
