package com.proj_demo.repositories;

import com.proj_demo.models.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    /**
     * Find an invoice by order ID.
     *
     * @param orderId the order ID
     * @return an Optional containing the invoice, if found
     */
    Optional<Invoice> findByOrderId(String orderId);
}