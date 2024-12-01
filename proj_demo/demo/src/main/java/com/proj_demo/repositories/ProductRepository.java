package com.proj_demo.repositories;

import com.proj_demo.models.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    // Custom query to search products by name or description
    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    // Methods for sorting by price
    List<Product> findAllByOrderByPriceAsc();
    List<Product> findAllByOrderByPriceDesc();

    // Methods for sorting by average rating
    List<Product> findAllByOrderByAverageRatingAsc();
    List<Product> findAllByOrderByAverageRatingDesc();
}