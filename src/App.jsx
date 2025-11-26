import React, { useEffect, useRef, useState } from "react";
import IncidentsMap from "./components/IncidentsMap";
import IncidentsList from "./components/IncidentsList";
import AddIncident from "./components/AddIncident";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import logo from "./assets/logo.png";
import Navbar from "./components/Navbar";

import AvatarInitials from "./components/AvatarInitials";
import Footer from "./components/Footer";
import {
  auth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  googleProvider,
  githubProvider,
} from "./firebase";
import "./App.css";

export default function App() {

const [theme, setTheme] = useState("light");

useEffect(() => {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") setTheme(saved);
}, []);

useEffect(() => {
  document.documentElement.setAttribute("data-bs-theme", theme);
  localStorage.setItem("theme", theme);
}, [theme]);

const toggleTheme = () => {
  setTheme((t) => (t === "light" ? "dark" : "light"));
};
  const mapRef = useRef(null);
  const [severityFilter, setSeverityFilter] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [pickMode, setPickMode] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);
  const loginWithGoogle = async () => {
    try { await signInWithPopup(auth, googleProvider); }
    catch (e) { console.error(e); alert("Google login failed"); }
  };
  const loginWithGitHub = async () => {
    try { await signInWithPopup(auth, githubProvider); }
    catch (e) { console.error(e); alert("GitHub login failed"); }
  };
  const logout = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  function handleRequestPickOnMap() {
    setPickedLocation(null);
    setPickMode(true);
  }

  function handleMapPicked(coords) {
    setPickedLocation(coords);
    setPickMode(false);
    if (mapRef.current && typeof mapRef.current.setView === "function") {
      try { mapRef.current.setView([coords.lat, coords.lng], 15); } catch {}
    }
  }

  function handleSelectIncident(incident) {
    if (!incident?.location) return;
    const { lat, lng } = incident.location;
    if (mapRef.current && typeof mapRef.current.setView === "function") {
      try { mapRef.current.setView([lat, lng], 16); } catch {}
    }
  }

  const RequireAuth = ({ children }) => {
    if (authLoading) return <div className="p-3 small text-muted">...</div>;
    if (!user) return <Navigate to="/register" replace />;
    return children;
  };
  const RedirectIfAuthed = ({ children }) => {
    if (authLoading) return <div className="p-3 small text-muted">...</div>;
    if (user) return <Navigate to="/" replace />;
    return children;
  };

const HomeShell = () => (
  <div
    className="container-fluid h-100 d-flex flex-column flex-grow-1"   
    style={{ minHeight: 0 }}                                         
  >
    <div
      className="row g-0 h-100 flex-grow-1"                           
      style={{ minHeight: 0 }}                                     
    >

     <aside className="col-12 col-md-3 border-end p-2 d-flex flex-column" style={{ minHeight: 0 }}>
       <div className="flex-fill flex-grow-1 overflow-auto">          
        <IncidentsList
          onSelectIncident={handleSelectIncident}
          severityFilter={severityFilter}
          sortBy={sortBy}
        /></div>
      </aside>

  <div className="col-12 col-md-9 d-flex flex-column p-0 flex-grow-1" style={{ minHeight: 0 }}>
      <div className="bg-body-tertiary border-bottom p-2">
          <AddIncident
            variant="toolbar"         
            user={user}
            disabled={!user}
            onRequestPickOnMap={handleRequestPickOnMap}
            pickedLocation={pickedLocation}
          />
        </div>

       <div className="flex-fill flex-grow-1 position-relative" style={{ minHeight: 0 }}>
        <div className="position-absolute top-0 start-0 end-0 bottom-0" style={{ height: "100%" }}>
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
 return (
<div className="bg-body d-flex flex-column min-vh-100">
  <Navbar
    user={user}
    authLoading={authLoading}
    onLogout={logout}
    theme={theme}
    onToggleTheme={toggleTheme}
  />


<main className="flex-fill d-flex flex-column" style={{ minHeight: 0 }}>

  <Routes>
    <Route
      path="/"
      element={
        <RequireAuth>
          <HomeShell />
        </RequireAuth>
      }
    />
    <Route
      path="/register"
      element={
        <RedirectIfAuthed>
          <Register />
        </RedirectIfAuthed>
      }
    />
    <Route
      path="/login"
      element={
        <RedirectIfAuthed>
          <Login />
        </RedirectIfAuthed>
      }
    />
    <Route path="*" element={<Navigate to={user ? "/" : "/register"} replace />} />
  </Routes>
</main>


<div className="mt-auto">                     
  <Footer />
</div>
</div>

  );
}
