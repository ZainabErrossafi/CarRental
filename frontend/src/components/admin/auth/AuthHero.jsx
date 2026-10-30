import { useI18n } from "../../../context/I18nContext";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function AuthHero({ image }) {
  const { t } = useI18n();
  return (
    <div className="gcard-hero">
      <img src={image} alt="" className="gcard-hero-img" />
      <div className="gcard-hero-scrim" />

      <div className="gcard-hero-inner">
        <div className="gcard-hero-content signin">
          <h2>{t("Welcome back")}</h2>
          <p>{t("Please enter your credentials")}</p>
          <Link to="/terms" className="gcard-hero-terms">
            {t("Terms & Conditions")}
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="gcard-hero-content signup">
          <h2>{t("Join us today")}</h2>
          <p>{t("Creating an account is quick")}</p>
          <Link to="/terms" className="gcard-hero-terms">
            {t("Terms & Conditions")}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
