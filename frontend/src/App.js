import React from "react";
import "./styles.css";
import MapViewNuevo from "./MapViewNuevo";

function App() {
  return (
    <div className="App">
      <h1>🚌 Rutas Reales - Universidad de los Llanos</h1>
      <p>Sistema de transporte estudiantil con 11 rutas que siguen las calles reales de Villavicencio</p>
      <MapViewNuevo />
    </div>
  );
}

export default App;
