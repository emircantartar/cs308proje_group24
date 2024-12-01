package com.proj_demo.repositories;

import com.proj_demo.models.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    /**
     * Find approved comments for a specific product.
     *
     * @param productId the product ID
     * @return a list of approved comments
     */
    List<Comment> findByProductIdAndApprovedTrue(String productId);

    /**
     * Find all unapproved comments (admin functionality).
     *
     * @return a list of unapproved comments
     */
    List<Comment> findByApprovedFalse();
}