import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function ClientFooter({ home = false }) {
  return (
    <footer className={`client-footer${home ? " client-footer-home" : ""}`}>
      <div className="client-footer-grid">
        <div className="client-footer-company">
          <Link to="/" className="client-footer-brand">
            <span className="client-footer-logo">
              <img src={logo} alt="" />
            </span>
            Rently
          </Link>
          <p>Car rental in Morocco.</p>
        </div>
        <nav aria-label="Footer navigation">
          <h2>Liens rapides</h2>
          <Link to="/">Accueil</Link>
          <Link to="/vehicles">Vehicles</Link>
          <Link to="/faqs">FAQs</Link>
        </nav>
        <div className="client-footer-bottom">
          <span>© {new Date().getFullYear()} Rently — Tous droits réservés</span>
        </div>
      </div>
    </footer>
  );
}
