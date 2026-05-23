import{L as h}from"./leaflet-C0-P0NUz.js";const m=h.map("heatmap").setView([-2.134,-79.594],13);h.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(m);const u=JSON.parse(localStorage.getItem("reportesInundacion"))||[],p=h.layerGroup().addTo(m),b=document.getElementById("detalleReporte");function x(e){return e==="Bajo"?"#ffe066":e==="Medio"?"#ff922b":e==="Alto"?"#f03e3e":e==="Crítico"?"#800000":"#999999"}function H(e){return e==="Bajo"?25:e==="Medio"?45:e==="Alto"?65:e==="Crítico"?90:30}function k(e){b.innerHTML=`
    <strong>Sector:</strong> ${e.sector}<br>
    <strong>Dirección:</strong> ${e.direccion}<br>
    <strong>Fecha:</strong> ${e.fechaIncidente}<br>
    <strong>Nivel:</strong> ${e.nivel}<br>
    <strong>Descripción:</strong> ${e.descripcion}<br><br>
    ${e.fotoBase64?`<img src="${e.fotoBase64}" alt="Foto del reporte" class="foto-preview">`:"<p><em>Este reporte no contiene fotografía.</em></p>"}
  `}function N(e){if(p.clearLayers(),e.forEach(n=>{const o=h.circle([n.lat,n.lng],{radius:H(n.nivel),color:x(n.nivel),fillColor:x(n.nivel),fillOpacity:.45,weight:2}).addTo(p);o.bindPopup(`
      <strong>Sector:</strong> ${n.sector}<br>
      <strong>Nivel:</strong> ${n.nivel}<br>
      <strong>Fecha:</strong> ${n.fechaIncidente}
    `),o.on("click",()=>{k(n)})}),e.length>0){const n=e.map(o=>[o.lat,o.lng]);m.fitBounds(n,{padding:[40,40]})}}function w(){const e={Bajo:1,Medio:2,Alto:3,Crítico:4},n={1:"Bajo",2:"Medio",3:"Alto",4:"Crítico"},o={};u.forEach(t=>{o[t.fechaIncidente]||(o[t.fechaIncidente]=[]),o[t.fechaIncidente].push(e[t.nivel])});const a=Object.keys(o).sort(),l=document.getElementById("graficoHistorico");if(a.length===0){l.innerHTML="<p>No existen reportes registrados.</p>";return}const c=a.map(t=>{const r=o[t],L=r.reduce((j,M)=>j+M,0)/r.length;return Math.round(L)}),d=760,i=320,s=80,$=30,v=50,f=70,y=t=>s+t*(d-s-$)/Math.max(a.length-1,1),g=t=>i-f-(t-1)*(i-v-f)/3,I=c.map((t,r)=>`${y(r)},${g(t)}`).join(" "),B=a.map((t,r)=>`
    <text x="${y(r)}" y="${i-35}" text-anchor="middle" font-size="11">${t}</text>
  `).join(""),E=[1,2,3,4].map(t=>`
    <text x="${s-12}" y="${g(t)+4}" text-anchor="end" font-size="12">
      ${n[t]}
    </text>
    <line x1="${s}" y1="${g(t)}" x2="${d-$}" y2="${g(t)}" stroke="#e9ecef"/>
  `).join("");l.innerHTML=`
    <h3>Histórico del nivel predominante de inundación por fecha</h3>
    <p class="nota-grafico">
      El gráfico muestra el nivel promedio de afectación reportado por fecha.
    </p>

    <svg viewBox="0 0 ${d} ${i}" class="grafico-lineal">
      ${E}

      <line x1="${s}" y1="${v}" x2="${s}" y2="${i-f}" stroke="#555"/>
      <line x1="${s}" y1="${i-f}" x2="${d-$}" y2="${i-f}" stroke="#555"/>

      <polyline points="${I}" fill="none" stroke="#0b6fa4" stroke-width="3"/>

      ${c.map((t,r)=>`
        <circle cx="${y(r)}" cy="${g(t)}" r="6" fill="${x(n[t])}">
          <title>${a[r]} - ${n[t]}</title>
        </circle>
      `).join("")}

      ${B}

      <text x="${d/2}" y="${i-8}" text-anchor="middle" font-size="13" font-weight="700">
        Fecha del incidente
      </text>

      <text x="20" y="${i/2}" text-anchor="middle" font-size="13" font-weight="700"
        transform="rotate(-90 20 ${i/2})">
        Nivel de inundación
      </text>
    </svg>
  `}document.getElementById("buscarFecha").addEventListener("click",()=>{const e=document.getElementById("fechaDesde").value,n=document.getElementById("fechaHasta").value;if(!e||!n){alert("Seleccione la fecha desde y la fecha hasta antes de buscar.");return}if(e>n){alert("La fecha desde no puede ser mayor que la fecha hasta.");return}const o=u.filter(a=>a.fechaIncidente>=e&&a.fechaIncidente<=n);p.clearLayers(),b.innerHTML=`
    <p>No se ha seleccionado ningún reporte.</p>
  `,N(o),o.length===0&&alert("No existen reportes registrados para el rango de fechas seleccionado.")});document.getElementById("limpiarFiltro").addEventListener("click",()=>{document.getElementById("fechaDesde").value="",document.getElementById("fechaHasta").value="",p.clearLayers(),b.innerHTML=`
    <p>No se ha seleccionado ningún reporte.</p>
  `,m.setView([-2.134,-79.594],13)});document.getElementById("descargarCSV").addEventListener("click",()=>{if(u.length===0){alert("No existen reportes para descargar.");return}const e=`sector,direccion,fecha_incidente,nivel,descripcion,foto,latitud,longitud,fecha_registro
`,n=u.map(c=>`"${c.sector}","${c.direccion}","${c.fechaIncidente}","${c.nivel}","${c.descripcion}","${c.fotoNombre}",${c.lat},${c.lng},"${c.fechaRegistro}"`).join(`
`),o=e+n,a=new Blob([o],{type:"text/csv;charset=utf-8;"}),l=document.createElement("a");l.href=URL.createObjectURL(a),l.download="reportes_inundacion_milagro.csv",l.click()});w();document.getElementById("graficoHistorico").insertAdjacentHTML("afterend",'<p class="mensaje-filtro">Seleccione una fecha para visualizar los reportes en el mapa.</p>');
