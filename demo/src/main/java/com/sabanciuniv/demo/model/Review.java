package com.sabanciuniv.demo.model;

/**
 * Enum to represent the status of a review.
 */
public enum ReviewStatus {
    PENDING,
    APPROVED,
    REJECTED
}

import jakarta.persistence.*;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String reviewerName;
    private String reviewContent;

    @Column(nullable = false)
    private int rating; // Rating out of 5 stars

    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date reviewDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status = ReviewStatus.PENDING; // Default status: PENDING

    // Default constructor
    public Review() {
        this.reviewDate = new java.util.Date(); // Set default review date
    }

    // Getters and Setters
    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public String getReviewContent() {
        return reviewContent;
    }

    public void setReviewContent(String reviewContent) {
        this.reviewContent = reviewContent;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars.");
        }
        this.rating = rating;
    }

    public java.util.Date getReviewDate() {
        return reviewDate;
    }

    public void setReviewDate(java.util.Date reviewDate) {
        this.reviewDate = reviewDate;
    }

    public ReviewStatus getStatus() {
        return status;
    }

    public void setStatus(ReviewStatus status) {
        this.status = status;
    }
}
