package com.proj_demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.proj_demo.models.Order;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.File;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends an email with an optional attachment.
     *
     * @param toEmail       Recipient's email address.
     * @param subject       Subject of the email.
     * @param body          Body of the email.
     * @param attachmentPath Path to the file to be attached (can be null).
     * @return true if the email is sent successfully, false otherwise.
     */
    public boolean sendEmail(String toEmail, String subject, String body, String attachmentPath) {
        try {
            // Create a MimeMessage
            MimeMessage message = mailSender.createMimeMessage();

            // Use MimeMessageHelper for richer email content
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            // Set email properties
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body);

            // Add an attachment if specified
            if (attachmentPath != null && !attachmentPath.isBlank()) {
                FileSystemResource file = new FileSystemResource(new File(attachmentPath));
                helper.addAttachment(file.getFilename(), file);
            }

            // Send the email
            mailSender.send(message);
            return true;

        } catch (MessagingException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Sends an invoice email with the generated invoice attached.
     *
     * @param order          The order for which the invoice is generated.
     * @param recipientEmail The recipient's email address.
     */
    public void sendInvoice(Order order, String recipientEmail) {
        // Generate the invoice (implement your own logic for generating invoice files)
        String invoicePath = generateInvoice(order);
        if (invoicePath != null) {
            sendEmail(recipientEmail, "Your Invoice", "Please find your invoice attached.", invoicePath);
        }
    }

    /**
     * Generates an invoice for the given order. Placeholder for actual implementation.
     *
     * @param order The order for which the invoice needs to be generated.
     * @return The file path of the generated invoice, or null if generation fails.
     */
    private String generateInvoice(Order order) {
        // TODO: Implement logic for generating an invoice file and return its path
        // For now, returning null as a placeholder
        return null;
    }
}