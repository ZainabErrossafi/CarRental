import RentalSearch from "../../components/client/RentalSearch.jsx";
import heroImage from "../../assets/home-hero-rently.png";

const transitionColor = "#a89b94";

export default function ClientHome() {
  return (
    <>
      <section
        aria-labelledby="home-title"
        className="client-home-hero tw:relative tw:isolate tw:flex tw:box-border tw:min-h-[100svh] tw:flex-col tw:items-center tw:px-6 tw:pb-20 tw:pt-28 tw:text-center tw:text-white tw:md:pt-28"
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
    </>
  );
}
