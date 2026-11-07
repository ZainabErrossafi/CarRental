const SETTINGS_KEY = 'rently_local_settings';
const emptySettings = () => Object.fromEntries([
  'company_name', 'email', 'phone', 'whatsapp', 'address', 'city', 'country',
  'facebook', 'instagram', 'twitter', 'linkedin', 'hero_image',
  'hero_title_en', 'hero_subtitle_en', 'about_en',
].map((key) => [key, '']));

const read = (key, defaults) => {
  try {
    return { ...defaults(), ...JSON.parse(localStorage.getItem(key) || '{}') };
  } catch {
    return defaults();
  }
};
export const getSiteSettings = async () => read(SETTINGS_KEY, emptySettings);
