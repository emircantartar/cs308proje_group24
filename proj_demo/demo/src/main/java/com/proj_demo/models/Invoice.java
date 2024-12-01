package com.proj_demo.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "invoices")
public class Invoice {

    @Id
    private String id; // MongoDB ID for the invoice

    @Field("order_id")
    private String orderId; // Reference to the associated order

    @Field("generated_at")
    private LocalDateTime generatedAt; // Timestamp for invoice creation

    @Field("pdf_file_path")
    private String pdfFilePath; // Path to the generated PDF

    @Field("email_sent")
    private boolean emailSent; // Status of email sent (true/false)

    // Default constructor (required by MongoDB)
    public Invoice() {
    }

    // Parameterized constructor
    public Invoice(Order order, String pdfFilePath) {
        this.orderId = order.getId(); // Get the ID from the Order object
        this.pdfFilePath = pdfFilePath;
        this.generatedAt = LocalDateTime.now(); // Set the timestamp to now
        this.emailSent = false; // Default: email not sent
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getPdfFilePath() {
        return pdfFilePath;
    }

    public void setPdfFilePath(String pdfFilePath) {
        this.pdfFilePath = pdfFilePath;
    }

    public boolean isEmailSent() {
        return emailSent;
    }

    public void setEmailSent(boolean emailSent) {
        this.emailSent = emailSent;
    }

    // Business Logic Methods
    public void markAsEmailed() {
        this.emailSent = true;
    }

    // Overridden Methods
    @Override
    public String toString() {
        return "Invoice{" +
                "id='" + id + '\'' +
                ", orderId='" + orderId + '\'' +
                ", generatedAt=" + generatedAt +
                ", pdfFilePath='" + pdfFilePath + '\'' +
                ", emailSent=" + emailSent +
                '}';
    }
}