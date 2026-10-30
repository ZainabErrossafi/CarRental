import UserReservationsDialog from "../../components/admin/users/UserReservationsDialog.jsx";
import UserFormDialog from "../../components/admin/users/UserFormDialog.jsx";
import UsersTable from "../../components/admin/users/UsersTable.jsx";
import { useI18n } from "../../context/I18nContext";
import { useConfirm } from "../../context/Confirmcontext";

import usePagination from "../../hooks/usePagination.js";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  getUsers,
  getReservations,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/adminApi";

const EMPTY_USER = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
  role: "client",
  is_active: true,
};

const ROLE_TABS = ["All", "Client", "Admin"];

export default function AdminUsers() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_USER);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (user) => {
    if (deleting !== null) return;
    if (
      !(await confirm(
        t(
          'Delete user "{email}"? This cannot be undone. Reservation history will be kept.',
          { email: user.email },
        ),
        { danger: true, confirmLabel: "Delete" },
      ))
    )
      return;
    setDeleting(user.id);
    setDeleteError("");
    try {
      await deleteUser(user.id);
      setUsers((previous) => previous.filter((item) => item.id !== user.id));
    } catch (err) {
      setDeleteError(
        err.message || t("Could not delete user. Please try again."),
      );
    } finally {
      setDeleting(null);
    }
  };

  const closeCreate = () => {
    if (!saving) {
      setCreating(false);
      setEditing(null);
    }
  };

  const openEdit = (user) => {
    setForm(
      Object.fromEntries(
        Object.entries(EMPTY_USER).map(([key, value]) => [
          key,
          key === "password" ? "" : (user[key] ?? value),
        ]),
      ),
    );
    setError("");
    setEditing(user);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
      };
      if (editing) delete payload.password;
      const user = editing
        ? await updateUser(editing.id, payload)
        : await createUser(payload);
      setUsers((previous) =>
        editing
          ? previous.map((item) => (item.id === editing.id ? user : item))
          : [user, ...previous],
      );
      setTab("All");
      setQuery("");
      setCreating(false);
      setEditing(null);
      setForm(EMPTY_USER);
    } catch (err) {
      setError(
        err.message ||
          t(
            editing
              ? "Could not update user. Please try again."
              : "Could not create user. Please try again.",
          ),
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    getUsers().then(setUsers);
    getReservations().then(setReservations);
  }, []);

  const calculateReservationsByUser = () => {
    const map = new Map();
    users.forEach((user) => {
      const email = (user.email || "").trim().toLowerCase();
      map.set(
        user.id,
        reservations.filter((reservation) =>
          reservation.user != null
            ? String(reservation.user) === String(user.id)
            : email !== "" &&
              (reservation.email || "").trim().toLowerCase() === email,
        ),
      );
    });
    return map;
  };
  const reservationsByUser = calculateReservationsByUser();

  const filtered = users
    .filter((u) => tab === "All" || u.role === tab.toLowerCase())
    .filter((u) => u.email.toLowerCase().includes(query.toLowerCase()));

  const pagination = usePagination(filtered, JSON.stringify([tab, query]));

  const activeCount = users.filter((u) => u.is_active).length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const viewingReservations = viewing
    ? reservationsByUser.get(viewing.id) || []
    : [];

  const reservationPagination = usePagination(
    viewingReservations,
    viewing?.id ?? viewing?.email ?? "",
  );

  return (
    <div>
      <div className="page-header">
        <h1>{t("Users & Roles")}</h1>
        <div className="page-header-actions">
          <button
            className="btn-pill"
            onClick={() => {
              setForm(EMPTY_USER);
              setError("");
              setCreating(true);
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            {t("Create User")}
          </button>
        </div>
      </div>

      {deleteError && (
        <p role="alert" style={{ color: "var(--danger, #b42318)" }}>
          {deleteError}
        </p>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Total users")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{users.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Active")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{activeCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Admins")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{adminCount}</span>
          </div>
        </div>
      </div>

      <div className="pill-tabs">
        {ROLE_TABS.map((tabLabel) => (
          <button
            key={tabLabel}
            className={`pill-tab ${tab === tabLabel ? "active" : ""}`}
            onClick={() => setTab(tabLabel)}
          >
            {t(tabLabel)}
          </button>
        ))}
      </div>

      <UsersTable
        tab={tab}
        filtered={filtered}
        query={query}
        setQuery={setQuery}
        pagination={pagination}
        reservationsByUser={reservationsByUser}
        setViewing={setViewing}
        openEdit={openEdit}
        handleDelete={handleDelete}
        deleting={deleting}
      />

      {(creating || editing) && (
        <UserFormDialog
          closeCreate={closeCreate}
          handleSave={handleSave}
          editing={editing}
          saving={saving}
          error={error}
          form={form}
          setForm={setForm}
        />
      )}

      {viewing && (
        <UserReservationsDialog
          viewing={viewing}
          setViewing={setViewing}
          viewingReservations={viewingReservations}
          reservationPagination={reservationPagination}
        />
      )}
    </div>
  );
}
