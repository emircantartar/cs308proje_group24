package com.proj_demo.services;

import com.proj_demo.models.Invoice;
import com.proj_demo.models.Order;
import com.proj_demo.repositories.InvoiceRepository;
import com.proj_demo.repositories.OrderRepository;
import com.proj_demo.utils.PDFGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Retrieves an invoice by the associated order ID.
     *
     * @param orderId The ID of the order.
     * @return The invoice object or null if not found.
     */
    public Invoice getInvoiceByOrderId(String orderId) {
        return invoiceRepository.findByOrderId(orderId).orElse(null);
    }

    /**
     * Generates an invoice for a given order ID and saves it to the database.
     *
     * @param orderId The ID of the order.
     * @return True if the invoice is successfully generated, false otherwise.
     */
    public boolean generateInvoice(String orderId) {
        // Check if the order exists
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return false; // Order not found
        }

        // Check if an invoice already exists
        if (invoiceRepository.findByOrderId(orderId).isPresent()) {
            return false; // Invoice already exists
        }

        // Generate the PDF file path
        String pdfFilePath;
        try {
            pdfFilePath = PDFGenerator.generateInvoicePDF(order);
        } catch (IOException | com.itextpdf.text.DocumentException e) {
            e.printStackTrace();
            return false; // PDF generation failed
        }

        // Create and save the invoice
        Invoice invoice = new Invoice(order, pdfFilePath);
        invoiceRepository.save(invoice);

        return true;
    }

    /**
     * Generates an invoice for an order and sends it to the specified email.
     *
     * @param orderId        The ID of the order.
     * @param recipientEmail The recipient's email address.
     * @return True if both the invoice generation and email sending are successful.
     */
    public boolean generateAndSendInvoice(String orderId, String recipientEmail) {
        // Generate the invoice
        boolean invoiceGenerated = generateInvoice(orderId);
        if (!invoiceGenerated) {
            return false; // Invoice generation failed
        }

        // Retrieve the generated invoice
        Invoice invoice = invoiceRepository.findByOrderId(orderId).orElse(null);
        if (invoice == null) {
            return false; // Invoice not found
        }

        // Send the invoice via email
        return emailService.sendEmail(
                recipientEmail,
                "Your Invoice",
                "Please find your invoice attached.",
                invoice.getPdfFilePath()
        );
    }

    /**
     * Internally generates the PDF file for the given order.
     *
     * @param order The order for which the invoice is generated.
     * @return The path of the generated PDF file.
     */
    public String generateInvoice(Order order) {
        try {
            return PDFGenerator.generateInvoicePDF(order);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}