import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ref, push } from "firebase/database";
import { database } from "./firebase.js";

// Mapa base centrado en Milagro
const map = L.map("map", { zoomControl: true }).setView([-2.134, -79.594], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// Seleccionar ubicación haciendo clic en el mapa
let marcadorTemporal = null;

map.on("click", (e) => {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  document.getElementById("lat").value = lat.toFixed(6);
  document.getElementById("lng").value = lng.toFixed(6);

  if (marcadorTemporal) {
    map.removeLayer(marcadorTemporal);
  }

  marcadorTemporal = L.marker([lat, lng])
    .addTo(map)
    .bindPopup("Ubicación seleccionada para el reporte")
    .openPopup();
});

// Formulario
const form = document.getElementById("floodForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const fotoInput = document.getElementById("foto");
  const archivoFoto = fotoInput.files[0];

  const guardarReporte = async (fotoBase64 = "") => {
    const nuevoReporte = {
      sector: document.getElementById("sector").value,
      direccion: document.getElementById("direccion").value,
      fechaIncidente: document.getElementById("fechaIncidente").value,
      nivel: document.getElementById("nivel").value,
      descripcion: document.getElementById("descripcion").value,
      fotoNombre: archivoFoto ? archivoFoto.name : "Sin fotografía",
      fotoBase64: fotoBase64,
      lat: parseFloat(document.getElementById("lat").value),
      lng: parseFloat(document.getElementById("lng").value),
      fechaRegistro: new Date().toLocaleString()
    };

    if (Number.isNaN(nuevoReporte.lat) || Number.isNaN(nuevoReporte.lng)) {
      alert("Seleccione la ubicación del reporte haciendo clic sobre el mapa.");
      return;
    }

    await push(ref(database, "reportesInundacion"), nuevoReporte);

    form.reset();

    if (marcadorTemporal) {
      map.removeLayer(marcadorTemporal);
      marcadorTemporal = null;
    }

    alert("Reporte guardado correctamente en la base de datos.");
    window.location.href = "heatmap.html";
  };

  if (archivoFoto) {
    const reader = new FileReader();
    reader.onload = () => guardarReporte(reader.result);
    reader.readAsDataURL(archivoFoto);
  } else {
    guardarReporte();
  }
});