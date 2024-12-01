package com.proj_demo.repositories;

import com.proj_demo.models.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    /**
     * Find category by name.
     * 
     * @param name the name of the category
     * @return an optional category
     */
    Optional<Category> findByName(String name);
}