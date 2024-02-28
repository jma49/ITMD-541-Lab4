function searchLocation() {
    const location = document.getElementById('locationInput').value;
    fetch(`https://geocode.maps.co/search?q=${location}`)
        .then(response => response.json())
        .then(data => {
            const coords = data[0];
            if (!coords) {
                showError('Location not found.');
                return;
            }
            Promise.all([
                fetchSunriseSunset(coords.lat, coords.lon, getTodayDate()),
                fetchSunriseSunset(coords.lat, coords.lon, getTomorrowDate())
            ]).then(([todayData, tomorrowData]) => {
                displayResults(todayData, tomorrowData, coords.display_name);
            });
        })
        .catch(error => showError('Error: ' + error));
}

function fetchSunriseSunset(lat, lon, date) {
    return fetch(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=${date}`)
        .then(response => response.json())
        .then(data => data.results);
        
}

function displayResults(todayData, tomorrowData, locationName) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h3>${locationName}</h3>
        <h4>Today's Sunrise and Sunset</h4>
        <p>Sunrise: ${todayData.sunrise}</p>
        <p>Sunset: ${todayData.sunset}</p>
        <p>Dawn: ${todayData.dawn}</p>
        <p>Dusk: ${todayData.dusk}</p>
        <p>Solar Noon: ${todayData.solar_noon}</p>
        <p>Day Length: ${todayData.day_length}</p>
        <p>Time Zone: ${todayData.timezone}</p>
        <br>
        <h4>Tomorrow's Sunrise and Sunset</h4>
        <p>Sunrise: ${tomorrowData.sunrise}</p>
        <p>Sunset: ${tomorrowData.sunset}</p>
        <p>Dawn: ${tomorrowData.dawn}</p>
        <p>Dusk: ${tomorrowData.dusk}</p>
        <p>Solar Noon: ${tomorrowData.solar_noon}</p>
        <p>Day Length: ${tomorrowData.day_length}</p>
        <p>Time Zone: ${tomorrowData.timezone}</p>
    `;
}

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    const geoLocationButton = document.getElementById('geolocation-button');

    searchButton.addEventListener('click', searchLocation);

    geoLocationButton.addEventListener('click', function() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const { latitude, longitude } = position.coords;
                Promise.all([
                    fetchSunriseSunset(latitude, longitude, getTodayDate()),
                    fetchSunriseSunset(latitude, longitude, getTomorrowDate())
                ]).then(([todayData, tomorrowData]) => {
                    displayResults(todayData, tomorrowData, 'Current Location');
                });
            }, function(error) {
                showError('Geolocation error: ' + error.message);
            });
        } else {
            showError('Geolocation is not supported by your browser.');
        }
    });
});

function useMyLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            Promise.all([
                fetchSunriseSunset(lat, lon, getTodayDate()),
                fetchSunriseSunset(lat, lon, getTomorrowDate())
            ]).then(([todayData, tomorrowData]) => {
                fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`)
                    .then(response => response.json())
                    .then(data => {
                        const locationName = data.display_name || 'Your Location';
                        displayResults(todayData, tomorrowData, locationName);
                    });
            });
        }, function(error) {
            showError('Unable to retrieve your location: ' + error.message);
        });
    } else {
        showError('Geolocation is not supported by your browser.');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('results');
    errorDiv.innerHTML = `<p class="error">${message}</p>`;
}

    document.getElementById('geolocation-button').addEventListener('click', useMyLocation);



