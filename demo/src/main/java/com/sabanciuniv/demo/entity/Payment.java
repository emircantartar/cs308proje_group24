package com.sabanciuniv.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    private String paymentMethod; // e.g., Credit Card, PayPal
    private String paymentStatus; // e.g., Pending, Completed
    private double amount;

    // Constructors, getters, setters
}
