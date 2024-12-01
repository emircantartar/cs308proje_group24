package com.proj_demo.repositories;

import com.proj_demo.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    // Find a user by email
    Optional<User> findByEmail(String email);
}