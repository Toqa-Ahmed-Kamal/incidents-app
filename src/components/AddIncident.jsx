import React, { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, GeoPoint } from "../firebase";

export default function AddIncident({ onAdded, onRequestPickOnMap, pickedLocation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(2);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pickedLocation) {
      console.log("AddIncident got pickedLocation:", pickedLocation);
      setLat(String(pickedLocation.lat));
      setLng(String(pickedLocation.lng));
    }
  }, [pickedLocation]);

  async function handleSubmit(e) {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!title.trim()) return alert("Title required");
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return alert("Valid lat/lng required");

    setLoading(true);
    try {
      await addDoc(collection(db, "incidents"), {
        title: title.trim(),
        description: description.trim(),
        severity: Number(severity),
        location: new GeoPoint(latNum, lngNum),
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setSeverity(2);
      setLat("");
      setLng("");
      onAdded?.();
    } catch (err) {
      console.error(err);
      alert("Failed to add incident");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Add Incident</h5>

        <div className="mb-2">
          <input
            className="form-control"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <textarea
            className="form-control"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="row g-2 mb-2">
          <div className="col-3">
            <input
              type="number"
              min="1"
              max="5"
              className="form-control"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            />
          </div>
          <div className="col-4">
            <input
              className="form-control"
              placeholder="Lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </div>
          <div className="col-5">
            <input
              className="form-control"
              placeholder="Lng"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </div>
        </div>

<div className="d-flex flex-wrap justify-content-between align-items-center w-100">
  <button className="btn btn-primary" disabled={loading}>
    {loading ? "Adding..." : "Add Incident"}
  </button>

  <button
    type="button"
    className="btn btn-outline-secondary"
    onClick={() => onRequestPickOnMap?.()}
  >
    Pick on map
  </button>

  <button
    type="button"
    className="btn btn-link"
    onClick={() => {
      setLat("24.7136");
      setLng("46.6753");
    }}
  >
    Sample coords
  </button>
</div>
    
      </div>
    </form>
  );
}
