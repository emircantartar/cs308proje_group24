package com.sabanciuniv.demo.controller;

import com.sabanciuniv.demo.model.Review;
import com.sabanciuniv.demo.model.ReviewStatus;
import com.sabanciuniv.demo.service.ReviewService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * Submit a review for a product.
     */
    @PostMapping("/submit")
    public ResponseEntity<Review> submitReview(
            @RequestParam Long productId,
            @RequestParam String reviewerName,
            @RequestParam String reviewContent,
            @RequestParam int rating) {
        Review review = reviewService.submitReview(productId, reviewerName, reviewContent, rating);
        return ResponseEntity.ok(review);
    }

    /**
     * Retrieve all reviews for a product.
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getApprovedReviewsByProduct(@PathVariable Long productId) {
        List<Review> reviews = reviewService.getReviewsByProduct(productId, ReviewStatus.APPROVED);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Retrieve all pending reviews for a product (for moderation).
     */
    @GetMapping("/product/{productId}/pending")
    public ResponseEntity<List<Review>> getPendingReviewsByProduct(@PathVariable Long productId) {
        List<Review> reviews = reviewService.getReviewsByProduct(productId, ReviewStatus.PENDING);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Approve a review.
     */
    @PutMapping("/{reviewId}/approve")
    public ResponseEntity<String> approveReview(@PathVariable Long reviewId) {
        Review review = reviewService.approveReview(reviewId);
        return ResponseEntity.ok("Review approved: " + review.getReviewId());
    }

    /**
     * Reject a review.
     */
    @PutMapping("/{reviewId}/reject")
    public ResponseEntity<String> rejectReview(@PathVariable Long reviewId) {
        Review review = reviewService.rejectReview(reviewId);
        return ResponseEntity.ok("Review rejected: " + review.getReviewId());
    }

    /**
     * Retrieve all reviews with a specific status.
     */
    @GetMapping("/status")
    public ResponseEntity<List<Review>> getReviewsByStatus(@RequestParam ReviewStatus status) {
        List<Review> reviews = reviewService.getReviewsByProduct(null, status);
        return ResponseEntity.ok(reviews);
    }
}
