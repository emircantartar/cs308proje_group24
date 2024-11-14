package com.sabanciuniv.demo.repository;

import com.sabanciuniv.demo.model.SalesManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesManagerRepository extends JpaRepository<SalesManager, Long> {
    SalesManager findByRegion(String region);  // Example custom query
}
