import { useI18n } from "../../../context/I18nContext";
import { Search, Pencil, Trash2 } from "lucide-react";
import Pagination from "../../Pagination.jsx";
import { IconBadge, ActiveToggle } from "./CatalogItemControls.jsx";

export default function CatalogTable({
  tab,
  meta,
  filtered,
  query,
  setQuery,
  pagination,
  handleToggleActive,
  openEdit,
  handleDelete,
}) {
  const { t } = useI18n();
  const colCount = { brands: 3, categories: 4, features: 2, extras: 6 }[tab];
  return (
    <div className="table-card">
      <div className="table-card-header">
        {t(meta.label)}
        <span className="count-pill">{filtered.length}</span>

        <div className="search-box" style={{ marginInlineStart: "auto" }}>
          <Search size={14} />
          <input
            placeholder={t("Search {value0}", {
              value0: t(meta.label).toLowerCase(),
            })}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "none",
              width: "140px",
            }}
          />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            {tab === "brands" && (
              <>
                <th>{t("Name")}</th>
                <th>{t("Slug")}</th>
              </>
            )}
            {tab === "categories" && (
              <>
                <th style={{ width: "60px" }}>{t("Order")}</th>
                <th>{t("Name")}</th>
                <th>{t("Status")}</th>
              </>
            )}
            {tab === "features" && (
              <>
                <th>{t("Name")}</th>
              </>
            )}
            {tab === "extras" && (
              <>
                <th>{t("Name")}</th>
                <th>{t("Price / day")}</th>
                <th>{t("Flat price")}</th>
                <th>{t("Max qty")}</th>
                <th>{t("Status")}</th>
              </>
            )}
            <th>{t("Actions")}</th>
          </tr>
        </thead>

        <tbody>
          {pagination.pageItems.map((item) => (
            <tr key={item.id}>
              {tab === "brands" && (
                <>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>
                    <code className="slug">{item.slug}</code>
                  </td>
                </>
              )}

              {tab === "categories" && (
                <>
                  <td>{item.order}</td>
                  <td>
                    <div className="name-cell">
                      <IconBadge name={item.icon} />
                      <strong>{item.name}</strong>
                    </div>
                  </td>
                  <td>
                    <ActiveToggle item={item} onToggle={handleToggleActive} />
                  </td>
                </>
              )}

              {tab === "features" && (
                <>
                  <td>
                    <div className="name-cell">
                      <IconBadge name={item.icon} />
                      <strong>{item.name}</strong>
                    </div>
                  </td>
                </>
              )}

              {tab === "extras" && (
                <>
                  <td>
                    <div className="name-cell">
                      <IconBadge name={item.icon} />
                      <strong>{item.name}</strong>
                    </div>
                  </td>
                  <td>
                    {item.price_per_day
                      ? t("{value0} MAD", { value0: item.price_per_day })
                      : "—"}
                  </td>
                  <td>
                    {item.flat_price
                      ? t("{value0} MAD", { value0: item.flat_price })
                      : "—"}
                  </td>
                  <td>{item.max_qty}</td>
                  <td>
                    <ActiveToggle item={item} onToggle={handleToggleActive} />
                  </td>
                </>
              )}

              <td>
                <div className="row-actions">
                  <button
                    onClick={() => openEdit(item)}
                    title={t("Edit {value0}", {
                      value0: t(meta.singular).toLowerCase(),
                    })}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    title={t("Delete {value0}", {
                      value0: t(meta.singular).toLowerCase(),
                    })}
                    className="danger"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={colCount}
                style={{
                  textAlign: "center",
                  color: "var(--muted)",
                  padding: "2rem",
                }}
              >
                {query
                  ? t("No {value0} match your search.", {
                      value0: t(meta.label).toLowerCase(),
                    })
                  : t("No {value0} yet.", {
                      value0: t(meta.label).toLowerCase(),
                    })}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination {...pagination} />
    </div>
  );
}
