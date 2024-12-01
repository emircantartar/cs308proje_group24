package com.proj_demo.services;

import com.proj_demo.models.Comment;
import com.proj_demo.models.Product;
import com.proj_demo.models.User;
import com.proj_demo.repositories.CommentRepository;
import com.proj_demo.repositories.ProductRepository;
import com.proj_demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // Add a comment to a product
    public boolean addComment(String userId, String productId, int rating, String content) {
        if (rating < 1 || rating > 5 || content == null || content.isEmpty()) {
            return false; // Invalid rating or content
        }

        // Check if the user exists
        if (!userRepository.existsById(userId)) {
            return false; // User not found
        }

        // Check if the product exists
        if (!productRepository.existsById(productId)) {
            return false; // Product not found
        }

        // Create and save the comment
        Comment comment = new Comment(userId, productId, content, rating);
        commentRepository.save(comment);
        return true;
    }

    // Approve a comment
    public boolean approveComment(String commentId) {
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null) {
            return false; // Comment not found
        }

        comment.setApproved(true);
        commentRepository.save(comment);
        return true;
    }

    // Get all approved comments for a product
    public List<Comment> getApprovedCommentsForProduct(String productId) {
        return commentRepository.findByProductIdAndApprovedTrue(productId);
    }
}