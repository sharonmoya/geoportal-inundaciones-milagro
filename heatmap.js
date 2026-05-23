import L from "leaflet";
import "leaflet/dist/leaflet.css";

const map = L.map("heatmap").setView([-2.134, -79.594], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const reportes = JSON.parse(localStorage.getItem("reportesInundacion")) || [];
const capaReportes = L.layerGroup().addTo(map);
const detalleReporte = document.getElementById("detalleReporte");

function colorPorNivel(nivel) {
  if (nivel === "Bajo") return "#ffe066";
  if (nivel === "Medio") return "#ff922b";
  if (nivel === "Alto") return "#f03e3e";
  if (nivel === "Crítico") return "#800000";
  return "#999999";
}

function radioPorNivel(nivel) {
  if (nivel === "Bajo") return 25;
  if (nivel === "Medio") return 45;
  if (nivel === "Alto") return 65;
  if (nivel === "Crítico") return 90;
  return 30;
}

function mostrarDetalle(reporte) {
  detalleReporte.innerHTML = `
    <strong>Sector:</strong> ${reporte.sector}<br>
    <strong>Dirección:</strong> ${reporte.direccion}<br>
    <strong>Fecha:</strong> ${reporte.fechaIncidente}<br>
    <strong>Nivel:</strong> ${reporte.nivel}<br>
    <strong>Descripción:</strong> ${reporte.descripcion}<br><br>
    ${
      reporte.fotoBase64
        ? `<img src="${reporte.fotoBase64}" alt="Foto del reporte" class="foto-preview">`
        : `<p><em>Este reporte no contiene fotografía.</em></p>`
    }
  `;
}

function dibujarMapa(lista) {
  capaReportes.clearLayers();

  lista.forEach((reporte) => {
    const circulo = L.circle([reporte.lat, reporte.lng], {
      radius: radioPorNivel(reporte.nivel),
      color: colorPorNivel(reporte.nivel),
      fillColor: colorPorNivel(reporte.nivel),
      fillOpacity: 0.45,
      weight: 2
    }).addTo(capaReportes);

    circulo.bindPopup(`
      <strong>Sector:</strong> ${reporte.sector}<br>
      <strong>Nivel:</strong> ${reporte.nivel}<br>
      <strong>Fecha:</strong> ${reporte.fechaIncidente}
    `);

    circulo.on("click", () => {
      mostrarDetalle(reporte);
    });
  });

  if (lista.length > 0) {
    const puntos = lista.map(r => [r.lat, r.lng]);
    map.fitBounds(puntos, { padding: [40, 40] });
  }
}

function generarGraficoHistorico() {
  const nivelesValor = {
    "Bajo": 1,
    "Medio": 2,
    "Alto": 3,
    "Crítico": 4
  };

  const nivelesTexto = {
    1: "Bajo",
    2: "Medio",
    3: "Alto",
    4: "Crítico"
  };

  const datosPorFecha = {};

  reportes.forEach((r) => {
    if (!datosPorFecha[r.fechaIncidente]) {
      datosPorFecha[r.fechaIncidente] = [];
    }

    datosPorFecha[r.fechaIncidente].push(nivelesValor[r.nivel]);
  });

  const fechas = Object.keys(datosPorFecha).sort();
  const contenedor = document.getElementById("graficoHistorico");

  if (fechas.length === 0) {
    contenedor.innerHTML = "<p>No existen reportes registrados.</p>";
    return;
  }

  const valores = fechas.map((fecha) => {
    const lista = datosPorFecha[fecha];
    const promedio = lista.reduce((a, b) => a + b, 0) / lista.length;
    return Math.round(promedio);
  });

  const ancho = 760;
  const alto = 320;
  const margenIzq = 80;
  const margenDer = 30;
  const margenSup = 50;
  const margenInf = 70;

  const xPos = (i) =>
    margenIzq + (i * (ancho - margenIzq - margenDer)) / Math.max(fechas.length - 1, 1);

  const yPos = (valor) =>
    alto - margenInf - ((valor - 1) * (alto - margenSup - margenInf)) / 3;

  const puntos = valores.map((valor, i) => `${xPos(i)},${yPos(valor)}`).join(" ");

  const etiquetasX = fechas.map((fecha, i) => `
    <text x="${xPos(i)}" y="${alto - 35}" text-anchor="middle" font-size="11">${fecha}</text>
  `).join("");

  const etiquetasY = [1, 2, 3, 4].map((v) => `
    <text x="${margenIzq - 12}" y="${yPos(v) + 4}" text-anchor="end" font-size="12">
      ${nivelesTexto[v]}
    </text>
    <line x1="${margenIzq}" y1="${yPos(v)}" x2="${ancho - margenDer}" y2="${yPos(v)}" stroke="#e9ecef"/>
  `).join("");

  contenedor.innerHTML = `
    <h3>Histórico del nivel predominante de inundación por fecha</h3>
    <p class="nota-grafico">
      El gráfico muestra el nivel promedio de afectación reportado por fecha.
    </p>

    <svg viewBox="0 0 ${ancho} ${alto}" class="grafico-lineal">
      ${etiquetasY}

      <line x1="${margenIzq}" y1="${margenSup}" x2="${margenIzq}" y2="${alto - margenInf}" stroke="#555"/>
      <line x1="${margenIzq}" y1="${alto - margenInf}" x2="${ancho - margenDer}" y2="${alto - margenInf}" stroke="#555"/>

      <polyline points="${puntos}" fill="none" stroke="#0b6fa4" stroke-width="3"/>

      ${valores.map((valor, i) => `
        <circle cx="${xPos(i)}" cy="${yPos(valor)}" r="6" fill="${colorPorNivel(nivelesTexto[valor])}">
          <title>${fechas[i]} - ${nivelesTexto[valor]}</title>
        </circle>
      `).join("")}

      ${etiquetasX}

      <text x="${ancho / 2}" y="${alto - 8}" text-anchor="middle" font-size="13" font-weight="700">
        Fecha del incidente
      </text>

      <text x="20" y="${alto / 2}" text-anchor="middle" font-size="13" font-weight="700"
        transform="rotate(-90 20 ${alto / 2})">
        Nivel de inundación
      </text>
    </svg>
  `;
}

document.getElementById("buscarFecha").addEventListener("click", () => {
  const fechaDesde = document.getElementById("fechaDesde").value;
  const fechaHasta = document.getElementById("fechaHasta").value;

  if (!fechaDesde || !fechaHasta) {
    alert("Seleccione la fecha desde y la fecha hasta antes de buscar.");
    return;
  }

  if (fechaDesde > fechaHasta) {
    alert("La fecha desde no puede ser mayor que la fecha hasta.");
    return;
  }

  const filtrados = reportes.filter(r => {
    return r.fechaIncidente >= fechaDesde && r.fechaIncidente <= fechaHasta;
  });

  capaReportes.clearLayers();

  detalleReporte.innerHTML = `
    <p>No se ha seleccionado ningún reporte.</p>
  `;

  dibujarMapa(filtrados);

  if (filtrados.length === 0) {
    alert("No existen reportes registrados para el rango de fechas seleccionado.");
  }
});

document.getElementById("limpiarFiltro").addEventListener("click", () => {
  document.getElementById("fechaDesde").value = "";
  document.getElementById("fechaHasta").value = "";
  capaReportes.clearLayers();

  detalleReporte.innerHTML = `
    <p>No se ha seleccionado ningún reporte.</p>
  `;

  map.setView([-2.134, -79.594], 13);
});

document.getElementById("descargarCSV").addEventListener("click", () => {
  if (reportes.length === 0) {
    alert("No existen reportes para descargar.");
    return;
  }

  const encabezado =
    "sector,direccion,fecha_incidente,nivel,descripcion,foto,latitud,longitud,fecha_registro\n";

  const filas = reportes.map(r =>
    `"${r.sector}","${r.direccion}","${r.fechaIncidente}","${r.nivel}","${r.descripcion}","${r.fotoNombre}",${r.lat},${r.lng},"${r.fechaRegistro}"`
  ).join("\n");

  const csv = encabezado + filas;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "reportes_inundacion_milagro.csv";
  link.click();
});

generarGraficoHistorico();

document.getElementById("graficoHistorico").insertAdjacentHTML(
  "afterend",
  `<p class="mensaje-filtro">Seleccione una fecha para visualizar los reportes en el mapa.</p>`
);