import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useI18n } from '../context/I18nContext';

export default function SearchableSelect({ id, value, onChange, options, placeholder, required = false }) {
  const { t } = useI18n();
  const selected = value == null ? null
    : options.find((option) => String(option.value) === String(value)) ?? null;

  return (
    <Autocomplete
      id={id}
      className="searchable-select"
      options={options}
      value={selected}
      onChange={(_, option) => onChange(option ? String(option.value) : null)}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, current) => String(option.value) === String(current.value)}
      openOnFocus
      autoHighlight
      noOptionsText={t('No results')}
      clearText={t('Clear')}
      openText={t('Open')}
      closeText={t('Close')}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} required={required} />
      )}
    />
  );
}
