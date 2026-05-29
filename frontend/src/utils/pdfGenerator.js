import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate, computeRunningBalances } from "./calculations";

export const generatePDFReport = async (allTransactions, filteredTransactions, startingBalance, reportTitle, dateRangeText, showToast) => {
  try {
    if (showToast) showToast("Generating PDF Report...", "info");

    const doc = new jsPDF("p", "mm", "a4");
    
    // Compute chronological running balances for all transactions
    const runningBalances = computeRunningBalances(allTransactions, startingBalance);

    // Filter calculations for the report scope
    const totalDeposited = filteredTransactions
      .filter((t) => t.type === "saving")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawn = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Compute Opening Balance at the start of the filtered date window
    const sortedAll = [...allTransactions].sort((a, b) => {
      const dateA = a.date.split("-").map(Number);
      const dateB = b.date.split("-").map(Number);
      return new Date(dateA[0], dateA[1] - 1, dateA[2]).getTime() - new Date(dateB[0], dateB[1] - 1, dateB[2]).getTime();
    });

    const sortedFiltered = [...filteredTransactions].sort((a, b) => {
      const dateA = a.date.split("-").map(Number);
      const dateB = b.date.split("-").map(Number);
      return new Date(dateA[0], dateA[1] - 1, dateA[2]).getTime() - new Date(dateB[0], dateB[1] - 1, dateB[2]).getTime();
    });

    let openingBalance = startingBalance;
    if (sortedFiltered.length > 0) {
      const firstFilteredId = sortedFiltered[0].id;
      const firstFilteredIdx = sortedAll.findIndex((t) => t.id === firstFilteredId);
      if (firstFilteredIdx > 0) {
        openingBalance = runningBalances[sortedAll[firstFilteredIdx - 1].id];
      }
    }
    const closingBalance = openingBalance + totalDeposited - totalWithdrawn;

    // 1. STYLED HEADER BLOCK
    doc.setFillColor(17, 26, 21); // #111a15
    doc.rect(0, 0, 210, 35, "F");
    
    // Border line (neon green)
    doc.setDrawColor(0, 230, 118); // #00e676
    doc.setLineWidth(0.8);
    doc.line(0, 35, 210, 35);

    // Title
    doc.setTextColor(0, 230, 118); // #00e676
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("GREENLEDGER FINANCIAL TERMINAL", 14, 15);

    // Subtitle / Period
    doc.setTextColor(224, 255, 232); // #e0ffe8
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${reportTitle.toUpperCase()} - PERIOD: ${dateRangeText.toUpperCase()}`, 14, 23);

    // IST Generation Time
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const istTimeStr = formatter.format(now) + " IST";
    doc.setFontSize(7.5);
    doc.setTextColor(136, 207, 160); // #88cfa0
    doc.text(`Generated: ${istTimeStr}`, 14, 29);

    // 2. FOUR-COLUMN SUMMARY TABLE
    const summaryHeaders = [["Opening Balance", "Total Deposited", "Total Withdrawn", "Closing Balance"]];
    const summaryData = [[
      formatCurrency(openingBalance),
      formatCurrency(totalDeposited),
      formatCurrency(totalWithdrawn),
      formatCurrency(closingBalance)
    ]];

    autoTable(doc, {
      startY: 42,
      head: summaryHeaders,
      body: summaryData,
      theme: "grid",
      headStyles: {
        fillColor: [17, 26, 21],
        textColor: [0, 230, 118],
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 11,
        textColor: [17, 26, 21],
        fillColor: [240, 255, 245],
        halign: "center",
        fontStyle: "bold",
      },
      styles: {
        lineColor: [0, 230, 118],
        lineWidth: 0.2,
      },
    });

    // 3. FULL TRANSACTIONS TABLE
    const tableHeaders = [["Date", "Description", "Category", "Mode", "Deposited", "Withdrawn", "Balance"]];
    
    // Map transactions rows
    const tableData = sortedFiltered.map((t) => {
      const isSaving = t.type === "saving";
      const balanceVal = runningBalances[t.id] !== undefined ? runningBalances[t.id] : startingBalance;
      
      return [
        formatDate(t.date),
        t.title,
        t.category,
        t.paymentMode,
        isSaving ? formatCurrency(t.amount) : "-",
        !isSaving ? formatCurrency(t.amount) : "-",
        formatCurrency(balanceVal)
      ];
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: tableHeaders,
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [17, 26, 21],
        textColor: [0, 230, 118],
        fontSize: 9,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 2.5,
        textColor: [17, 26, 21],
      },
      columnStyles: {
        0: { cellWidth: 26 }, // Date
        1: { cellWidth: 42 }, // Description
        2: { cellWidth: 24 }, // Category
        3: { cellWidth: 18 }, // Mode
        4: { cellWidth: 26, halign: "right" }, // Deposited
        5: { cellWidth: 26, halign: "right" }, // Withdrawn
        6: { cellWidth: 28, halign: "right" }, // Balance
      },
      didParseCell: function (data) {
        if (data.section === 'body') {
          const rowIndex = data.row.index;
          const transaction = sortedFiltered[rowIndex];
          if (transaction) {
            if (transaction.type === 'saving') {
              // Light green tint for deposits
              data.cell.styles.fillColor = [225, 250, 235];
              data.cell.styles.textColor = [15, 80, 45];
            } else {
              // Light red tint for withdrawals
              data.cell.styles.fillColor = [254, 238, 238];
              data.cell.styles.textColor = [150, 25, 25];
            }
          }
        }
      },
    });

    // 4. FOOTER ON EVERY PAGE
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(136, 207, 160); // #88cfa0
      
      // Footer divider line
      doc.setDrawColor(0, 230, 118, 0.2);
      doc.setLineWidth(0.2);
      doc.line(14, 283, 196, 283);

      // Left side: Timestamp
      doc.text(`Generated: ${istTimeStr}`, 14, 287);
      
      // Right side: Page number
      const pageNumStr = `Page ${i} of ${pageCount}`;
      doc.text(pageNumStr, 196 - doc.getTextWidth(pageNumStr), 287);
    }

    const filename = `${reportTitle.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);

    if (showToast) showToast("PDF Report Exported ✅", "success");
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    if (showToast) showToast("Failed to export PDF", "error");
    return false;
  }
};
