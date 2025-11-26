import React, { useRef, useState } from "react";
import IncidentsMap from "../components/IncidentsMap";
import IncidentsList from "../components/IncidentsList";
import AddIncident from "../components/AddIncident";

function HomePage({ user }) {
  const mapRef = useRef(null);
  const [pickMode, setPickMode] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt_desc");

  function handleRequestPickOnMap() {
    setPickedLocation(null);
    setPickMode(true);
  }
  function handleMapPicked(coords) {
    setPickedLocation(coords);
    setPickMode(false);
    if (mapRef.current?.setView) {
      try { mapRef.current.setView([coords.lat, coords.lng], 15); } catch {}
    }
  }
  function handleSelectIncident(incident) {
    if (!incident?.location) return;
    const { lat, lng } = incident.location;
    if (mapRef.current?.setView) {
      try { mapRef.current.setView([lat, lng], 16); } catch {}
    }
  }

return (
<div className="container-fluid">
  <div className="row g-0" style={{ height: "calc(100vh - 64px)" }}>

    <aside className="col-12 col-md-3 border-end p-2" style={{ overflow: "auto" }}>
      <h6 className="mb-2">الجدول</h6>
      <IncidentsList onSelectIncident={handleSelectIncident} />
    </aside>


    <div className="col-12 col-md-9 d-flex flex-column p-0">

      <div className="border-bottom p-2">
        <div className="row g-2 align-items-center">
  
        </div>
      </div>


      <div className="flex-fill position-relative" style={{ minHeight: 0 }}>
        <div className="position-absolute top-0 start-0 end-0 bottom-0">
          <IncidentsMap
            whenCreated={(map) => (mapRef.current = map)}
            pickMode={pickMode}
            onMapPicked={handleMapPicked}
            pickedLocation={pickedLocation}
            user={user}
          />
        </div>
      </div>
    </div>
  </div>
</div>

);


}

export default HomePage;
