package com.sabanciuniv.demo.service;

import com.sabanciuniv.demo.model.Payment;
import com.sabanciuniv.demo.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public Payment processPayment(double amount, String paymentMethod) {
        // Create a new payment
        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus("Completed"); // Assume payment is always successful

        return paymentRepository.save(payment);
    }
}
