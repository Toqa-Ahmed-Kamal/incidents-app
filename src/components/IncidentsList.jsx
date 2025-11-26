import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  query as fbQuery,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function IncidentsList({
  onSelectIncident,
  severityFilter = 0,
  sortBy = "createdAt_desc",
}) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingServerQuery, setUsingServerQuery] = useState(true);
  const [lastError, setLastError] = useState(null);


  const [uiSeverity, setUiSeverity] = useState(severityFilter);
  const [uiSortBy, setUiSortBy] = useState(sortBy);
  const effSeverity = uiSeverity; 
  const effSortBy = uiSortBy;
const [confirmOpen, setConfirmOpen] = useState(false);
const [toDelete, setToDelete] = useState(null);

  const buildQuery = useCallback(
    ({ severityFilter, sortBy }) => {
      const baseRef = collection(db, "incidents");
      if (severityFilter > 0 && sortBy === "severity_and_newest") {
        return fbQuery(
          baseRef,
          where("severity", ">=", severityFilter),
          orderBy("severity", "asc"),
          orderBy("createdAt", "desc")
        );
      }

      if (severityFilter > 0 && (sortBy === "createdAt_desc" || sortBy === "createdAt_asc")) {
        return fbQuery(
          baseRef,
          where("severity", ">=", severityFilter),
          orderBy("createdAt", sortBy.endsWith("_asc") ? "asc" : "desc")
        );
      }

      if (severityFilter > 0 && (sortBy === "severity_desc" || sortBy === "severity_asc")) {
        return fbQuery(
          baseRef,
          where("severity", ">=", severityFilter),
          orderBy("severity", sortBy.endsWith("_asc") ? "asc" : "desc")
        );
      }

      if (sortBy === "createdAt_desc") return fbQuery(baseRef, orderBy("createdAt", "desc"));
      if (sortBy === "createdAt_asc") return fbQuery(baseRef, orderBy("createdAt", "asc"));
      if (sortBy === "severity_desc") return fbQuery(baseRef, orderBy("severity", "desc"));
      if (sortBy === "severity_asc") return fbQuery(baseRef, orderBy("severity", "asc"));

      return fbQuery(baseRef);
    },
    []
  );

  const applyClientFilterSort = useCallback((arr, sevFilter, sortKey) => {
    let list = arr.slice();

    if (sevFilter > 0) {
      list = list.filter((i) => Number(i.severity ?? 0) >= sevFilter);
    }

    const getCreatedTs = (item) => {
      const v = item.createdAt;
      if (!v) return 0;
      if (typeof v.toDate === "function") return v.toDate().getTime();
      if (v instanceof Date) return v.getTime();
      const t = Date.parse(String(v));
      return Number.isNaN(t) ? 0 : t;
    };

    const cmp = (a, b) => {
      if (sortKey === "severity_and_newest") {
        const sa = Number(a.severity ?? 0);
        const sb = Number(b.severity ?? 0);
        if (sa !== sb) return sb - sa;
        const ta = getCreatedTs(a);
        const tb = getCreatedTs(b);
        return tb - ta; 
      }

      if (sortKey.startsWith("createdAt")) {
        const ta = getCreatedTs(a);
        const tb = getCreatedTs(b);
        return sortKey.endsWith("_asc") ? ta - tb : tb - ta;
      }

      if (sortKey.startsWith("severity")) {
        const sa = Number(a.severity ?? 0);
        const sb = Number(b.severity ?? 0);
        return sortKey.endsWith("_asc") ? sa - sb : sb - sa;
      }

      return 0;
    };

    list.sort(cmp);
    return list;
  }, []);

  useEffect(() => {
    let unsub = null;
    let canceled = false;
    setLoading(true);
    setLastError(null);
    let q;
    try {

      q = buildQuery({ severityFilter: effSeverity, sortBy: effSortBy });
    } catch (err) {
      console.error("buildQuery error:", err);
      setLastError(err);
      (async () => {
        try {
          const colRef = collection(db, "incidents");
          const snap = await getDocs(colRef);
          const arr = [];
          snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
          if (!canceled) {
            const processed = applyClientFilterSort(arr, effSeverity, effSortBy);
            setIncidents(processed);
            setUsingServerQuery(false);
          }
        } catch (e) {
          console.error("fallback load error:", e);
          setIncidents([]);
        } finally {
          if (!canceled) setLoading(false);
        }
      })();
      return () => {
        canceled = true;
      };
    }
    try {
      unsub = onSnapshot(
        q,
        (snap) => {
          const arr = [];
          snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
          if (!canceled) {
            setIncidents(arr);
            setUsingServerQuery(true);
            setLoading(false);
          }
        },
        (err) => {
          console.error("onSnapshot error:", err);
          setLastError(err);
          (async () => {
            try {
              const colRef = collection(db, "incidents");
              const snap = await getDocs(colRef);
              const arr = [];
              snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
              if (!canceled) {
                const processed = applyClientFilterSort(arr, effSeverity, effSortBy);
                setIncidents(processed);
                setUsingServerQuery(false);
              }
            } catch (e2) {
              console.error("fallback after error failed:", e2);
              if (!canceled) setIncidents([]);
            } finally {
              if (!canceled) setLoading(false);
            }
          })();
        }
      );
    } catch (err) {
      console.error("subscribe error:", err);
      setLastError(err);
      (async () => {
        try {
          const colRef = collection(db, "incidents");
          const snap = await getDocs(colRef);
          const arr = [];
          snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
          if (!canceled) {
            const processed = applyClientFilterSort(arr, effSeverity, effSortBy);
            setIncidents(processed);
            setUsingServerQuery(false);
          }
        } catch (e) {
          console.error("fallback getDocs error:", e);
          if (!canceled) setIncidents([]);
        } finally {
          if (!canceled) setLoading(false);
        }
      })();
    }

    return () => {
      canceled = true;
      if (typeof unsub === "function") unsub();
    };

  }, [effSeverity, effSortBy, buildQuery, applyClientFilterSort]);

  async function handleDelete(id) {
    if (!confirm("Delete this incident?")) return;
    try {
      await deleteDoc(doc(db, "incidents", id));
    } catch (err) {
      console.error("delete error:", err);
      alert("Failed to delete");
    }
  }
function openDelete(e, inc) {
  e.stopPropagation();
  setToDelete(inc);
  setConfirmOpen(true);
}

function closeDelete() {
  setConfirmOpen(false);
  setToDelete(null);
}

async function confirmDelete() {
  if (!toDelete) return;
  try {
    await deleteDoc(doc(db, "incidents", toDelete.id));
  } catch (err) {
    console.error("delete error:", err);
    alert("Failed to delete");
  } finally {
    closeDelete();
  }
}

  return (
    <div>
   
   
      <div className="card mb-2">
        <div className="card-body py-2">
          <label className="form-label small mb-1">Severity</label>
          <select
            className="form-select form-select-sm mb-2"
            value={uiSeverity}
            onChange={(e) => setUiSeverity(Number(e.target.value))}
          >
            <option value={0}>All</option>
            <option value={1}>≥ 1</option>
            <option value={2}>≥ 2</option>
            <option value={3}>≥ 3</option>
            <option value={4}>≥ 4</option>
            <option value={5}>= 5</option>
          </select>

          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${effSortBy === "createdAt_desc" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setUiSortBy("createdAt_desc")}
            >
              Newest
            </button>
            <button
              className={`btn btn-sm ${effSortBy === "createdAt_asc" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setUiSortBy("createdAt_asc")}
            >
              Oldest
            </button>
            <button
              className={`btn btn-sm ${effSortBy === "severity_desc" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setUiSortBy("severity_desc")}
            >
              Severity ↓
            </button>
            <button
              className={`btn btn-sm ${effSortBy === "severity_asc" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setUiSortBy("severity_asc")}
            >
              Severity ↑
            </button>
            <button
              className={`btn btn-sm ${effSortBy === "severity_and_newest" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setUiSortBy("severity_and_newest")}
            >
              Severity ↓ + Newest
            </button>
          </div>
        </div>
      </div>
<ul className="list-group mb-2">

  <li className="list-group-item d-flex justify-content-between align-items-center py-2 px-3 bg-body-tertiary">

    <span className="fs-4 fw-semibold mb-0">Incidents</span>


    <span
      className="badge bg-secondary rounded-1 px-2 py-1 inc-list-count"
      style={{ minWidth: 36, textAlign: "center" }}
    >
      {loading ? "—" : incidents.length}
    </span>
  </li>

  {loading ? (
    <li className="list-group-item small text-muted">Loading incidents...</li>
  ) : incidents.length === 0 ? (
    <li className="list-group-item small text-muted">No incidents yet.</li>
  ) : (
    incidents.map((inc) => (
      <li
        key={inc.id}
        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-3"
        onClick={() => onSelectIncident?.(inc)}
      >
        <div className="flex-grow-1 me-2">
          <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: "100%" }}>
            <strong className="text-truncate">{inc.title}</strong>
            {inc.description && (
              <span
                className="text-muted small text-truncate"
                title={inc.description}
                style={{ maxWidth: 380 }}
              >
                • {inc.description}
              </span>
            )}
          </div>
          <div className="small text-muted">
            {inc.createdAt && typeof inc.createdAt.toDate === "function"
              ? new Date(inc.createdAt.toDate()).toLocaleString()
              : inc.createdAt
              ? String(inc.createdAt)
              : ""}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">

          <span className="badge bg-danger">{inc.severity ?? 0}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={(e) => { e.stopPropagation(); openDelete(e, inc); }}
            title="Delete"
          >
            Delete
          </button>
        </div>
      </li>
    ))
  )}
</ul>


      {!usingServerQuery && (
        <div className="mt-2 small text-warning">
          Note: server-side ordering/filtering not applied; results processed client-side.
          {lastError && (
            <div className="small text-muted mt-1">
              {String(lastError.message || lastError).slice(0, 200)}
            </div>
          )}
        </div>
      )}
      {confirmOpen && (
  <>    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.15)" }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">Delete incident</h6>
            <button type="button" className="btn-close" aria-label="Close" onClick={closeDelete}></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">
              Are you sure you want to delete
              {toDelete?.title ? <> <strong>“{toDelete.title}”</strong> </> : " this incident"}
              ?
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={closeDelete}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>


    <div className="modal-backdrop fade show"></div>
  </>
)}

    </div>
    
  );
}
