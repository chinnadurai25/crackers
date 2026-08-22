import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateBill = (order, openWindow = true) => {
  const doc = new jsPDF();
  
  // ----- HEADER SECTION -----
  // Company Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MAGICAL CRACKERS", 105, 20, null, null, "center");
  
  // Company Address
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("3/57A15/C2, RAMACHANDRAPURAM, ANAIYUR SOUTH VILLAGE", 105, 28, null, null, "center");
  doc.text("SIVAKASI, Virudhunagar - 626124", 105, 34, null, null, "center");
  doc.text("Email: ke.info16@gmail.com | Mobile: +91 6380037709", 105, 40, null, null, "center");

  // Divider Line
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);

  // ----- INVOICE DETAILS -----
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ESTIMATE / BILL", 105, 53, null, null, "center");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Order ID:", 14, 62);
  doc.setFont("helvetica", "normal");
  doc.text(order.id || order.orderId, 32, 62);

  const orderDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN') 
    : new Date().toLocaleDateString('en-IN');
  
  doc.setFont("helvetica", "bold");
  doc.text("Date:", 150, 62);
  doc.setFont("helvetica", "normal");
  doc.text(orderDate, 162, 62);

  // ----- CUSTOMER DETAILS -----
  doc.setFont("helvetica", "bold");
  doc.text("Customer Details:", 14, 72);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${order.customerName || 'N/A'}`, 14, 78);
  doc.text(`Mobile: ${order.mobile || 'N/A'}`, 14, 84);
  if (order.address) {
    doc.text(`Address: ${order.address}`, 14, 90);
    doc.text(`${order.city || ''} - ${order.pincode || ''}`, 14, 96);
  }

  // ----- TABLE SECTION -----
  const tableData = [];
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach((item, index) => {
      const packingInfo = item.piecesPerBox 
        ? ` (${item.boxType || '1 Box'} - ${item.piecesPerBox})`
        : (item.boxType && item.boxType !== '1 Box' ? ` (${item.boxType})` : '');
      tableData.push([
        index + 1,
        `${item.name}${packingInfo}`,
        item.category || '-',
        `${item.quantity} x Rs.${Number(item.price).toFixed(2)}`,
        `Rs. ${(Number(item.price) * Number(item.quantity)).toFixed(2)}`
      ]);
    });
  }

  const finalY = order.address ? 102 : 92;

  autoTable(doc, {
    startY: finalY,
    head: [['S.No', 'Product Name', 'Category', 'Qty x Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left', cellWidth: 70 },
      2: { halign: 'left', cellWidth: 35 },
      3: { halign: 'center', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 30 },
    },
    didDrawPage: function (data) {
      // Optional footer or pagination can go here
    }
  });

  // ----- TOTAL AMOUNT SECTION -----
  const tableEndY = doc.lastAutoTable.finalY || finalY;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount:", 135, tableEndY + 10);
  
  // Format total amount
  const total = Number(order.totalAmount).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  });
  doc.text(total, 160, tableEndY + 10);

  // ----- FOOTER -----
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for choosing Magical Crackers!", 105, tableEndY + 25, null, null, "center");
  doc.text("This is a computer-generated document. No signature is required.", 105, tableEndY + 30, null, null, "center");

  const filename = `Magical_Crackers_Bill_${order.id || order.orderId}.pdf`;

  if (openWindow) {
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Failed to open PDF in new tab, falling back to download", err);
      doc.save(filename);
    }
  }

  return doc;
};
