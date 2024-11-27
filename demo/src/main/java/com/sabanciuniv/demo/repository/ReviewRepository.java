package com.sabanciuniv.demo.repository;

import com.sabanciuniv.demo.model.Review;
import com.sabanciuniv.demo.model.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Find reviews by product ID.
     */
    List<Review> findByProduct_ProductId(Long productId);

    /**
     * Find reviews by product ID and status.
     */
    List<Review> findByProduct_ProductIdAndStatus(Long productId, ReviewStatus status);

    /**
     * Find all reviews with a specific status.
     */
    List<Review> findByStatus(ReviewStatus status);
}
