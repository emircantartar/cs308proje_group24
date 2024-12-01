package com.proj_demo.controllers;

import com.proj_demo.models.Comment;
import com.proj_demo.services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Add a comment to a product
    @PostMapping("/add")
    public ResponseEntity<String> addComment(
            @RequestParam String userId,
            @RequestParam String productId,
            @RequestParam int rating,
            @RequestBody String content) {
        try {
            boolean success = commentService.addComment(userId, productId, rating, content);
            if (success) {
                return ResponseEntity.ok("Comment added successfully. Awaiting approval.");
            } else {
                return ResponseEntity.badRequest().body("Failed to add comment. Check the input data.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while adding the comment.");
        }
    }

    // Approve a comment (admin or product manager functionality)
    @PatchMapping("/{commentId}/approve")
    public ResponseEntity<String> approveComment(@PathVariable String commentId) {
        try {
            boolean success = commentService.approveComment(commentId);
            if (success) {
                return ResponseEntity.ok("Comment approved successfully.");
            } else {
                return ResponseEntity.badRequest().body("Failed to approve comment. Comment may not exist.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while approving the comment.");
        }
    }

    // Get all approved comments for a product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Comment>> getCommentsForProduct(@PathVariable String productId) {
        try {
            List<Comment> comments = commentService.getApprovedCommentsForProduct(productId);
            if (comments != null && !comments.isEmpty()) {
                return ResponseEntity.ok(comments);
            } else {
                return ResponseEntity.noContent().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }
}