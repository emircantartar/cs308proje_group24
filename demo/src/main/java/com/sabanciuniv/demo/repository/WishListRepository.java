package com.sabanciuniv.demo.repository;

import com.sabanciuniv.demo.model.WishList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishListRepository extends JpaRepository<WishList, Long> {
    WishList findByClientId(Long clientId);  // Custom query to find wishlist by client
}
