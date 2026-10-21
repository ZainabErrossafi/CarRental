// These editors save only in this browser; they do not publish to the backend.
const CATALOG_KEY = 'rently_local_catalog';
const SETTINGS_KEY = 'rently_local_settings';
const emptyCatalog = () => ({ brands: [], categories: [], features: [], extras: [] });
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
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error('Could not save in this browser. Storage may be full; try a smaller image.');
  }
  return value;
};
const validateKind = (kind) => {
  if (!Object.hasOwn(emptyCatalog(), kind)) throw new Error('Unknown catalog type.');
};
export const getCatalog = async () => read(CATALOG_KEY, emptyCatalog);
export const createCatalogItem = async (kind, fields) => {
  validateKind(kind);
  const catalog = await getCatalog();
  const item = { ...fields, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  catalog[kind].push(item);
  write(CATALOG_KEY, catalog);
  return item;
};
export const updateCatalogItem = async (kind, id, fields) => {
  validateKind(kind);
  const catalog = await getCatalog();
  const index = catalog[kind].findIndex((item) => item.id === id);
  if (index < 0) throw new Error('Catalog item not found.');
  catalog[kind][index] = { ...catalog[kind][index], ...fields, id, updated_at: new Date().toISOString() };
  write(CATALOG_KEY, catalog);
  return catalog[kind][index];
};
export const deleteCatalogItem = async (kind, id) => {
  validateKind(kind);
  const catalog = await getCatalog();
  catalog[kind] = catalog[kind].filter((item) => item.id !== id);
  write(CATALOG_KEY, catalog);
};
export const getSiteSettings = async () => read(SETTINGS_KEY, emptySettings);
export const updateSiteSettings = async (settings) => {
  const saved = write(SETTINGS_KEY, settings);
  window.dispatchEvent(new Event('rently:settings-updated'));
  return saved;
};
