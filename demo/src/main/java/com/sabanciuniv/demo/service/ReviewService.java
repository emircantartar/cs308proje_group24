package com.sabanciuniv.demo.service;

import com.sabanciuniv.demo.model.Product;
import com.sabanciuniv.demo.model.Review;
import com.sabanciuniv.demo.model.ReviewStatus;
import com.sabanciuniv.demo.repository.ProductRepository;
import com.sabanciuniv.demo.repository.ReviewRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Submit a review for a product and set its initial status to PENDING.
     */
    public Review submitReview(Long productId, String reviewerName, String reviewContent, int rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Review review = new Review();
        review.setProduct(product);
        review.setReviewerName(reviewerName);
        review.setReviewContent(reviewContent);
        review.setRating(rating);
        review.setStatus(ReviewStatus.PENDING); // Set initial status to PENDING

        // Save the review
        return reviewRepository.save(review);
    }

    /**
     * Approve a review.
     */
    public Review approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        if (review.getStatus() != ReviewStatus.PENDING) {
            throw new IllegalStateException("Only pending reviews can be approved.");
        }

        review.setStatus(ReviewStatus.APPROVED);

        // Update product rating since the review is now approved
        Product product = review.getProduct();
        updateProductRating(product, review.getRating());

        return reviewRepository.save(review);
    }

    /**
     * Reject a review.
     */
    public Review rejectReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        if (review.getStatus() != ReviewStatus.PENDING) {
            throw new IllegalStateException("Only pending reviews can be rejected.");
        }

        review.setStatus(ReviewStatus.REJECTED);
        return reviewRepository.save(review);
    }

    /**
     * Update the product's average rating and rating count.
     */
    private void updateProductRating(Product product, int newRating) {
        int currentCount = product.getRatingCount();
        double currentAverage = product.getAverageRating();

        // Calculate the new average rating
        double newAverage = ((currentAverage * currentCount) + newRating) / (currentCount + 1);

        product.setAverageRating(newAverage);
        product.setRatingCount(currentCount + 1);

        // Save the updated product
        productRepository.save(product);
    }

    /**
     * Retrieve all reviews for a product, optionally filtered by status.
     */
    public List<Review> getReviewsByProduct(Long productId, ReviewStatus status) {
        if (status == null) {
            return reviewRepository.findByProduct_ProductId(productId);
        }
        return reviewRepository.findByProduct_ProductIdAndStatus(productId, status);
    }
}
