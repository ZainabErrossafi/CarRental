import { Link } from "react-router-dom";

export default function ClientNotFound() {
  return (
    <section aria-labelledby="not-found-title" className="tw:mx-auto tw:max-w-lg tw:py-16 tw:text-center">
      <p className="tw:m-0 tw:text-8xl tw:font-extrabold tw:text-[#ffc58c]">404</p>
      <h1 id="not-found-title" className="tw:mt-6 tw:text-3xl tw:font-bold">Page not found</h1>
      <p className="tw:mb-8 tw:text-[#526575]">
        We couldn’t find the page you’re looking for.
      </p>
      <Link
        to="/"
        className="tw:inline-flex tw:rounded-full tw:bg-[#ffc58c] tw:px-6 tw:py-3 tw:font-semibold tw:text-[#071b2e] tw:hover:bg-[#ffb36a] tw:focus-visible:outline-2 tw:focus-visible:outline-offset-4 tw:focus-visible:outline-[#071b2e]"
      >
        Back to home
      </Link>
    </section>
  );
}
