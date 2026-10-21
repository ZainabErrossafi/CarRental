import VehicleCard from "../../components/client/VehicleCard.jsx";
import vehicles from "../../data/vehicles.js";
import heroImage from "../../assets/home-hero-rently.png";

const transitionColor = "#a08b85";

export default function ClientHome() {
  return (
    <>
      <section
        aria-labelledby="home-title"
        className="tw:flex tw:min-h-[640px] tw:flex-col tw:items-center tw:bg-[#021731] tw:bg-cover tw:bg-center tw:px-6 tw:pb-20 tw:pt-44 tw:text-center tw:text-white tw:md:min-h-[min(820px,100svh)] tw:md:pt-48"
        style={{ backgroundImage: `linear-gradient(to bottom, transparent calc(100% - 80px), ${transitionColor} 100%), linear-gradient(180deg, rgba(2, 23, 49, 0.65) 0%, rgba(2, 23, 49, 0.24) 65%, rgba(2, 23, 49, 0.12) 100%), url(${heroImage})` }}
      >
        <h1 id="home-title" className="tw:m-0 tw:max-w-[1000px] tw:text-[clamp(36px,5vw,64px)] tw:font-bold tw:leading-tight tw:text-white tw:drop-shadow-lg">Find your next drive with Rently</h1>
        <p className="tw:mt-4 tw:max-w-[680px] tw:text-base tw:text-white tw:drop-shadow-md tw:md:text-lg">Discover our fleet and explore Morocco at your own pace.</p>
      </section>
      <div style={{ background: `linear-gradient(to bottom, ${transitionColor} 0px, #b9aaa0 70px, #e8dfd4 150px, #fdfaf5 240px, rgba(253, 250, 245, 0) 340px)` }}>
      <section aria-labelledby="fleet-heading" className="tw:mx-auto tw:w-[90%] tw:max-w-[1120px] tw:pb-12 tw:pt-64">
        <h2 id="fleet-heading">Explore the fleet</h2>
        <div className="tw:grid tw:grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] tw:gap-6">
          {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      </section>
      </div>
    </>
  );
}
