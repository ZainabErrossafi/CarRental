import ReservationsTable from "../../components/admin/reservations/ReservationsTable.jsx";
import ReservationDetailsDialog from "../../components/admin/reservations/ReservationDetailsDialog.jsx";
import { useI18n } from "../../context/I18nContext";
import { useConfirm } from "../../context/Confirmcontext";
import { printReservationInvoice } from "../../services/reservationInvoice";

import usePagination from "../../hooks/usePagination.js";
import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getReservations,
  confirmReservation,
  cancelReservation,
  completeReservation,
} from "../../services/adminApi";

const STATUS_TABS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

export default function AdminReservations() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState("All");
  const [viewing, setViewing] = useState(null);
  const [printError, setPrintError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const actionInProgress = useRef(false);
  const handlePrint = () => {
    setPrintError(null);
    try {
      printReservationInvoice(viewing, t);
    } catch (error) {
      setPrintError(error.message);
    }
  };

  useEffect(() => {
    getReservations()
      .then(setReservations)
      .catch((error) => setActionError(error.message));
  }, []);

  const calculateFiltered = () => {
    if (tab === "All") return reservations;
    return reservations.filter((r) => r.status === tab.toLowerCase());
  };
  const filtered = calculateFiltered();

  const pagination = usePagination(filtered, tab);

  const applyUpdate = (updated) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r)),
    );
  };

  const runReservationAction = async (id, action, message, options) => {
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    setActionError(null);
    try {
      if (!(await confirm(message, options))) return;
      setPendingId(id);
      applyUpdate(await action(id));
    } catch (error) {
      setActionError(
        error.message || "Could not update the reservation. Please try again.",
      );
    } finally {
      setPendingId(null);
      actionInProgress.current = false;
    }
  };

  const handleConfirm = (id) =>
    runReservationAction(
      id,
      confirmReservation,
      "Are you sure you want to confirm this reservation?",
      { confirmLabel: "Confirm" },
    );

  const handleCancel = (id) =>
    runReservationAction(
      id,
      cancelReservation,
      "Are you sure you want to cancel this reservation?",
      { danger: true, confirmLabel: "Cancel Reservation", cancelLabel: "Back" },
    );

  const handleComplete = (id) =>
    runReservationAction(
      id,
      completeReservation,
      "Are you sure you want to mark this reservation as completed?",
      { confirmLabel: "Mark Completed" },
    );

  const durationDays = (r) => {
    const start = new Date(r.pickup_date);
    const end = new Date(r.return_date);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  return (
    <div>
      <div className="page-header">
        <h1>{t("Reservations")}</h1>
        <div className="page-header-actions">
          <button
            className="btn-pill"
            onClick={() => navigate("/admin/reservations/new")}
          >
            <Plus size={16} strokeWidth={2.5} />
            {t("New Reservation")}
          </button>
        </div>
      </div>

      <div className="pill-tabs">
        {STATUS_TABS.map((tabLabel) => (
          <button
            key={tabLabel}
            className={`pill-tab ${tab === tabLabel ? "active" : ""}`}
            onClick={() => setTab(tabLabel)}
          >
            {t(tabLabel)}
          </button>
        ))}
      </div>

      {actionError && (
        <div role="alert" className="alert alert-error">
          {t(actionError)}
        </div>
      )}

      <ReservationsTable
        pendingId={pendingId}
        tab={tab}
        filtered={filtered}
        pagination={pagination}
        durationDays={durationDays}
        setViewing={setViewing}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
        handleComplete={handleComplete}
      />

      {viewing && (
        <ReservationDetailsDialog
          viewing={viewing}
          setViewing={setViewing}
          durationDays={durationDays}
          printError={printError}
          handlePrint={handlePrint}
        />
      )}
    </div>
  );
}
