import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { collection, onSnapshot, query as fbQuery } from "firebase/firestore";
import { db } from "../firebase";

const severityColor = (s) => {
  if (s >= 5) return "#7f0000";
  if (s >= 4) return "#ff3b30";
  if (s >= 3) return "#ff9500";
  if (s >= 2) return "#ffd60a";
  return "#34c759";
};


function MapClickHandler({ active, onPick }) {
  useMapEvents({
    click(e) {
      console.log("Map clicked; active =", active, "coords:", e.latlng);
      if (!active) return;
      const { lat, lng } = e.latlng;
      onPick?.({ lat, lng });
    },
  });
  return null;
}

export default function IncidentsMap({
  initialCenter = [24.7136, 46.6753],
  zoom = 7,
  whenCreated,
  pickMode = false,
  onMapPicked,
  pickedLocation,
}) {
  const [incidents, setIncidents] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    const q = fbQuery(collection(db, "incidents"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setIncidents(arr);
      },
      (err) => console.error("Map onSnapshot error:", err)
    );

    return () => unsub();
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
          whenCreated?.(mapInstance);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          active={pickMode}
          onPick={(coords) => {
            console.log("MapClickHandler onPick:", coords);
            onMapPicked?.(coords);
          }}
        />

        {pickedLocation && (
          <CircleMarker
            center={[pickedLocation.lat, pickedLocation.lng]}
            radius={10}
            pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.8 }}
          >
            <Popup>Picked location</Popup>
          </CircleMarker>
        )}

        {incidents.map((inc) => {
          let lat, lng;
          if (inc.location) {
            lat = inc.location.latitude ?? inc.location._lat;
            lng = inc.location.longitude ?? inc.location._long;
          } else if (inc.lat && inc.lng) {
            lat = inc.lat;
            lng = inc.lng;
          }
          if (lat == null || lng == null) return null;

          const color = severityColor(Number(inc.severity ?? 1));

          return (
            <CircleMarker
              key={inc.id}
              center={[lat, lng]}
              radius={8 + Number(inc.severity ?? 1) * 2}
              pathOptions={{ color: "#000", fillColor: color, fillOpacity: 0.9, weight: 1 }}
            >
              <Popup>
                <div>
                  <strong>{inc.title || "Untitled"}</strong>
                  <div style={{ fontSize: 12, color: "#555" }}>{inc.description}</div>
                  <div style={{ fontSize: 12 }}>Severity: {inc.severity ?? "-"}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
