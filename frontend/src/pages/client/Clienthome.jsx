import RentalSearch from "../../components/client/RentalSearch.jsx";
import CategoryCard, { rentalCategories } from "../../components/client/CategoryCard.jsx";
import heroImage from "../../assets/home-hero-rently.png";
import { useEffect, useState } from "react";
import { getList } from "../../services/api.js";

const transitionColor = "#a89b94";

export default function ClientHome() {
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
      const items = await getList("categories/");
      if (!active) return;
      setCategoryError("");
      setCategories(Array.from({ length: 3 }, (_, index) => {
        const item = items[index];
        if (!item) return { ...rentalCategories[index], id: `locked-${index}`, name: "Coming soon", label: "LOCKED", active: false, tagline: "More choices on the way.", description: "This category is not available yet." };
        const style = rentalCategories.find((sample) => sample.name.toLowerCase() === item.name.toLowerCase()) || rentalCategories[index % rentalCategories.length];
        return { ...style, ...item, label: item.name, tagline: item.tagline || "Your next journey starts here.", description: item.description || `Discover our ${item.name} collection.` };
      }));
      } catch { if (active) setCategoryError("Categories are temporarily unavailable. Please try again shortly."); }
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("rently:catalog-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("rently:catalog-updated", refresh);
    };
  }, []);
  return (
    <>
      <section
        aria-labelledby="home-title"
        className="tw:relative tw:isolate tw:flex tw:box-border tw:min-h-[100svh] tw:flex-col tw:items-center tw:px-6 tw:pb-20 tw:pt-28 tw:text-center tw:text-white tw:md:pt-28"
      >
        <div
          aria-hidden="true"
          className="tw:pointer-events-none tw:absolute tw:inset-0 tw:-z-10 tw:bg-cover tw:bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(168, 155, 148, 0) calc(100% - 140px), rgba(168, 155, 148, 0.5) calc(100% - 70px), ${transitionColor} 100%), linear-gradient(180deg, rgba(2, 23, 49, 0.65) 0%, rgba(2, 23, 49, 0.24) 65%, rgba(2, 23, 49, 0.12) 100%), url(${heroImage})`,
          }}
        />
        <div className="client-hero-copy tw:mx-auto tw:w-full tw:max-w-[1120px] tw:text-center">
          <p className="tw:mb-3 tw:mt-0 tw:text-lg tw:font-normal tw:uppercase tw:tracking-wide tw:text-white tw:md:text-2xl">Welcome to Rently</p>
          <h1 id="home-title" className="tw:mx-auto tw:my-0 tw:max-w-[850px] tw:text-[clamp(36px,5.5vw,72px)] tw:font-extrabold tw:uppercase tw:tracking-[-0.02em] tw:leading-[1.2] tw:text-white tw:drop-shadow-lg">Find your next drive<br />with Rently</h1>
          <p className="tw:mx-auto tw:mb-0 tw:mt-5 tw:max-w-[540px] tw:text-base tw:font-normal tw:leading-relaxed tw:text-white/80 tw:drop-shadow-md tw:md:text-lg">Discover our fleet and explore Morocco at your own pace.</p>
        </div>
        <RentalSearch />
      </section>
      <div className="client-page-gradient" style={{ backgroundImage: `linear-gradient(to bottom, ${transitionColor} 0px, rgba(168, 155, 148, 0.85) 35px, rgba(168, 155, 148, 0.5) 90px, rgba(168, 155, 148, 0.15) 160px, transparent 240px), radial-gradient(ellipse at 100% 0%, rgba(255, 197, 140, 0.3), transparent 48%), radial-gradient(ellipse at 0% 45%, rgba(175, 199, 216, 0.2), transparent 52%), linear-gradient(180deg, #fdfaf5 0%, #f4f6f7 65%, #fdfaf5 100%)` }}>
      <section aria-labelledby="fleet-heading" className="tw:mx-auto tw:w-[90%] tw:max-w-[1120px] tw:py-12">
        <div className="rental-category-heading">
          <p>Our collection</p>
          <h2 id="fleet-heading">Find your kind of car<span aria-hidden="true">.</span></h2>
          <span>Choose the right car for your next journey.</span>
        </div>
        <div className="rental-category-grid">
          {categoryError && <p role="status">{categoryError}</p>}
          {categories.map((category, index) => <CategoryCard key={category.id || category.name} category={category} index={index} />)}
        </div>
      </section>
      </div>

    </>
  );
}
