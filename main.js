import L from "leaflet";
import "leaflet/dist/leaflet.css";
import scrollama from "scrollama";

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

// Datos guardados temporalmente en navegador
let reportes = JSON.parse(localStorage.getItem("reportesInundacion")) || [];

function colorPorNivel(nivel) {
  if (nivel === "Bajo") return "blue";
  if (nivel === "Medio") return "orange";
  if (nivel === "Alto") return "red";
  if (nivel === "Crítico") return "purple";
  return "gray";
}

// Formulario
const form = document.getElementById("floodForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const fotoInput = document.getElementById("foto");
  const archivoFoto = fotoInput.files[0];

  const guardarReporte = (fotoBase64 = "") => {
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

    reportes.push(nuevoReporte);
    localStorage.setItem("reportesInundacion", JSON.stringify(reportes));

    form.reset();

    alert("Reporte guardado correctamente.");
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

// Seleccionar ubicación haciendo clic en el mapa

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

// Descargar CSV
document.getElementById("descargarCSV").addEventListener("click", () => {
  if (reportes.length === 0) {
    alert("No existen reportes para descargar.");
    return;
  }

  const encabezado = "sector,direccion,fecha_incidente,nivel,descripcion,foto,latitud,longitud,fecha_registro\n";

 const filas = reportes.map(r =>
  `"${r.sector}","${r.direccion}","${r.fechaIncidente}","${r.nivel}","${r.descripcion}","${r.foto}",${r.lat},${r.lng},"${r.fechaRegistro}"`
).join("\n");

  const csv = encabezado + filas;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "reportes_inundacion_milagro.csv";
  link.click();
});

// Scrollama
const scroller = scrollama();
const steps = document.querySelectorAll(".step");

const scenes = [
  { view: { center: [-2.134, -79.594], zoom: 13 } },
  { view: { center: [-2.134, -79.594], zoom: 14 } },
  { view: { center: [-2.134, -79.594], zoom: 15 } },
  { view: { center: [-2.134, -79.594], zoom: 13 } },
  { view: { center: [-2.134, -79.594], zoom: 12 } },
];

function setScene(i) {
  const s = scenes[i] ?? scenes[0];
  map.flyTo(s.view.center, s.view.zoom, { duration: 1.0 });
}

scroller
  .setup({
    step: ".step",
    offset: 0.6
  })
  .onStepEnter((resp) => {
    steps.forEach((el) => el.classList.remove("is-active"));
    resp.element.classList.add("is-active");

    const i = Number(resp.element.dataset.step);
    setScene(i);
  });

window.addEventListener("resize", scroller.resize);
setScene(0);