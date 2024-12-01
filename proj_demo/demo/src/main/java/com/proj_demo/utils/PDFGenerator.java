package com.proj_demo.utils;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.proj_demo.models.Order;
import com.proj_demo.models.OrderItem;

import java.io.FileOutputStream;
import java.io.IOException;
import java.util.stream.Stream;

public class PDFGenerator {

    private static final Font TITLE_FONT = new Font(Font.FontFamily.TIMES_ROMAN, 18, Font.BOLD);
    private static final Font CONTENT_FONT = new Font(Font.FontFamily.TIMES_ROMAN, 12, Font.NORMAL);

    /**
     * Generates a PDF invoice for the given order.
     *
     * @param order The order to generate an invoice for.
     * @return The file path of the generated PDF.
     * @throws DocumentException If there is an error while creating the document.
     * @throws IOException       If there is an error writing the file.
     */
    public static String generateInvoicePDF(Order order) throws DocumentException, IOException {
        // Create a file path for the invoice
        String filePath = "invoices/invoice_" + order.getId() + ".pdf";

        // Ensure the invoices directory exists
        new java.io.File("invoices").mkdirs();

        // Create a document
        Document document = new Document();
        PdfWriter.getInstance(document, new FileOutputStream(filePath));

        // Open the document
        document.open();

        // Add invoice title
        Paragraph title = new Paragraph("Invoice for Order #" + order.getId(), TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("\n")); // Add a blank line

        // Add user details
        document.add(new Paragraph("Customer: " + order.getUserId(), CONTENT_FONT));
        document.add(new Paragraph("Delivery Address: " + order.getDeliveryAddress(), CONTENT_FONT));
        document.add(new Paragraph("Order Status: " + order.getStatus(), CONTENT_FONT));
        document.add(new Paragraph("\n"));

        // Add order items table
        PdfPTable table = new PdfPTable(4); // 4 columns: Product, Quantity, Price, Total
        addTableHeader(table);
        addOrderItemsToTable(table, order);
        document.add(table);

        // Add total price
        document.add(new Paragraph("\nTotal Price: $" + order.getTotalPrice(), CONTENT_FONT));

        // Close the document
        document.close();

        return filePath;
    }

    private static void addTableHeader(PdfPTable table) {
        Stream.of("Product", "Quantity", "Price", "Total").forEach(columnTitle -> {
            PdfPCell header = new PdfPCell();
            header.setPhrase(new Paragraph(columnTitle, CONTENT_FONT));
            table.addCell(header);
        });
    }

    private static void addOrderItemsToTable(PdfPTable table, Order order) {
        for (OrderItem item : order.getItems()) {
            table.addCell(new Paragraph(item.getProductName(), CONTENT_FONT));
            table.addCell(new Paragraph(String.valueOf(item.getQuantity()), CONTENT_FONT));
            table.addCell(new Paragraph("$" + item.getPriceAtPurchase(), CONTENT_FONT));
            table.addCell(new Paragraph("$" + (item.getQuantity() * item.getPriceAtPurchase()), CONTENT_FONT));
        }
    }
}