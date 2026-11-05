export const localMinute = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
export const nextMinute = () => localMinute(new Date(Math.floor(Date.now() / 60000) * 60000 + 60000));
export const localToday = () => localMinute(new Date()).slice(0, 10);
export const localTime = () => localMinute(new Date()).slice(11);

export const tripFromSearch = (search) => {
  const params = new URLSearchParams(search);
  const readTime = (kind) => {
    const value = `${params.get(`${kind}_date`)}T${params.get(`${kind}_time`)}`;
    if (!/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(value)) return "";
    const date = new Date(value);
    return Number.isFinite(date.getTime()) && localMinute(date) === value && date > new Date() ? value : "";
  };
  const pickup = readTime("departure");
  const returned = readTime("return");
  const readAgency = (key) =>
    /^\d+$/.test(params.get(key) || "") && Number(params.get(key)) > 0 ? params.get(key) : "";
  return {
    pickup,
    returned: pickup && returned > pickup ? returned : "",
    pickup_location: readAgency("pickup_location"),
    dropoff_location: readAgency("dropoff_location"),
  };
};
