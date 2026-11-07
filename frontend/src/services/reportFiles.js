
const safeCell = (value) => {
  let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
};
export function serializeReport(dataset, records, format) {
  const clean = records.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => !/password|token|secret/i.test(key))));
  if (format === 'json') return JSON.stringify({ dataset, records: clean }, null, 2);
  const headers = [...new Set(clean.flatMap(Object.keys))];
  return '\ufeff' + [headers.map(safeCell).join(','), ...clean.map((row) => headers.map((key) => safeCell(row[key])).join(','))].join('\r\n');
}
