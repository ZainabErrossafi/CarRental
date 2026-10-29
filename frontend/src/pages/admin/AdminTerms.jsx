import { useI18n } from "../../context/I18nContext";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import logo from "../../assets/logo.png";

const SECTIONS = [
  {
    id: "using-rently",
    title: "Using Rently",
    text: "Use Rently to explore vehicles, manage bookings, and access the services available to your account. Provide accurate information and use the platform responsibly.",
  },
  {
    id: "your-account",
    title: "Your account",
    text: "Keep your login details private. Use only an account you are authorized to access, and contact the rental team if you believe someone else has accessed your account.",
  },
  {
    id: "reservations",
    title: "Reservations and availability",
    text: "Vehicle availability, pickup and return arrangements, and booking confirmation should be checked with the rental team. Review your reservation details before submitting a request.",
  },
  {
    id: "rental-requirements",
    title: "Rental requirements",
    text: "Driver eligibility, required documents, deposits, mileage limits, and vehicle use conditions are specified in the agreement for your rental. Confirm these requirements before collecting a vehicle.",
  },
  {
    id: "prices-and-changes",
    title: "Prices, changes, and cancellations",
    text: "Review the price and any selected extras before confirming your booking. Payment, changes, cancellations, and refunds are subject to the conditions stated in your rental agreement; contact the rental team for details.",
  },
  {
    id: "your-information",
    title: "Your information",
    text: "Share only the information needed for your account or reservation. Avoid entering sensitive information in reviews, public questions, or other content visible to others.",
  },
  {
    id: "questions",
    title: "Questions about these terms",
    text: "If you have questions about the platform or a rental, contact the rental team using the details provided with your booking. Ask for clarification before accepting conditions you do not understand.",
  },
];

export default function AdminTerms() {
  const { t } = useI18n();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="terms-page">
      <header className="terms-topbar">
        <Link to="/login" className="terms-brand" aria-label={t("Back to log in")}>
          <img src={logo} alt="" />
          <span>Rently</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="terms-container">
        <Link to="/login" className="terms-back">
          <ArrowLeft size={16} /> {t("Back to log in")}
        </Link>
        <div className="terms-heading">
          <span className="terms-icon"><FileText size={24} /></span>
          <h1>{t("Terms & Conditions")}</h1>
          <p>{t("A guide to using Rently and preparing for your rental.")}</p>
        </div>

        <div className="terms-layout">
          <nav className="terms-contents" aria-label={t("On this page")}>
            <span className="terms-contents-title">{t("On this page")}</span>
            {SECTIONS.map((section, index) => (
              <a href={`#${section.id}`} key={section.id}>
                <span>{index + 1}</span>{t(section.title)}
              </a>
            ))}
          </nav>

          <article className="terms-document">
            <p className="terms-intro">
              {t("These general terms describe use of the platform. Your booking confirmation and rental agreement provide the specific conditions for your rental.")}
            </p>
            {SECTIONS.map((section, index) => (
              <section id={section.id} key={section.id} className="terms-section">
                <h2><span>{index + 1}.</span> {t(section.title)}</h2>
                <p>{t(section.text)}</p>
              </section>
            ))}
            <div className="terms-document-footer">
              <Link to="/login" className="btn btn-primary">{t("Back to log in")}</Link>
            </div>
          </article>
        </div>
      </main>
      <footer className="terms-footer">Rently · {t("Terms & Conditions")}</footer>
    </div>
  );
}
