export const ICON_LABELS = {
  car: "Car",
  sportscar: "Sports car",
  truck: "Truck",
  gem: "Luxury",
  snowflake: "Air conditioning",
  navigation: "Navigation",
  bluetooth: "Bluetooth",
  baby: "Child seat",
  userplus: "Additional driver",
  fuel: "Fuel",
  gauge: "Mileage",
  users: "Passengers",
  briefcase: "Luggage",
  shield: "Insurance",
  wifi: "Wi-Fi",
  sun: "Sunroof",
  music: "Audio",
  zap: "Electric",
  key: "Key",
  pin: "Location",
  tag: "Tag",
};

export const CATEGORY_ICON_KEYS = ["car", "truck", "sportscar"];

export const KINDS = {
  brands: { label: "Brands", singular: "Brand" },
  categories: { label: "Categories", singular: "Category" },
  features: { label: "Features", singular: "Feature" },
  extras: { label: "Extras", singular: "Extra" },
};

export const EMPTY_FORMS = {
  brands: { name: "", slug: "" },
  categories: { icon: "car", name: "", active: true },
  features: { icon: "tag", name: "" },
  extras: {
    icon: "tag",
    name: "",
    price_per_day: 0,
    flat_price: 0,
    max_qty: 1,
    active: true,
  },
};

export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
