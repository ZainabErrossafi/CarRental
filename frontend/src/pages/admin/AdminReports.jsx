import { useI18n } from "../../context/I18nContext";
import UploadProgress from '../../components/UploadProgress';
import { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, FileJson, Database, CheckCircle2, ArrowRight, FileUp, Info, X } from 'lucide-react';
import { getVehicles, getLocations, getReservations, getUsers, getReviews, createVehicle, updateVehicle, createLocation, updateLocation } from '../../services/adminApi';
import { serializeReport, parseReport, prepareImport } from '../../services/reportFiles';

const LOADERS = { vehicles: getVehicles, locations: getLocations, reservations: getReservations, users: getUsers, reviews: getReviews };
const WRITERS = { vehicles: { create: createVehicle, update: updateVehicle }, locations: { create: createLocation, update: updateLocation } };
const DATASETS = ['vehicles', 'locations', 'reservations', 'users', 'reviews'];

export default function AdminReports() {
  const { t } = useI18n();
  const fileInput = useRef(null);
  const [dataset, setDataset] = useState('vehicles');
  const [format, setFormat] = useState('csv');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const importable = ['vehicles', 'locations'].includes(dataset);

  const reset = () => { setPreview(null); setMessage(''); setErrors([]); };
  const fail = (error) => {
    setMessage(error.response?.data?.detail || error.message);
    setErrors(error.response?.data?.errors || []);
    setPreview(null);
  };
  const download = async () => {
    setBusy(true); reset();
    try {
      const records = await LOADERS[dataset]();
      const content = serializeReport(dataset, records, format);
      const url = URL.createObjectURL(new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' }));
      const link = document.createElement('a');
      link.href = url; link.download = `${dataset}-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(t('Report downloaded.'));
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try { error.message = JSON.parse(await error.response.data.text()).detail || error.message; } catch { /* Keep API error. */ }
      }
      fail(error);
    } finally { setBusy(false); }
  };
  const upload = async (isPreview) => {
    if (busy) return;
    setBusy(true); setErrors([]); setMessage('');
    setImportProgress({ value: isPreview ? null : 0, label: isPreview ? 'Validating file…' : 'Importing records…' });
    try {
      if (isPreview) {
        const records = parseReport(await file.text(), file.name, dataset, t);
        const plan = prepareImport(dataset, records, await LOADERS[dataset](), t);
        if (plan.errors.length) { setErrors(plan.errors); setPreview(null); setMessage(t('Fix the listed rows before importing.')); }
        else { setPreview(plan); setMessage(t('File checked. The server validates each record when saved.')); }
      } else {
        let saved = 0;
        for (const operation of preview.operations) {
          try {
            if (operation.id) await WRITERS[dataset].update(encodeURIComponent(operation.id), operation.fields);
            else await WRITERS[dataset].create(operation.fields);
            saved++;
            setImportProgress({ value: Math.round(saved / preview.operations.length * 100), label: 'Importing records…' });
          } catch (error) {
            setErrors([{ row: operation.row, errors: error.response?.data || error.message }]);
            setMessage(t('{saved} records saved. Import stopped at row {row}. Remaining rows were not saved. Export current data before retrying to avoid duplicates.', { saved, row: operation.row }));
            setPreview(null);
            return;
          }
        }
        setPreview(null); setFile(null);
        if (fileInput.current) fileInput.current.value = '';
        setMessage(t('Import completed.'));
      }
    } catch (error) { fail(error); }
    finally { setBusy(false); setImportProgress(null); }
  };

  const removeFile = () => {
    if (busy) return;
    setFile(null);
    setDragging(false);
    reset();
    if (fileInput.current) fileInput.current.value = '';
  };

  const selectFile = (selected) => {
    reset();
    if (selected && (!/\.(csv|json)$/i.test(selected.name) || selected.size > 5 * 1024 * 1024)) {
      setFile(null); setMessage(t('Choose a CSV or JSON file up to 5 MB.'));
    } else setFile(selected || null);
  };

  return (
    <div className="reports-page">
      <div className="reports-heading">
        <div><span className="reports-eyebrow">{t('DATA MANAGEMENT')}</span><h1>{t('Reports & Data')}</h1><p>{t('Your business data, ready to move. Export reports or bring in new records.')}</p></div>
        <span className="reports-heading-badge"><Database size={15} /> {t('CSV & JSON')}</span>
      </div>
      <div className="reports-dataset-bar">
        <div className="reports-bar-icon"><Database size={20} /></div>
        <label htmlFor="report-dataset"><strong>{t('Choose your dataset')}</strong><span>{t('Select the records you want to work with.')}</span></label>
        <select id="report-dataset" value={dataset} disabled={busy} onChange={(e) => { setDataset(e.target.value); setFile(null); reset(); }}>
          {DATASETS.map((name) => <option key={name} value={name}>{t(name.charAt(0).toUpperCase() + name.slice(1))}</option>)}
        </select>
      </div>
      <div className="reports-grid">
        <section className="reports-card">
          <div className="reports-card-heading"><span className="reports-icon orange"><Download size={22} /></span><span className="reports-step">01 / {t('EXPORT')}</span></div>
          <h2>{t('Export a report')}</h2><p className="reports-description">{t('Download a complete copy of your selected dataset in the format you need.')}</p>
          <fieldset className="reports-formats" disabled={busy}><legend>{t('File format')}</legend>
            {[{ value: 'csv', label: 'CSV', description: 'For Excel & spreadsheets', Icon: FileSpreadsheet }, { value: 'json', label: 'JSON', description: 'For apps & data backups', Icon: FileJson }].map(({ value, label, description, Icon }) => (
              <label key={value} className={`reports-format ${format === value ? 'selected' : ''}`}><input type="radio" name="report-format" value={value} checked={format === value} onChange={() => setFormat(value)} /><Icon size={25} /><strong>{label}</strong><span>{t(description)}</span><span className="reports-radio" /></label>
            ))}
          </fieldset>
          <div className="reports-export-summary"><CheckCircle2 size={16} /><span>{t('All records included in your export')}</span></div>
          <button className="reports-primary" disabled={busy} onClick={download}><Download size={17} />{t('Export report')}<ArrowRight size={17} /></button>
          <span className="reports-footnote">{t('Your file downloads directly to your device.')}</span>
        </section>
        <section className="reports-card">
          <div className="reports-card-heading"><span className="reports-icon blue"><Upload size={22} /></span><span className="reports-step">02 / {t('IMPORT')}</span></div>
          <h2>{t('Import your data')}</h2><p className="reports-description">{t('Upload a file, check your records, then confirm the import.')}</p>
          {importable ? <>
            <input className="reports-file-input" aria-label={t('Import file')} ref={fileInput} key={dataset} type="file" accept=".csv,.json" disabled={busy} onChange={(e) => selectFile(e.target.files?.[0])} />
            <button type="button" className={`reports-dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`} disabled={busy} onClick={() => fileInput.current?.click()} onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); if (!busy) selectFile(e.dataTransfer.files?.[0]); }}>
              <span className="reports-upload-icon">{file ? <FileSpreadsheet size={26} /> : <FileUp size={26} />}</span>
              <strong>{file ? file.name : t('Click to upload or drag & drop')}</strong><span>{file ? `${(file.size / 1024).toFixed(1)} KB · ${t('Click to change file')}` : t('CSV or JSON · Up to 5 MB')}</span>
            </button>
            {file && <button type="button" className="reports-remove-file" disabled={busy} onClick={removeFile}><X size={16} />{t('Remove')}</button>}
            <div className="reports-import-meta"><span>{t('Up to 1,000 records')}</span><span>{t('Preview before saving')}</span></div>
            {importProgress && <UploadProgress value={importProgress.value} label={importProgress.label} />}
            {preview && <div className="reports-preview"><CheckCircle2 size={19} /><span><strong>{preview.created}</strong> {t('to create')}<span className="reports-divider">/</span><strong>{preview.updated}</strong> {t('to update')}</span></div>}
            <button className={preview ? 'reports-primary' : 'reports-secondary'} disabled={busy || !file} onClick={() => upload(!preview)}>{preview ? <Upload size={17} /> : <CheckCircle2 size={17} />}{t(preview ? 'Confirm import' : 'Validate file')}<ArrowRight size={17} /></button>
          </> : <div className="reports-unavailable"><Database size={30} /><strong>{t('Export available')}</strong><p>{t('Choose Vehicles or Locations to import records.')}</p></div>}
        </section>
      </div>
      {(busy || message) && <div className={`reports-notice ${errors.length ? 'error' : ''}`} role="status"><Info size={18} /><span>{busy ? t('Processing…') : message}</span></div>}
      {errors.length > 0 && <div className="reports-errors" role="alert"><table><thead><tr><th>{t('Row')}</th><th>{t('Errors')}</th></tr></thead><tbody>{errors.map((entry) => <tr key={entry.row}><td>{entry.row}</td><td><pre>{JSON.stringify(entry.errors, null, 2)}</pre></td></tr>)}</tbody></table></div>}
      <details className="reports-guide"><summary><Info size={17} />{t('How to prepare your import file')}</summary><div><p>{t('Use an exported report as your template. Existing IDs update records; leave ID empty to create a record.')}</p><p>{t('Records are saved one at a time. If a request fails, earlier records remain saved and the import stops.')}</p>{dataset === 'vehicles' && <p>{t('Vehicle relationships use backend IDs; features use a JSON array of IDs. For new vehicles, brand and category IDs must already exist.')}</p>}</div></details>
    </div>
  );
}
