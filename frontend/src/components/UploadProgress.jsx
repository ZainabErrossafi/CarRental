import { useI18n } from '../context/I18nContext';

export default function UploadProgress({ value, label = 'Uploading…' }) {
  const { t } = useI18n();
  return (
    <div className="vehicle-upload-progress" aria-live="polite" aria-atomic="true">
      <div className="vehicle-upload-progress-label">
        <span>{t(label)}</span>
        {value != null && <span>{value}%</span>}
      </div>
      <progress aria-label={t(label)} max={100} value={value ?? undefined} />
    </div>
  );
}
