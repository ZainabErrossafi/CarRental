
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
export function parseReport(text, filename, dataset, t = (key, values = {}) => key.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match)) {
  text = text.replace(/^\ufeff/, '');
  let records;
  if (/\.json$/i.test(filename)) {
    const payload = JSON.parse(text);
    if (!Array.isArray(payload) && payload?.dataset && payload.dataset !== dataset) throw new Error(t('The file belongs to a different dataset.'));
    records = Array.isArray(payload) ? payload : payload?.records;
  } else if (/\.csv$/i.test(filename)) {
    const rows = []; let row = [], cell = '', quoted = false, closed = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (quoted) {
        if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (char === '"') { quoted = false; closed = true; }
        else cell += char;
      } else if (char === '"' && !cell && !closed) quoted = true;
      else if (char === ',' || char === '\n' || char === '\r') {
        row.push(cell); cell = ''; closed = false;
        if (char !== ',') { if (char === '\r' && text[i + 1] === '\n') i++; if (row.some(Boolean)) rows.push(row); row = []; }
      } else {
        if (closed || char === '"') throw new Error(t('Invalid CSV quoting.'));
        cell += char;
      }
    }
    if (quoted) throw new Error(t('Unclosed CSV quote.'));
    row.push(cell); if (row.some(Boolean)) rows.push(row);
    const headers = rows.shift();
    if (!headers?.length || headers.some((key) => !key.trim()) || new Set(headers).size !== headers.length) throw new Error(t('CSV must have unique, nonempty headers.'));
    records = rows.map((values, index) => {
      if (values.length !== headers.length) throw new Error(t('Row {row}: column count does not match the headers.', { row: index + 1 }));
      return Object.fromEntries(headers.map((key, index) => {
        let value = values[index];
        if (/^'[\s]*[=+\-@]/.test(value)) value = value.slice(1);
        if (/^[\[{]/.test(value)) { try { value = JSON.parse(value); } catch {                                  } }
        return [key, value];
      }));
    });
  } else throw new Error(t('Choose a CSV or JSON file.'));
  if (!Array.isArray(records) || !records.length || records.length > 1000) throw new Error(t('Provide between 1 and 1,000 records.'));
  if (records.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error(t('Every record must be an object with named fields.'));
  return records;
}

const writable = {
  locations: ['name', 'name_fr', 'name_ar', 'city', 'country', 'active'],
  vehicles: ['brand', 'category', 'home_location', 'features', 'model', 'year', 'status', 'is_featured', 'transmission', 'fuel', 'seats', 'doors', 'luggage', 'air_conditioning', 'daily_rate', 'deposit', 'daily_mileage_limit', 'min_driver_age', 'min_license_years', 'description_en', 'description_fr', 'description_ar'],
};
const required = { locations: ['name', 'city', 'country'], vehicles: ['brand', 'category', 'model', 'year', 'transmission', 'fuel', 'seats', 'doors', 'daily_rate'] };
export function prepareImport(dataset, records, existing, t = (key, values = {}) => key.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match)) {
  const errors = [], operations = [], seen = new Set();
  records.forEach((row, index) => {
    const issues = [];
    const id = row.id == null || row.id === '' ? null : String(row.id);
    if (id && !existing.some((item) => String(item.id) === id)) issues.push(t('ID does not exist. Leave ID empty to create a record.'));
    if (id && seen.has(id)) issues.push(t('Duplicate ID.'));
    if (id) seen.add(id);
    const fields = Object.fromEntries(Object.entries(row).filter(([key]) => writable[dataset].includes(key)));
    for (const [key, value] of Object.entries(fields)) {
      if (['active', 'is_featured', 'air_conditioning'].includes(key) && typeof value === 'string') {
        if (!/^(true|false|1|0)$/i.test(value)) issues.push(t('{field}: use true or false.', { field: key }));
        else fields[key] = /^(true|1)$/i.test(value);
      }
      if (['home_location', 'daily_mileage_limit'].includes(key) && value === '') fields[key] = null;
    }
    if (!id) required[dataset].forEach((key) => { if (fields[key] == null || fields[key] === '') issues.push(t('{field} is required.', { field: key })); });
    if (!Object.keys(fields).length) issues.push(t('No supported fields found.'));
    if (issues.length) errors.push({ row: index + 1, errors: issues });
    else operations.push({ id, fields, row: index + 1 });
  });
  return { errors, operations, created: operations.filter((item) => !item.id).length, updated: operations.filter((item) => item.id).length };
}
