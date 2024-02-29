function searchLocation() {
    showLoadingAnimation(); 
    const location = document.getElementById('locationInput').value;
    fetch(`https://geocode.maps.co/search?q=${location}&api_key=65dfc7241a2e0327872325ano74c68e`)
        .then(response =>  response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error('Location not found');
            }
            const coords = data[0];
            const locationName = coords.display_name; 
            return Promise.all([
                fetchSunriseSunset(coords.lat, coords.lon, getTodayDate()),
                fetchSunriseSunset(coords.lat, coords.lon, getTomorrowDate())
            ]).then(([todayData, tomorrowData]) => {
                displayResults(todayData, tomorrowData, locationName);
            });
        })
        .catch(error => {
            showError(error.message);
        })
        .finally(() => {
            hideLoadingAnimation();
        });
}

function useMyLocation() {
    console.log('useMyLocation function triggered');
    showLoadingAnimation(); 
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const { latitude, longitude } = position.coords; 
            Promise.all([
                fetchSunriseSunset(latitude, longitude, getTodayDate()),
                fetchSunriseSunset(latitude, longitude, getTomorrowDate())
            ])
            .then(([todayData, tomorrowData]) => {
                return fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=65dfc7241a2e0327872325ano74c68e`)
                .then(response => response.json())
                .then(data => {
                    const locationName = data.display_name || 'Your Location';
                    displayResults(todayData, tomorrowData, locationName);
                });
            })
            .catch(error => {
                showError('Unable to retrieve your location: ' + error.message);
            })
            .finally(() => {
                hideLoadingAnimation(); 
            });
        }, function(error) {
            showError('Geolocation error: ' + error.message);
            hideLoadingAnimation(); 
        });
    } else {
        showError('Geolocation is not supported by your browser.');
        hideLoadingAnimation(); 
    }
}


function showError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<p class="error">${message}</p>`;
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
    geoLocationButton.addEventListener('click', useMyLocation);
});

function showLoadingAnimation() {
    console.log('Showing loading animation');
    document.getElementById('loading').style.display = 'flex';
}

function hideLoadingAnimation() {
    console.log('Hiding loading animation');
    document.getElementById('loading').style.display = 'none';
}




