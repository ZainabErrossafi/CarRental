import { useI18n } from "../../../context/I18nContext";
import { Tag } from "lucide-react";
import { CATALOG_ICONS as ICONS } from "../../CatalogIcons.jsx";

export function IconBadge({ name }) {
  const Icon = ICONS[name] || Tag;
  return (
    <span className="icon-badge">
      <Icon size={16} />
    </span>
  );
}

export function ActiveToggle({ item, onToggle }) {
  const { t } = useI18n();
  return (
    <button
      className={`toggle ${item.active ? "on" : ""}`}
      onClick={() => onToggle(item)}
      title={item.active ? t("Click to deactivate") : t("Click to activate")}
    >
      <span className="toggle-knob" />
    </button>
  );
}
