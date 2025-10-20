let mapInstance = null;
let markers = [];
let emergencyData = [];
const center = { lat: -19.922835, lng: -43.992590 };
const BASE = 'Serviços de Emergência';

async function loadData() {
    try {
        const res = await fetch('./localizacao.json');
        emergencyData = res.ok ? await res.json() : [];
    } catch {
        emergencyData = [];
    }
}

async function startMap() {
    await loadData();
    await customElements.whenDefined('gmp-map');
    const mapEl = document.getElementById('map-element');
    if (!mapEl) return;
    await new Promise(resolve => {
        const check = setInterval(() => {
            if (mapEl.innerMap) {
                mapInstance = mapEl.innerMap;
                clearInterval(check);
                resolve();
            }
        }, 100);
    });
    try { const lib = await google.maps.importLibrary("maps"); window.InfoWindow = lib.InfoWindow; } catch {}
    setupDropdown();
    applyFilter('hospital');
}

function setupDropdown() {
    const toggle = document.getElementById('filter-toggle');
    const menu = document.getElementById('filter-menu');
    const firstText = document.querySelector('.option[data-type="hospital"]').textContent.trim();
    toggle.innerHTML = `${BASE}: ${firstText} <span>▼</span>`;
    toggle.addEventListener('click', () => { menu.classList.toggle('show'); toggle.classList.toggle('open'); });
    window.addEventListener('click', e => {
        if (!e.target.matches('#filter-toggle') && !e.target.closest('#filter-menu')) { menu.classList.remove('show'); toggle.classList.remove('open'); }
    });
    document.querySelectorAll('.option').forEach(opt => {
        opt.addEventListener('click', e => {
            e.preventDefault();
            menu.classList.remove('show'); toggle.classList.remove('open');
            document.querySelectorAll('.option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const type = opt.getAttribute('data-type');
            toggle.innerHTML = type === 'all' ? BASE : `${BASE}: ${opt.textContent.trim()} <span>▼</span>`;
            applyFilter(type);
        });
    });
}

function clearAllMarkers() { markers.forEach(m => m.setMap(null)); markers = []; }

function applyFilter(type) {
    if (!mapInstance) return;
    clearAllMarkers();
    const toShow = type === 'all' ? emergencyData : emergencyData.filter(p => p.type === type);
    renderMarkers(toShow);
}

function renderMarkers(locations) {
    if (!mapInstance) return;
    const bounds = new google.maps.LatLngBounds();
    locations.forEach(p => {
        const pos = new google.maps.LatLng(p.lat, p.lng);
        const icon = getIcon(p.type);
        const m = new google.maps.Marker({ position: pos, map: mapInstance, title: p.name, icon });
        markers.push(m);
        bounds.extend(pos);
        const info = new window.InfoWindow({ content: `<strong>${p.name}</strong><br>${p.address}` });
        m.addListener('click', () => info.open(mapInstance, m));
    });
    if (locations.length > 0) mapInstance.fitBounds(bounds);
    else { mapInstance.setCenter(center); mapInstance.setZoom(13); }
}

function getIcon(type) {
    return {
        hospital: { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' },
        police: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
        fire_station: { url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png' }
    }[type] || null;
}

document.addEventListener('DOMContentLoaded', startMap);
