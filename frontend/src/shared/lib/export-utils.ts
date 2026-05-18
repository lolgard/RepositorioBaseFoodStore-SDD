/**
 * Utility for exporting data to CSV format and triggering a browser download.
 */
export function downloadAsCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          const value = row[fieldName];
          // Handle values with commas or quotes
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
