/**
 * exportData.js
 * Shared utility for exporting tabular data to Excel (.xlsx) or PDF.
 * Uses SheetJS for Excel and jsPDF + jspdf-autotable for PDF.
 *
 * Usage:
 *   exportData({ format: 'excel', filename: 'orders', headers, rows })
 *   exportData({ format: 'pdf',   filename: 'orders', headers, rows, title })
 *
 * @param {Object} options
 * @param {'excel'|'pdf'|'csv'} options.format
 * @param {string}   options.filename  - file name without extension
 * @param {string}   options.title     - page title for PDF header
 * @param {string[]} options.headers   - column header labels
 * @param {Array[]}  options.rows      - array of arrays (one per row)
 */
export async function exportData({ format, filename, title, headers, rows }) {
  if (!rows || rows.length === 0) {
    alert('No data to export.');
    return;
  }

  const ts = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const fullName = `${filename}_${ts}`;

  if (format === 'excel') {
    const { utils, writeFile } = await import('xlsx');
    const ws = utils.aoa_to_sheet([headers, ...rows]);

    // Auto-width columns
    const colWidths = headers.map((h, i) => ({
      wch: Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length)) + 2,
    }));
    ws['!cols'] = colWidths;

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Data');
    writeFile(wb, `${fullName}.xlsx`);

  } else if (format === 'pdf') {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    // Header
    doc.setFontSize(18);
    doc.setTextColor(0, 212, 255);
    doc.text(title || filename, 40, 40);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 140);
    doc.text(`Exported on ${new Date().toLocaleString('en-IN')}   |   Total: ${rows.length} records`, 40, 58);

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 72,
      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: [220, 220, 230],
        fillColor: [20, 20, 30],
        lineColor: [40, 40, 60],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [0, 80, 100],
        textColor: [0, 212, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: [26, 26, 40] },
      tableLineColor: [40, 40, 60],
      tableLineWidth: 0.5,
    });

    doc.save(`${fullName}.pdf`);

  } else if (format === 'csv') {
    const csvRows = [headers, ...rows].map(row =>
      row.map(cell => {
        const s = String(cell ?? '').replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      }).join(',')
    );
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
