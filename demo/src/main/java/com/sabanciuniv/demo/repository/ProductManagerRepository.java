package com.sabanciuniv.demo.repository;

import com.sabanciuniv.demo.model.ProductManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductManagerRepository extends JpaRepository<ProductManager, Long> {
    //ProductManager findByDepartment(String department);  // Example custom query
}
