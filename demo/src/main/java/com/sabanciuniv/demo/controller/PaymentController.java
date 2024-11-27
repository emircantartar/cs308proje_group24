package com.sabanciuniv.demo.controller;

import com.sabanciuniv.demo.model.Payment;
import com.sabanciuniv.demo.service.PaymentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Endpoint to process a payment.
     *
     * @param amount The amount to be paid.
     * @param method The payment method (e.g., "Credit Card", "PayPal").
     * @return The processed payment details.
     */
    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(
            @RequestParam double amount,
            @RequestParam String method) {
        Payment payment = paymentService.processPayment(amount, method);
        return ResponseEntity.ok(payment);
    }
}
