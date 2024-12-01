package com.proj_demo.controllers;

import com.proj_demo.models.Invoice;
import com.proj_demo.services.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    // Get invoice by order ID
    @GetMapping("/{orderId}")
    public ResponseEntity<Invoice> getInvoiceByOrderId(@PathVariable String orderId) {
        try {
            Invoice invoice = invoiceService.getInvoiceByOrderId(orderId);
            if (invoice != null) {
                return ResponseEntity.ok(invoice);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    // Generate an invoice for an order
    @PostMapping("/generate/{orderId}")
    public ResponseEntity<String> generateInvoice(@PathVariable String orderId) {
        try {
            boolean success = invoiceService.generateInvoice(orderId);
            if (success) {
                return ResponseEntity.ok("Invoice generated successfully.");
            } else {
                return ResponseEntity.badRequest().body("Failed to generate invoice.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while generating the invoice.");
        }
    }

    // Send an invoice via email
    @PostMapping("/{orderId}/send")
    public ResponseEntity<String> sendInvoice(@PathVariable String orderId, @RequestParam String email) {
        try {
            boolean success = invoiceService.generateAndSendInvoice(orderId, email);
            if (success) {
                return ResponseEntity.ok("Invoice sent successfully.");
            } else {
                return ResponseEntity.badRequest().body("Failed to send invoice.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while sending the invoice.");
        }
    }
}