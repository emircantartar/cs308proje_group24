import fs from "fs";
import PDFDocument from "pdfkit";
//import Orders from "../../frontend/src/pages/Orders";

const generateInvoice = (order, user, filePath) => {
    const doc = new PDFDocument();

    // Save the PDF to the file system
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc
        .fontSize(20)
        .text("Invoice", { align: "center" })
        .moveDown();

    // User Info
    doc
        .fontSize(12)
        .text(`Name: ${user.name} `)
        .text(`Email: ${user.email}`)
        .moveDown();

    // Order Info
    doc
        .fontSize(14)
        .text("Order Details:")
        .moveDown();

    order.items.forEach((item) => {
        doc
            .fontSize(12)
            .text(`- ${item.name} (${item.size}) x ${item.quantity}: $ ${item.price * item.quantity}`);
    });

    doc
        .moveDown()
        .text(`Delivery Fee: $10`)
        .text(`Total: $ ${order.amount}`)
        .moveDown();

    // Footer
    doc
        .fontSize(10)
        .text("Thank you for shopping with us!", { align: "center" });

    doc.end();
};

export default generateInvoice;
