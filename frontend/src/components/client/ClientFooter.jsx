import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import logo from "../../assets/logo.png";
import { getSiteSettings } from "../../services/localAdminData";

const socialNetworks = [
  ["facebook", "Facebook", Facebook],
  ["instagram", "Instagram", Instagram],
  ["twitter", "X / Twitter", Twitter],
  ["linkedin", "LinkedIn", Linkedin],
];
const webLink = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

export default function ClientFooter({ home = false }) {
  const [settings, setSettings] = useState({});
  useEffect(() => {
    let active = true;
    const refresh = () =>
      getSiteSettings().then((value) => {
        if (active) setSettings(value);
      });
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("rently:settings-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("rently:settings-updated", refresh);
    };
  }, []);
  const company = settings.company_name?.trim() || "Rently";
  const address = [settings.address, settings.city, settings.country]
    .filter((part) => part?.trim())
    .join(", ");
  const phone = settings.phone?.replace(/[^\d+]/g, "");
  const whatsapp = settings.whatsapp?.replace(/\D/g, "");
  const socials = socialNetworks.filter(([key]) => webLink(settings[key]));
  const hasContact = address || phone || settings.email || whatsapp;

  return (
    <footer className={`client-footer${home ? " client-footer-home" : ""}`}>
      <div className="client-footer-grid">
        <div className="client-footer-company">
          <Link to="/" className="client-footer-brand">
            <span className="client-footer-logo">
              <img src={logo} alt="" />
            </span>
            {company}
          </Link>
          <p>
            {settings.about_en?.trim() ||
              "Location de voitures au Maroc. Découvrez le pays à votre rythme avec Rently."}
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <h2>Liens rapides</h2>
          <Link to="/">Accueil</Link>
          <Link to="/vehicles">Nos véhicules</Link>
          <Link to="/faqs">FAQs</Link>
        </nav>
        {hasContact && (
          <div className="client-footer-contact">
            <h2>Contact</h2>
            {address && (
              <p>
                <MapPin size={17} aria-hidden="true" />
                <span>{address}</span>
              </p>
            )}
            {phone && (
              <a href={`tel:${phone}`}>
                <Phone size={17} aria-hidden="true" />
                {settings.phone}
              </a>
            )}
            {settings.email?.trim() && (
              <a href={`mailto:${settings.email.trim()}`}>
                <Mail size={17} aria-hidden="true" />
                {settings.email}
              </a>
            )}
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp size={17} aria-hidden="true" />
                WhatsApp
              </a>
            )}
          </div>
        )}
        <div className="client-footer-bottom">
          <span>
            © {new Date().getFullYear()} {company} — Tous droits réservés
          </span>
          {socials.length > 0 && (
            <div className="client-footer-socials" aria-label="Social media">
              {socials.map(([key, label, Icon]) => (
                <a
                  key={key}
                  href={webLink(settings[key])}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
