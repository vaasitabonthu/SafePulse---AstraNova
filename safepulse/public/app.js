let map;
let userMarker;
let hospitalMarkers = [];

function initMap() {
  map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
}

function setStatus(message, isError = false) {
  const statusEl = document.getElementById('statusText');
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#fecaca' : '#9ca3af';
}

function clearHospitalMarkers() {
  hospitalMarkers.forEach((m) => map.removeLayer(m));
  hospitalMarkers = [];
}

function updateResultsList(hospitals, userLocation) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  if (!hospitals.length) {
    list.innerHTML =
      '<div class="empty-state">No hospitals found in this radius. Try increasing the distance.</div>';
    return;
  }

  hospitals.forEach((h) => {
    const card = document.createElement('div');
    card.className = 'hospital-card';

    // Distance calculation (approx Haversine, enough for UI)
    let distanceText = '';
    if (h.location && userLocation) {
      const d = computeDistanceKm(
        userLocation.lat,
        userLocation.lng,
        h.location.lat,
        h.location.lng,
      );
      distanceText = `${d.toFixed(1)} km`;
    }

    const badge =
      h.openNow === true
        ? '<span class="badge">Open now</span>'
        : h.openNow === false
        ? '<span class="badge badge-closed">Closed</span>'
        : '';

    const rating =
      h.rating != null
        ? `<div class="rating"><span class="rating-star">★</span><span>${h.rating.toFixed(
            1,
          )}</span>${h.totalRatings ? `<span>· ${h.totalRatings} reviews</span>` : ''}</div>`
        : '';

    card.innerHTML = `
      <div class="hospital-header">
        <div class="hospital-name">${h.name}</div>
        ${badge}
      </div>
      <div class="hospital-address">${h.address || 'Address not available'}</div>
      <div class="hospital-meta">
        ${rating}
        ${
          distanceText
            ? `<span class="distance-pill">
                ${distanceText}
              </span>`
            : ''
        }
      </div>
    `;

    card.addEventListener('click', () => {
      if (h.location) {
        map.setView([h.location.lat, h.location.lng], 16);
      }
    });

    list.appendChild(card);
  });
}

function computeDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchNearbyHospitals(lat, lng, radius) {
  setStatus('Searching for hospitals nearby...');

  clearHospitalMarkers();

  try {
    const res = await fetch(
      `/api/nearby-hospitals?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(
        lng,
      )}&radius=${encodeURIComponent(radius)}`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to load hospitals.');
    }
    const data = await res.json();
    const hospitals = data.results || [];

    const userLocation = { lat, lng };

    // Add markers to map
    hospitals.forEach((h) => {
      if (!h.location) return;
      const marker = L.marker([h.location.lat, h.location.lng]).addTo(map);
      marker.bindPopup(
        `<strong>${h.name}</strong><br>${h.address || ''}${
          h.rating ? `<br>★ ${h.rating.toFixed(1)}` : ''
        }`,
      );
      hospitalMarkers.push(marker);
    });

    if (hospitals.length) {
      const group = new L.featureGroup([...hospitalMarkers, userMarker].filter(Boolean));
      map.fitBounds(group.getBounds().pad(0.3));
      setStatus(`Found ${hospitals.length} hospitals in this area.`);
    } else {
      setStatus('No hospitals found in this area. Try increasing the search radius.');
    }

    updateResultsList(hospitals, userLocation);
  } catch (err) {
    console.error(err);
    setStatus('Unable to load nearby hospitals.', true);
    const list = document.getElementById('resultsList');
    list.innerHTML = `<div class="error-state">Error: ${err.message}</div>`;
  }
}

function handleUseLocation() {
  const btn = document.getElementById('locateBtn');
  const radiusSelect = document.getElementById('radiusSelect');

  if (!navigator.geolocation) {
    setStatus('Geolocation is not supported by this browser.', true);
    return;
  }

  btn.disabled = true;
  setStatus('Detecting your location...');

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      if (!userMarker) {
        userMarker = L.circleMarker([latitude, longitude], {
          radius: 8,
          fillColor: '#22c55e',
          color: '#22c55e',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.8,
        }).addTo(map);
      } else {
        userMarker.setLatLng([latitude, longitude]);
      }

      map.setView([latitude, longitude], 14);
      setStatus('Location detected. Loading nearby hospitals...');

      const radius = parseInt(radiusSelect.value, 10) || 5000;
      fetchNearbyHospitals(latitude, longitude, radius).finally(() => {
        btn.disabled = false;
      });
    },
    (err) => {
      console.error(err);
      btn.disabled = false;
      setStatus('Could not access your location. Please allow location permission.', true);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    },
  );
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();

  const btn = document.getElementById('locateBtn');
  btn.addEventListener('click', handleUseLocation);
});

