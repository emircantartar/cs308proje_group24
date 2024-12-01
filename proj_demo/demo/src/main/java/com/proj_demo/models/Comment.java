package com.proj_demo.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Objects;

@Document(collection = "comments") // Map to MongoDB collection "comments"
public class Comment {

    @Id
    private String id; // MongoDB uses String (or ObjectId) for IDs

    @Field("user_id")
    private String userId; // Reference to the user's ID

    @Field("product_id")
    private String productId; // Reference to the product's ID

    @Field("content")
    private String content; // The content of the comment

    @Field("rating")
    private int rating; // Rating given by the user (1–5)

    @Field("approved")
    private boolean approved; // Whether the comment is approved for display

    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now(); // Timestamp of comment creation

    // Default constructor
    public Comment() {
    }

    // Parameterized constructor
    public Comment(String userId, String productId, String content, int rating) {
        this.userId = userId;
        this.productId = productId;
        this.content = content;
        this.rating = rating;
        this.approved = false; // Default: comment requires approval
        this.createdAt = LocalDateTime.now(); // Set the current time as creation time
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }
        this.rating = rating;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Business Logic Methods

    /**
     * Approves the comment for visibility.
     */
    public void approve() {
        this.approved = true;
    }

    /**
     * Rejects the comment, making it invisible.
     */
    public void reject() {
        this.approved = false;
    }

    // Overridden Methods

    @Override
    public String toString() {
        return "Comment{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", productId='" + productId + '\'' +
                ", content='" + content + '\'' +
                ", rating=" + rating +
                ", approved=" + approved +
                ", createdAt=" + createdAt +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Comment comment = (Comment) o;
        return Objects.equals(id, comment.id) &&
               Objects.equals(userId, comment.userId) &&
               Objects.equals(productId, comment.productId) &&
               Objects.equals(content, comment.content);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, userId, productId, content);
    }
}