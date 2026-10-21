import { ArrowUpRight, Leaf, Building2, Mountain } from "lucide-react";
import { Link } from "react-router-dom";

export const rentalCategories = [
  { name: "Economy", label: "ECO", icon: Leaf, color: "#446849", background: "#e6eddf", tagline: "More memories. Less spending.", description: "Easy city drives and everyday escapes." },
  { name: "Compact", label: "CITY", icon: Building2, color: "#45687a", background: "#e1ebef", tagline: "Small car. Big possibilities.", description: "Made for winding streets and weekend plans." },
  { name: "SUV", label: "SUV", icon: Mountain, color: "#865f3e", background: "#f0e5d7", tagline: "Room for the whole adventure.", description: "Extra space for family trips and open roads." },
];

export default function CategoryCard({ category, index }) {
  const Icon = category.icon;
  return (
    <Link to={`/vehicles?category=${encodeURIComponent(category.name)}`} className="rental-category-card">
      <div className="rental-category-art rental-category-symbol" style={{ color: category.color, background: category.background }}>
        <span className="rental-category-number">0{index + 1}</span>
        <div className="rental-category-emblem" aria-hidden="true"><Icon size={54} strokeWidth={1.3} /></div>
        <span className="rental-category-label" aria-hidden="true">{category.label}</span>
      </div>
      <div className="rental-category-content">
        <h3>{category.name}</h3>
        <p className="rental-category-tagline">{category.tagline}</p>
        <p className="rental-category-description">{category.description}</p>
        <span className="rental-category-action">Explore {category.name} <ArrowUpRight size={18} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
