let map = null;
let userMarker = null;
let allMarkers = [];
let emergencyPlaces = [];
let nearbyHospitals = [];
let nearbyPolice = [];
let selectedDistance = 3000;
let distanceCircle = null;
const BASE_TEXT = 'Serviços de Emergência';

let userLatLng = null;
let directionsService = null;
let directionsRenderer = null;

// ---------------------------------------------------------
// 1. CARREGAR DADOS JSON (Polícia, Bombeiros, etc.)
// ---------------------------------------------------------
async function loadEmergencyData() {
    try {
        // const response = await fetch('./localizacao.json');
        const response = await fetch('./../../db/db.json');
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        emergencyPlaces = await response.json();
        console.log(`Locais carregados: ${emergencyPlaces.length}`);
    } catch (e) {
        console.error("Erro carregando JSON", e);
        emergencyPlaces = [];
    }
}

// ---------------------------------------------------------
// 2. INICIAR MAPA
// ---------------------------------------------------------
async function init() {
    console.log("Inicializando...");
    await loadEmergencyData();

    await customElements.whenDefined('gmp-map');
    const gmpMapElement = document.getElementById('emergency-map');
    if (!gmpMapElement) return console.error("Mapa não encontrado");

    await new Promise(resolve => {
        const check = setInterval(() => {
            if (gmpMapElement.innerMap) {
                map = gmpMapElement.innerMap;
                clearInterval(check);
                resolve();
            }
        }, 100);
    });

    console.log("Mapa carregado");

    try {
        const mapsLibrary = await google.maps.importLibrary("maps");
        window.InfoWindow = mapsLibrary.InfoWindow;
    } catch (e) {
        console.error("Erro carregando InfoWindow", e);
    }

    // pegar localização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((pos) => {
            userLatLng = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };

            if (!userMarker) {
                // cria o marcador uma vez
                userMarker = new google.maps.Marker({
                    position: userLatLng,
                    map: map,
                    title: "Você está aqui",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#fff"
                    }
                });

                map.setCenter(userLatLng);
                updateDistanceCircle();
                adjustZoomByDistance(); 

                // já busca hospitais reais ao carregar
                // searchNearbyHospitals();

                // já busca todos os serviços ao carregar
                searchAllServices();

            } else {
                // depois só move o marcador
                userMarker.setPosition(userLatLng);
            }
        }, (err) => console.error(err));
    }

    initializeDropdownControl();
    initializeDistanceDropdown();
    filterMarkersByType('all');

    // botão ambulância
    document.getElementById("call-ambulance-btn").addEventListener("click", routeToHospital);
}

// ---------------------------------------------------------
// 3. DROPDOWN TIPO DE SERVIÇO
// ---------------------------------------------------------
function initializeDropdownControl() {
    const toggleButton = document.getElementById('dropdown-toggle');
    const distanceButton = document.getElementById('dropdown-toggle-distance');
    const dropdownMenu = document.getElementById('dropdown-menu');

    toggleButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
        toggleButton.classList.toggle('open');
        toggleButton.classList.add('active');
        distanceButton.classList.remove('active');
    });

    document.querySelectorAll('#dropdown-menu .dropdown-option').forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();
            dropdownMenu.classList.remove('show');
            toggleButton.classList.remove('open');

            document.querySelectorAll('#dropdown-menu .dropdown-option')
                .forEach(opt => opt.classList.remove('active'));

            this.classList.add('active');

            const selectedText = this.textContent.trim();
            const type = this.getAttribute('data-type');

            let newText = type === 'all'
                ? BASE_TEXT
                : `${BASE_TEXT}: ${selectedText}`;

            toggleButton.innerHTML = `${newText} <span class="tab-icon">▼</span>`;

            toggleButton.classList.add('active');
            distanceButton.classList.remove('active');

            filterMarkersByType(type);
        });
    });
}

// ---------------------------------------------------------
// 4. MARCADORES
// ---------------------------------------------------------
function clearMarkers() {
    allMarkers.forEach(m => m.setMap(null));
    allMarkers = [];
}

function filterMarkersByType(type) {
    clearMarkers();

    if (type === "all") {
        searchAllServices();
        return;
    }

    if (type === "hospital") {
        searchNearbyPlaces("hospital", "http://maps.google.com/mapfiles/ms/icons/red-dot.png");
        return;
    }

    if (type === "police") {
        searchNearbyPlaces("police", "http://maps.google.com/mapfiles/ms/icons/blue-dot.png");
        return;
    }

    if (type === "fire_station") {
        searchNearbyPlaces("fire_station", "http://maps.google.com/mapfiles/ms/icons/orange-dot.png");
        return;
    }
}


function addMarkersToMap(places) {
    if (!map || !userLatLng) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(userLatLng);

    places.forEach(place => {
        const pos = new google.maps.LatLng(place.lat, place.lng);
        const icon = getIconForType(place.type);

        const marker = new google.maps.Marker({
            position: pos,
            map,
            title: place.name,
            icon
        });

        allMarkers.push(marker);
        bounds.extend(pos);

        const info = new window.InfoWindow({
            content: `<b>${place.name}</b><br>${place.address}`
        });

        marker.addListener("click", () => info.open(map, marker));
    });

    places.length > 0
        ? map.fitBounds(bounds)
        : (map.setCenter(userLatLng), map.setZoom(13));
}

function getIconForType(type) {
    return {
        hospital: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        police: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        fire_station: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
    }[type] || null;
}

// ---------------------------------------------------------
// 5. DROPDOWN DISTÂNCIA
// ---------------------------------------------------------
function initializeDistanceDropdown() {
    const toggleButton = document.getElementById('dropdown-toggle-distance');
    const serviceButton = document.getElementById('dropdown-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu-distance');
    const options = dropdownMenu.querySelectorAll('.dropdown-option');

    toggleButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
        toggleButton.classList.toggle('open');
        toggleButton.classList.add('active');
        serviceButton.classList.remove('active');
    });

    options.forEach(option => {
        option.addEventListener('click', e => {
            e.preventDefault();

            options.forEach(o => o.classList.remove('active'));
            option.classList.add('active');

            selectedDistance = parseInt(option.dataset.distance);
            adjustZoomByDistance();


            toggleButton.innerHTML = `Distância: ${option.textContent.trim()} <span class="tab-icon">▼</span>`;

            dropdownMenu.classList.remove('show');
            toggleButton.classList.remove('open');

            const activeService = document.querySelector('#dropdown-menu .dropdown-option.active');
            const type = activeService ? activeService.dataset.type : 'all';

            filterMarkersByType(type);
            updateDistanceCircle();

        });
    });
}

function updateDistanceCircle() {
    if (!map || !userLatLng) return;

    // remove círculo antigo
    if (distanceCircle) {
        distanceCircle.setMap(null);
    }

    distanceCircle = new google.maps.Circle({
        strokeColor: "#4285F4",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#4285F4",
        fillOpacity: 0.1,
        map,
        center: userLatLng,
        radius: selectedDistance
    });

    // ajusta o mapa para caber o círculo
    map.fitBounds(distanceCircle.getBounds());
}


// ---------------------------------------------------------
// AJUSTAR ZOOM CONFORME DISTÂNCIA
// ---------------------------------------------------------
function adjustZoomByDistance() {
    if (!map || !userLatLng) return;

    let zoomLevel = 15; // padrão para 3 km

    if (selectedDistance === 3000) {
        zoomLevel = 15; // mais próximo
    } else if (selectedDistance === 5000) {
        zoomLevel = 13; // intermediário
    } else if (selectedDistance === 10000) {
        zoomLevel = 11; // mais afastado
    }

    map.setCenter(userLatLng);
    map.setZoom(zoomLevel);
}


// ---------------------------------------------------------
// 6. BUSCAR HOSPITAIS REAIS COM PLACES API
// ---------------------------------------------------------
function searchNearbyHospitals() {
    if (!userLatLng) return;

    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(
        {
            location: userLatLng,
            radius: selectedDistance,
            type: "hospital"
        },
        (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                clearMarkers();
                nearbyHospitals = results; // salva hospitais reais

                results.forEach(place => {
                    const marker = new google.maps.Marker({
                        map,
                        position: place.geometry.location,
                        title: place.name,
                        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    });

                    allMarkers.push(marker);

                    const info = new google.maps.InfoWindow({
                        content: `<b>${place.name}</b><br>${place.vicinity || ""}`
                    });

                    marker.addListener("click", () => info.open(map, marker));
                });

                const bounds = new google.maps.LatLngBounds();
                results.forEach(p => bounds.extend(p.geometry.location));
                map.fitBounds(bounds);
            } else {
                console.error("Erro na busca de hospitais:", status);
            }
        }
    );
}

function searchNearbyPlaces(type, iconUrl) {
    if (!userLatLng) return;

    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(
        {
            location: userLatLng,
            radius: selectedDistance,
            type: type
        },
        (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(place => {
                    const marker = new google.maps.Marker({
                        map,
                        position: place.geometry.location,
                        title: place.name,
                        icon: iconUrl
                    });

                    allMarkers.push(marker);

                    const info = new google.maps.InfoWindow({
                        content: `<b>${place.name}</b><br>${place.vicinity || ""}`
                    });

                    marker.addListener("click", () => info.open(map, marker));
                });
            }
        }
    );
}

function searchAllServices() {
    clearMarkers();
    searchNearbyPlaces("hospital", "http://maps.google.com/mapfiles/ms/icons/red-dot.png");
    searchNearbyPlaces("police", "http://maps.google.com/mapfiles/ms/icons/blue-dot.png");
    searchNearbyPlaces("fire_station", "http://maps.google.com/mapfiles/ms/icons/orange-dot.png");
}


// ---------------------------------------------------------
// 7. ACHAR HOSPITAL MAIS PRÓXIMO (Places API ou JSON)
// ---------------------------------------------------------
function findNearestHospital() {
    if (!userLatLng) return null;

    let nearest = null;
    let shortest = Infinity;

    // Primeiro tenta pelos hospitais reais da Places API
    if (nearbyHospitals.length > 0) {
        nearbyHospitals.forEach(place => {
            const dist = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(userLatLng.lat, userLatLng.lng),
                place.geometry.location
            );

            if (dist < shortest) {
                shortest = dist;
                nearest = {
                    name: place.name,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    address: place.vicinity || "Endereço não disponível"
                };
            }
        });
    } else {
        // fallback para JSON
        emergencyPlaces
            .filter(p => p.type === "hospital")
            .forEach(place => {
                const dist = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(userLatLng.lat, userLatLng.lng),
                    new google.maps.LatLng(place.lat, place.lng)
                );

                if (dist < shortest) {
                    shortest = dist;
                    nearest = place;
                }
            });
    }

    return nearest;
}

// ---------------------------------------------------------
// 8. ROTA ATÉ O HOSPITAL MAIS PRÓXIMO
// ---------------------------------------------------------
function routeToHospital() {
    const hospital = findNearestHospital();
    if (!hospital) {
        alert("Nenhum hospital encontrado!");
        return;
    }

    directionsService ||= new google.maps.DirectionsService();
    directionsRenderer ||= new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    directionsService.route(
        {
            origin: userLatLng,
            destination: { lat: hospital.lat, lng: hospital.lng },
            travelMode: google.maps.TravelMode.DRIVING,
        },
        (res, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(res);
                const box = document.getElementById("route-info");
                box.style.display = "block";
                box.innerHTML = `<b>Rota para:</b> ${hospital.name}<br>${hospital.address}`;
            } else {
                alert("Erro ao traçar rota");
            }
        }
    );
}

// ---------------------------------------------------------
// 9. INICIALIZAÇÃO
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', init);
