import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { CATALOG_ICONS } from "../CatalogIcons.jsx";
import { Link } from "react-router-dom";

export const rentalCategories = [
  { name: "Economy", label: "ECO", icon: "car", color: "#446849", background: "#e6eddf", tagline: "More memories. Less spending.", description: "Easy city drives and everyday escapes." },
  { name: "Compact", label: "CITY", icon: "car", color: "#45687a", background: "#e1ebef", tagline: "Small car. Big possibilities.", description: "Made for winding streets and weekend plans." },
  { name: "SUV", label: "SUV", icon: "truck", color: "#865f3e", background: "#f0e5d7", tagline: "Room for the whole adventure.", description: "Extra space for family trips and open roads." },
];

export default function CategoryCard({ category, index }) {
  const Icon = CATALOG_ICONS[category.icon] || CATALOG_ICONS.car;
  const locked = category.active === false;
  const Wrapper = locked ? "article" : Link;
  return (
    <Wrapper {...(locked ? { "aria-disabled": true } : { to: `/vehicles?category=${encodeURIComponent(category.name)}` })} className={`rental-category-card${locked ? " rental-category-locked" : ""}`}>
      <div className="rental-category-art rental-category-symbol" style={{ color: category.color, background: category.background }}>
        <span className="rental-category-number">0{index + 1}</span>
        <div className="rental-category-emblem" aria-hidden="true">{locked ? <LockKeyhole size={42} strokeWidth={1.3} /> : <Icon size={42} strokeWidth={1.3} />}</div>
        <span className="rental-category-label" aria-hidden="true">{category.label}</span>
      </div>
      <div className="rental-category-content">
        <h3>{category.name}</h3>
        <p className="rental-category-tagline">{category.tagline}</p>
        <p className="rental-category-description">{category.description}</p>
        <span className="rental-category-action">{locked ? "Unavailable" : `Explore ${category.name}`} {locked ? <LockKeyhole size={16} aria-hidden="true" /> : <ArrowUpRight size={18} aria-hidden="true" />}</span>
      </div>
    </Wrapper>
  );
}
