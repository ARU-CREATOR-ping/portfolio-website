/**
 * WEATHER FORECASTS - MODERN CORE ENGINE
 * Full API Integrations, Autocomplete, Particle Canvas, Chart.js & Favorites Manager.
 * 100% Industry Standard Vanilla JS structure.
 */

(function () {
    'use strict';

    // --- State Management ---
    const AppState = {
        currentUnit: 'C', // 'C' or 'F'
        currentCity: {
            name: "New York",
            country: "United States of America",
            continent: "North America",
            lat: 40.7128,
            lon: -74.0060
        },
        weatherData: null,
        airQualityData: null,
        favorites: [],
        activeWeatherTheme: 'clear-day', // maps to body classes
        chartInstance: null
    };

    // --- DOM Cache ---
    const DOM = {
        searchForm: document.getElementById('weather-search-form'),
        searchInput: document.getElementById('city-search-input'),
        autocompleteMenu: document.getElementById('autocomplete-results'),
        autocompleteList: document.getElementById('autocomplete-list'),
        gpsTrigger: document.getElementById('gps-trigger'),
        unitC: document.getElementById('unit-c'),
        unitF: document.getElementById('unit-f'),
        liveTime: document.getElementById('live-time'),
        favoriteToggleBtn: document.getElementById('favorite-toggle-btn'),
        favoritesList: document.getElementById('favorites-list'),
        favoritesCount: document.getElementById('favorites-count'),
        
        // Hero Displays
        continent: document.getElementById('continent-display'),
        cityName: document.getElementById('city-name-display'),
        countryName: document.getElementById('country-name-display'),
        heroEmoji: document.getElementById('hero-weather-icon'),
        weatherDesc: document.getElementById('weather-desc-display'),
        currentTemp: document.getElementById('current-temp-val'),
        currentUnitLabel: document.getElementById('current-temp-unit'),
        apparentTemp: document.getElementById('apparent-temp-display'),
        maxTemp: document.getElementById('day-max-temp-display'),
        minTemp: document.getElementById('day-min-temp-display'),
        precipMax: document.getElementById('day-precip-display'),
        humidity: document.getElementById('day-humidity-display'),
        
        // List/Grid Containers
        hourlyList: document.getElementById('hourly-list-container'),
        dailyRows: document.getElementById('daily-forecast-rows'),
        
        // Sub-Metrics
        aqi: document.getElementById('aqi-display'),
        aqiRisk: document.getElementById('aqi-risk-display'),
        aqiTip: document.getElementById('aqi-tip-display'),
        pm25: document.getElementById('pm25-display'),
        pm10: document.getElementById('pm10-display'),
        
        uv: document.getElementById('uv-display'),
        uvRisk: document.getElementById('uv-risk-display'),
        uvTip: document.getElementById('uv-tip-display'),
        uvBarFill: document.getElementById('uv-bar-fill'),
        
        sunrise: document.getElementById('sunrise-display'),
        sunset: document.getElementById('sunset-display'),
        daylight: document.getElementById('daylight-display'),
        sunArcProgress: document.getElementById('sun-arc-progress'),
        sunArcNode: document.getElementById('sun-arc-node'),
        
        windSpeed: document.getElementById('wind-speed-display'),
        windUnit: document.getElementById('wind-unit-display'),
        windCompass: document.getElementById('compass-pointer-arrow'),
        windDeg: document.getElementById('wind-deg-display'),
        pressure: document.getElementById('pressure-display'),
        
        chartPeak: document.getElementById('chart-peak-display')
    };

    // --- Weather Codes Definition (WMO Codes Mapping) ---
    const WMOCodes = {
        0: { desc: "Clear sky", emoji: "☀️", emojiNight: "🌙", theme: "clear-day", themeNight: "clear-night", windSpin: "8s" },
        1: { desc: "Mainly clear", emoji: "🌤️", emojiNight: "🌙", theme: "clear-day", themeNight: "clear-night", windSpin: "6s" },
        2: { desc: "Partly cloudy", emoji: "⛅", emojiNight: "☁️", theme: "clouds", themeNight: "clouds", windSpin: "5s" },
        3: { desc: "Overcast", emoji: "☁️", emojiNight: "☁️", theme: "clouds", themeNight: "clouds", windSpin: "4s" },
        45: { desc: "Foggy", emoji: "🌫️", emojiNight: "🌫️", theme: "clouds", themeNight: "clouds", windSpin: "12s" },
        48: { desc: "Depositing rime fog", emoji: "🌫️", emojiNight: "🌫️", theme: "clouds", themeNight: "clouds", windSpin: "12s" },
        51: { desc: "Light drizzle", emoji: "🌧️", emojiNight: "🌧️", theme: "rain", themeNight: "rain", windSpin: "3s" },
        53: { desc: "Moderate drizzle", emoji: "🌧️", emojiNight: "🌧️", theme: "rain", themeNight: "rain", windSpin: "2.5s" },
        55: { desc: "Dense drizzle", emoji: "🌧️", emojiNight: "🌧️", theme: "rain", themeNight: "rain", windSpin: "2s" },
        61: { desc: "Slight rain", emoji: "🌧️", emojiNight: "🌧️", theme: "rain", themeNight: "rain", windSpin: "2s" },
        63: { desc: "Moderate rain", emoji: "🌧️", emojiNight: "🌧️", theme: "rain", themeNight: "rain", windSpin: "1.8s" },
        65: { desc: "Heavy rain", emoji: "🌧️", emojiNight: "🌧️", theme: "rain", themeNight: "rain", windSpin: "1.5s" },
        71: { desc: "Slight snowfall", emoji: "❄️", emojiNight: "❄️", theme: "snow", themeNight: "snow", windSpin: "4s" },
        73: { desc: "Moderate snowfall", emoji: "❄️", emojiNight: "❄️", theme: "snow", themeNight: "snow", windSpin: "3s" },
        75: { desc: "Heavy snowfall", emoji: "❄️", emojiNight: "❄️", theme: "snow", themeNight: "snow", windSpin: "2s" },
        80: { desc: "Slight rain showers", emoji: "🌦️", emojiNight: "🌧️", theme: "rain", themeNight: "rain", windSpin: "2.2s" },
        81: { desc: "Moderate rain showers", emoji: "🌧️", emojiNight: "🌧️", theme: "rain", themeNight: "rain", windSpin: "1.8s" },
        82: { desc: "Violent rain showers", emoji: "🌧️", emojiNight: "🌧️", theme: "rain", themeNight: "rain", windSpin: "1.2s" },
        95: { desc: "Thunderstorm", emoji: "⛈️", emojiNight: "⛈️", theme: "storm", themeNight: "storm", windSpin: "1.5s" },
        96: { desc: "Thunderstorm with hail", emoji: "⛈️", emojiNight: "⛈️", theme: "storm", themeNight: "storm", windSpin: "1.2s" },
        99: { desc: "Severe thunderstorm", emoji: "⛈️", emojiNight: "⛈️", theme: "storm", themeNight: "storm", windSpin: "0.8s" }
    };

    function getWMOMetadata(code, isDay) {
        const data = WMOCodes[code] || { desc: "Unknown", emoji: "🌡️", emojiNight: "🌡️", theme: "clear-day", themeNight: "clear-night", windSpin: "4s" };
        return {
            desc: data.desc,
            emoji: isDay ? data.emoji : data.emojiNight,
            theme: isDay ? data.theme : data.themeNight,
            windSpin: data.windSpin
        };
    }
    // --- Autocomplete Suggestions Debounced Searching Engine ---
    let searchDebounceTimeout = null;

    function handleSearchInput(event) {
        const query = event.target.value.trim();
        clearTimeout(searchDebounceTimeout);

        if (query.length < 2) {
            DOM.autocompleteMenu.classList.add('d-none');
            return;
        }

        // 250ms Debounce to optimize API requests
        searchDebounceTimeout = setTimeout(async () => {
            try {
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    renderAutocompleteDropdown(data.results);
                } else {
                    DOM.autocompleteMenu.classList.add('d-none');
                }
            } catch (err) {
                console.error("Geocoding fetch failure:", err);
            }
        }, 250);
    }

    function renderAutocompleteDropdown(results) {
        DOM.autocompleteList.innerHTML = '';
        results.forEach(res => {
            const li = document.createElement('li');
            li.innerHTML = `
                <i class="fa-solid fa-location-dot suggest-icon"></i>
                <span class="city-name-txt fw-semibold">${res.name}</span>
                <span class="country-name">${res.admin1 ? res.admin1 + ', ' : ''}${res.country || ''}</span>
            `;
            
            li.addEventListener('click', () => {
                AppState.currentCity = {
                    name: res.name,
                    country: res.country || '',
                    continent: res.timezone ? res.timezone.split('/')[0].replace('_', ' ') : 'Global',
                    lat: res.latitude,
                    lon: res.longitude
                };
                
                DOM.searchInput.value = '';
                DOM.autocompleteMenu.classList.add('d-none');
                loadWeatherDashboard();
            });

            DOM.autocompleteList.appendChild(li);
        });
        DOM.autocompleteMenu.classList.remove('d-none');
    }

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
        if (!DOM.searchInput.contains(e.target) && !DOM.autocompleteMenu.contains(e.target)) {
            DOM.autocompleteMenu.classList.add('d-none');
        }
    });

    // --- Weather API Operations ---
    async function loadWeatherDashboard() {
        const { lat, lon, name } = AppState.currentCity;
        
        try {
            // Modify dynamic loader markers
            DOM.cityName.innerText = "Synchronizing...";
            DOM.countryName.innerText = "Connecting to satellites...";
            DOM.gpsTrigger.style.setProperty('--gps-icon', 'fa-spinner fa-spin');

            // 1. Fetch Forecast coordinates (Current, Hourly 24H, Daily 7D)
            const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
            const forecastRes = await fetch(forecastUrl);
            AppState.weatherData = await forecastRes.json();

            // 2. Fetch Air Quality specs (us_aqi, pm2_5, pm10 only - o3/no2 are removed to prevent server-side crash)
            const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10&timezone=auto`;
            const aqiRes = await fetch(aqiUrl);
            AppState.airQualityData = await aqiRes.json();

            // Reset GPS spinner
            DOM.gpsTrigger.style.setProperty('--gps-icon', 'fa-location-crosshairs');

            // Render details
            renderMainHero();
            renderHourlyCarousel();
            renderDailyForecast();
            renderPrecipitationChart();
            renderDetailedMetrics();
            generateWeatherSynopsis();
            updateFavoriteStatusUI();

        } catch (error) {
            console.error("Critical Weather Load Error:", error);
            DOM.cityName.innerText = "Coordinates Timeout";
            DOM.countryName.innerText = "Verification failed. Please check network.";
            DOM.gpsTrigger.style.setProperty('--gps-icon', 'fa-location-crosshairs');
        }
    }

    // --- Dashboard UI Renderers ---

    function renderMainHero() {
        const cur = AppState.weatherData.current;
        const isDay = cur.is_day === 1;

        // Apply WMO code metadata
        const wmo = getWMOMetadata(cur.weather_code, isDay);
        AppState.activeWeatherTheme = wmo.theme;
        
        // Apply visual atmospheric body theme classes
        document.body.className = `weather-theme-${wmo.theme}`;

        // Populate basic headers
        DOM.continent.innerText = AppState.currentCity.continent;
        DOM.cityName.innerText = AppState.currentCity.name;
        DOM.countryName.innerText = AppState.currentCity.country;
        
        DOM.heroEmoji.innerText = wmo.emoji;
        DOM.weatherDesc.innerText = wmo.desc;

        // Update temperature values
        updateHeroTemperatureValues();
    }

    function generateWeatherSynopsis() {
        const cur = AppState.weatherData.current;
        const daily = AppState.weatherData.daily;
        const aqiVal = AppState.airQualityData.current.us_aqi;
        
        const temp = cur.temperature_2m;
        const wmo = getWMOMetadata(cur.weather_code, cur.is_day === 1);
        const isRaining = wmo.theme === 'rain' || wmo.theme === 'storm';
        const isSnowing = wmo.theme === 'snow';
        
        let synopsis = "";
        
        // 1. Core conditions and temperature feelings
        if (temp > 30) {
            synopsis += `Expect hot conditions today with temperatures peaking near ${Math.round(daily.temperature_2m_max[0])}°C. `;
        } else if (temp > 20) {
            synopsis += `The weather is comfortably mild, reaching a daily high of ${Math.round(daily.temperature_2m_max[0])}°C. `;
        } else if (temp > 10) {
            synopsis += `Cooler conditions prevail today, with outdoor temperatures hovering around ${Math.round(temp)}°C. `;
        } else {
            synopsis += `Chilly, crisp weather is observed, dropping to a low of ${Math.round(daily.temperature_2m_min[0])}°C. `;
        }
        
        // 2. Weather conditions
        if (isRaining) {
            synopsis += `Active precipitation is present, bringing persistent dampness or rain showers. Keeping an umbrella handy is advised. `;
        } else if (isSnowing) {
            synopsis += `Snowfall is active, contributing to cold, wintery surroundings. Watch out for slick conditions on outdoor paths. `;
        } else if (wmo.theme === 'clouds') {
            synopsis += `An overcast, cloudy sky is dominant, reducing direct sunlight and giving the day a quiet, gray atmosphere. `;
        } else {
            synopsis += `Clear skies provide beautiful, abundant sunshine across the landscape today. `;
        }
        
        // 3. Air Quality details
        if (aqiVal <= 50) {
            synopsis += `The atmosphere is exceptionally clean with an AQI of ${aqiVal}, offering ideal conditions for outdoor ventilation. `;
        } else if (aqiVal <= 100) {
            synopsis += `Air quality index is moderate at ${aqiVal}, which is comfortable for most individuals. `;
        } else {
            synopsis += `Particulate concentrations are elevated. It is recommended to close windows and moderate heavy outdoor exercise. `;
        }
        
        // 4. Wind info
        const windSpeed = cur.wind_speed_10m;
        if (windSpeed > 25) {
            synopsis += `Brisk, strong winds are blowing at ${Math.round(windSpeed)} km/h.`;
        } else if (windSpeed > 10) {
            synopsis += `A light, steady breeze is active at ${Math.round(windSpeed)} km/h.`;
        } else {
            synopsis += `Atmospheric winds are quiet and calm.`;
        }
        
        document.getElementById('weather-synopsis-text').innerText = synopsis;
    }

    function updateHeroTemperatureValues() {
        const cur = AppState.weatherData.current;
        const daily = AppState.weatherData.daily;
        
        const isC = AppState.currentUnit === 'C';
        const displayUnit = isC ? '°C' : '°F';
        
        const temp = isC ? cur.temperature_2m : (cur.temperature_2m * 9/5 + 32);
        const apparent = isC ? cur.apparent_temperature : (cur.apparent_temperature * 9/5 + 32);
        const max = isC ? daily.temperature_2m_max[0] : (daily.temperature_2m_max[0] * 9/5 + 32);
        const min = isC ? daily.temperature_2m_min[0] : (daily.temperature_2m_min[0] * 9/5 + 32);

        DOM.currentTemp.innerText = Math.round(temp);
        DOM.currentUnitLabel.innerText = displayUnit;
        DOM.apparentTemp.innerText = `${Math.round(apparent)}${displayUnit}`;
        DOM.maxTemp.innerText = `${Math.round(max)}${displayUnit}`;
        DOM.minTemp.innerText = `${Math.round(min)}${displayUnit}`;

        DOM.precipMax.innerText = `${cur.precipitation.toFixed(1)} mm`;
        DOM.humidity.innerText = `${cur.relative_humidity_2m}%`;
    }

    function renderHourlyCarousel() {
        DOM.hourlyList.innerHTML = '';
        const hourly = AppState.weatherData.hourly;
        
        // Find index of current hour inside API timezone array to start 24H projection
        const now = new Date();
        let startIndex = 0;
        const apiTimes = hourly.time;

        for (let i = 0; i < apiTimes.length; i++) {
            const apiDate = new Date(apiTimes[i]);
            if (apiDate.getTime() >= now.getTime()) {
                startIndex = i;
                break;
            }
        }

        const isC = AppState.currentUnit === 'C';

        for (let i = 0; i < 24; i++) {
            const idx = startIndex + i;
            if (idx >= apiTimes.length) break;

            const time = new Date(apiTimes[idx]);
            const hourLabel = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            // Assume day/night WMO based on hour
            const hourInt = time.getHours();
            const isDayHour = hourInt > 5 && hourInt < 19;
            const wmo = getWMOMetadata(hourly.weather_code[idx], isDayHour);

            const rawTemp = hourly.temperature_2m[idx];
            const tempVal = isC ? rawTemp : (rawTemp * 9/5 + 32);
            const pop = hourly.precipitation_probability[idx];

            const card = document.createElement('div');
            card.className = `hourly-column-card ${i === 0 ? 'active-hour' : ''}`;
            card.innerHTML = `
                <span class="hourly-time">${i === 0 ? 'Now' : hourLabel.split(' ')[0] + ' ' + hourLabel.split(' ')[1].toLowerCase()}</span>
                <span class="hourly-emoji" title="${wmo.desc}">${wmo.emoji}</span>
                <span class="hourly-temp">${Math.round(tempVal)}°</span>
                <span class="hourly-pop">${pop > 5 ? '☔ ' + pop + '%' : '&nbsp;'}</span>
            `;
            DOM.hourlyList.appendChild(card);
        }
    }

    function renderDailyForecast() {
        DOM.dailyRows.innerHTML = '';
        const daily = AppState.weatherData.daily;
        const isC = AppState.currentUnit === 'C';

        for (let i = 0; i < 7; i++) {
            const date = new Date(daily.time[i]);
            const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });
            const wmo = getWMOMetadata(daily.weather_code[i], true); // default day display

            const rawMax = daily.temperature_2m_max[i];
            const rawMin = daily.temperature_2m_min[i];

            const maxVal = isC ? rawMax : (rawMax * 9/5 + 32);
            const minVal = isC ? rawMin : (rawMin * 9/5 + 32);

            // Construct visual mini progress temperature range offset
            // We set static boundary ranges from -10C to 45C (or 14F to 113F)
            const minLimit = isC ? -10 : 14;
            const maxLimit = isC ? 45 : 113;
            const rangeWidth = maxLimit - minLimit;
            
            const leftPct = Math.max(0, Math.min(100, ((minVal - minLimit) / rangeWidth) * 100));
            const rightPct = Math.max(0, Math.min(100, ((maxVal - minLimit) / rangeWidth) * 100));
            const widthPct = Math.max(8, rightPct - leftPct);

            const row = document.createElement('div');
            row.className = 'daily-forecast-row';
            row.innerHTML = `
                <h5 class="daily-day-title">${dayName.substring(0,3)}<span class="d-none d-sm-inline">${dayName.substring(3)}</span></h5>
                <div class="daily-emoji-cell" title="${wmo.desc}">${wmo.emoji}</div>
                <div class="daily-desc-cell">${wmo.desc.split('/')[0]}</div>
                <div class="daily-range-progress-wrap d-none d-md-flex">
                    <div class="range-bar-track">
                        <div class="range-bar-fill" style="left: ${leftPct}%; width: ${widthPct}%"></div>
                    </div>
                </div>
                <div class="daily-temps-cell">
                    <span class="daily-max-temp">${Math.round(maxVal)}°</span>
                    <span class="daily-min-temp">${Math.round(minVal)}°</span>
                </div>
            `;
            DOM.dailyRows.appendChild(row);
        }
    }

    function renderPrecipitationChart() {
        const hourly = AppState.weatherData.hourly;
        const now = new Date();
        let startIndex = 0;

        for (let i = 0; i < hourly.time.length; i++) {
            if (new Date(hourly.time[i]).getTime() >= now.getTime()) {
                startIndex = i;
                break;
            }
        }

        const xLabels = [];
        const yData = [];
        let peakValue = 0;

        for (let i = 0; i < 12; i++) {
            const idx = startIndex + i;
            if (idx >= hourly.time.length) break;

            const time = new Date(hourly.time[idx]);
            const formattedHour = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).split(' ')[0];
            
            xLabels.push(formattedHour);
            
            const prob = hourly.precipitation_probability[idx];
            yData.push(prob);
            if (prob > peakValue) peakValue = prob;
        }

        DOM.chartPeak.innerText = `Peak: ${peakValue}%`;

        // Destroy legacy chart context to prevent overlap issues
        if (AppState.chartInstance) {
            AppState.chartInstance.destroy();
        }

        const ctx = document.getElementById('precipitation-chart').getContext('2d');
        
        // Define gorgeous translucent gradient background
        const purpleGrad = ctx.createLinearGradient(0, 0, 0, 100);
        purpleGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        purpleGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

        AppState.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xLabels,
                datasets: [{
                    label: 'Probability (%)',
                    data: yData,
                    borderColor: '#38bdf8',
                    borderWidth: 2,
                    pointBackgroundColor: '#38bdf8',
                    pointHoverRadius: 5,
                    fill: true,
                    backgroundColor: purpleGrad,
                    tension: 0.4 // Smooth bezier curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.45)', font: { size: 9, family: 'Inter' } }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: { color: 'rgba(255,255,255,0.45)', font: { size: 9 }, stepSize: 25 }
                    }
                }
            }
        });
    }

    function renderDetailedMetrics() {
        const cur = AppState.weatherData.current;
        const daily = AppState.weatherData.daily;
        const aqiVal = AppState.airQualityData.current.us_aqi;
        const curAqi = AppState.airQualityData.current;

        // 1. Air Quality Details
        DOM.aqi.innerText = aqiVal;
        DOM.pm25.innerText = Math.round(curAqi.pm2_5);
        DOM.pm10.innerText = Math.round(curAqi.pm10);

        let aqiText = "Good";
        let aqiColor = "#34d399";
        let aqiTip = "Ideal conditions for outdoor runs, activities, and coding on a deck!";

        if (aqiVal > 50 && aqiVal <= 100) {
            aqiText = "Moderate";
            aqiColor = "#f59e0b";
            aqiTip = "Sensitive individuals should limit prolonged heavy outdoor exercise.";
        } else if (aqiVal > 100 && aqiVal <= 150) {
            aqiText = "Mild Risk";
            aqiColor = "#f97316";
            aqiTip = "Unhealthy for sensitive groups. Take frequent breaks indoors.";
        } else if (aqiVal > 150) {
            aqiText = "High Risk";
            aqiColor = "#ef4444";
            aqiTip = "Unhealthy conditions! Keep windows closed. Air purifiers recommended.";
        }

        DOM.aqiRisk.innerText = aqiText;
        DOM.aqiRisk.style.color = aqiColor;
        DOM.aqiTip.innerText = aqiTip;

        // 2. UV Index
        const uvVal = daily.uv_index_max[0];
        DOM.uv.innerText = uvVal.toFixed(1);

        let uvText = "Low";
        let uvColor = "#34d399";
        let uvTip = "Safe conditions! No special precautions needed for shorter exposures.";

        if (uvVal > 2 && uvVal <= 5) {
            uvText = "Moderate";
            uvColor = "#fbbf24";
            uvTip = "Sunscreen SPF 15+ is recommended if outside during peak noon.";
        } else if (uvVal > 5 && uvVal <= 7) {
            uvText = "High";
            uvColor = "#f97316";
            uvTip = "Sunscreen SPF 30+, hats, and shirts are highly recommended.";
        } else if (uvVal > 7) {
            uvText = "Very High";
            uvColor = "#f43f5e";
            uvTip = "Extremely high radiation! Try to seek shade. Wear high UV protection.";
        }

        DOM.uvRisk.innerText = uvText;
        DOM.uvRisk.style.color = uvColor;
        DOM.uvTip.innerText = uvTip;
        
        // Fill progress bar (Max scale UV Index is 11)
        const uvPercent = Math.min(100, (uvVal / 11) * 100);
        DOM.uvBarFill.style.width = `${uvPercent}%`;

        // 3. Compass Needle Rotate & Wind speed
        DOM.windSpeed.innerText = Math.round(cur.wind_speed_10m);
        DOM.windDeg.innerText = `${cur.wind_direction_10m}°`;
        DOM.pressure.innerText = Math.round(cur.pressure_msl);

        // Compass pointing arrow offset rotation
        DOM.windCompass.style.transform = `rotate(${cur.wind_direction_10m}deg)`;

        // 4. Sunrise & Sunset Solar Arc Position
        const rawSunrise = new Date(daily.sunrise[0]);
        const rawSunset = new Date(daily.sunset[0]);

        DOM.sunrise.innerText = rawSunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        DOM.sunset.innerText = rawSunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        // Calculate Daylight percentage
        const now = new Date();
        const totalDaylightMs = rawSunset - rawSunrise;
        const currentProgressMs = now - rawSunrise;

        let ratio = 0;
        let daylightText = "";

        if (now < rawSunrise) {
            ratio = 0;
            daylightText = "Day has not started yet.";
        } else if (now > rawSunset) {
            ratio = 1;
            daylightText = "Night conditions active.";
        } else {
            ratio = currentProgressMs / totalDaylightMs;
            const remainingMins = Math.round((rawSunset - now) / 60000);
            const hrs = Math.floor(remainingMins / 60);
            const mins = remainingMins % 60;
            daylightText = `${hrs}h ${mins}m of daylight remaining.`;
        }

        DOM.daylight.innerText = daylightText;

        // Position Solar Node dynamically along the exact mathematical curve
        // SVG Arc: M 5,45 A 40,40 0 0,1 95,45
        // Centered around 50,45 with rx=40, ry=40. Theta goes from PI (left, sunrise) to 0 (right, sunset)
        const theta = Math.PI - (ratio * Math.PI);
        const nodeX = 50 - 40 * Math.cos(ratio * Math.PI);
        const nodeY = 45 - 40 * Math.sin(ratio * Math.PI);

        DOM.sunArcNode.setAttribute('cx', nodeX);
        DOM.sunArcNode.setAttribute('cy', nodeY);

        // Update progress path segment dynamically
        DOM.sunArcProgress.setAttribute('d', `M 5,45 A 40,40 0 0,1 ${nodeX},${nodeY}`);
    }

    // --- Favorites Persistence Management ---

    function initFavoritesStorage() {
        const stored = localStorage.getItem('weather_favorites');
        if (stored) {
            try {
                AppState.favorites = JSON.parse(stored);
            } catch (err) {
                AppState.favorites = [];
            }
        } else {
            // Seed a default bookmark city so it doesn't look barren
            AppState.favorites = [
                { name: "New Delhi", country: "India", continent: "Asia", lat: 28.6139, lon: 77.2090 },
                { name: "London", country: "United Kingdom", continent: "Europe", lat: 51.5074, lon: -0.1278 },
                { name: "Tokyo", country: "Japan", continent: "Asia", lat: 35.6762, lon: 139.6503 }
            ];
            saveFavoritesToStorage();
        }
        renderFavoritesList();
    }

    function saveFavoritesToStorage() {
        localStorage.setItem('weather_favorites', JSON.stringify(AppState.favorites));
        DOM.favoritesCount.innerText = AppState.favorites.length;
    }

    function renderFavoritesList() {
        DOM.favoritesList.innerHTML = '';
        
        if (AppState.favorites.length === 0) {
            DOM.favoritesList.innerHTML = `
                <li class="text-center py-4 text-muted-custom placeholder-text">
                    <i class="fa-regular fa-bookmark fs-2 mb-2 d-block opacity-50"></i>
                    No saved locations. Click the heart icon on a city to save it.
                </li>
            `;
            DOM.favoritesCount.innerText = "0";
            return;
        }

        DOM.favoritesCount.innerText = AppState.favorites.length;

        AppState.favorites.forEach((fav, index) => {
            const li = document.createElement('li');
            li.className = 'favorite-city-item';
            
            li.innerHTML = `
                <div class="fav-info-block">
                    <h5 class="fav-title">${fav.name}</h5>
                    <span class="fav-country">${fav.country}</span>
                </div>
                <div class="d-flex align-items-center">
                    <button class="fav-remove-btn" title="Delete bookmark" data-index="${index}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;

            // Load saved city when clicked
            li.addEventListener('click', (e) => {
                if (e.target.closest('.fav-remove-btn')) return; // ignore delete click
                
                AppState.currentCity = {
                    name: fav.name,
                    country: fav.country,
                    continent: fav.continent,
                    lat: fav.lat,
                    lon: fav.lon
                };
                loadWeatherDashboard();
            });

            // Handle bookmark deletion
            const delBtn = li.querySelector('.fav-remove-btn');
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(delBtn.getAttribute('data-index'), 10);
                AppState.favorites.splice(idx, 1);
                saveFavoritesToStorage();
                renderFavoritesList();
                updateFavoriteStatusUI();
            });

            DOM.favoritesList.appendChild(li);
        });
    }

    function updateFavoriteStatusUI() {
        const currentName = AppState.currentCity.name;
        const exists = AppState.favorites.some(fav => fav.name.toLowerCase() === currentName.toLowerCase());
        
        if (exists) {
            DOM.favoriteToggleBtn.classList.add('active');
            DOM.favoriteToggleBtn.querySelector('i').className = 'fa-solid fa-heart';
        } else {
            DOM.favoriteToggleBtn.classList.remove('active');
            DOM.favoriteToggleBtn.querySelector('i').className = 'fa-regular fa-heart';
        }
    }

    function toggleCurrentCityAsFavorite() {
        const cur = AppState.currentCity;
        const index = AppState.favorites.findIndex(fav => fav.name.toLowerCase() === cur.name.toLowerCase());

        if (index > -1) {
            // Remove
            AppState.favorites.splice(index, 1);
        } else {
            // Add
            AppState.favorites.push({
                name: cur.name,
                country: cur.country,
                continent: cur.continent,
                lat: cur.lat,
                lon: cur.lon
            });
        }

        saveFavoritesToStorage();
        renderFavoritesList();
        updateFavoriteStatusUI();
    }

    // --- Geolocation Support ---
    function triggerGPSLocation() {
        if (!navigator.geolocation) {
            alert("Your browser does not support Geolocation APIs.");
            return;
        }

        DOM.gpsTrigger.style.setProperty('--gps-icon', 'fa-spinner fa-spin');
        
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                try {
                    // Reverse Geocode using geocoding service
                    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
                    const res = await fetch(url);
                    const geo = await res.json();
                    
                    AppState.currentCity = {
                        name: geo.city || geo.locality || "Your Location",
                        country: geo.countryName || "Local Coordinates",
                        continent: geo.continent || "Global",
                        lat: lat,
                        lon: lon
                    };
                } catch (err) {
                    AppState.currentCity = {
                        name: "GPS Location",
                        country: "Local Coordinates",
                        continent: "Global",
                        lat: lat,
                        lon: lon
                    };
                }
                loadWeatherDashboard();
            },
            (error) => {
                console.error("GPS position rejected:", error);
                alert("Location access denied. Displaying default city (New York).");
                DOM.gpsTrigger.style.setProperty('--gps-icon', 'fa-location-crosshairs');
            }
        );
    }

    // --- Initialization & Event Listeners ---
    function initApp() {
        // 1. Start live clock updating
        setInterval(() => {
            const time = new Date();
            DOM.liveTime.innerText = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }, 1000);

        // 2. Motionless background gradients applied via CSS themes

        // 3. Autocomplete dynamic bindings
        DOM.searchInput.addEventListener('input', handleSearchInput);

        // 4. Form Submission Search
        DOM.searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const val = DOM.searchInput.value.trim();
            if (!val) return;

            DOM.autocompleteMenu.classList.add('d-none');

            // Quick search (queries Geocoding count 1)
            try {
                DOM.cityName.innerText = "Searching...";
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=1&language=en&format=json`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    const res = data.results[0];
                    AppState.currentCity = {
                        name: res.name,
                        country: res.country || '',
                        continent: res.timezone ? res.timezone.split('/')[0].replace('_', ' ') : 'Global',
                        lat: res.latitude,
                        lon: res.longitude
                    };
                    DOM.searchInput.value = '';
                    loadWeatherDashboard();
                } else {
                    DOM.cityName.innerText = "City Not Found";
                    DOM.countryName.innerText = "Check spellings or try other regions.";
                }
            } catch (err) {
                console.error("Geocoding quick search failed:", err);
            }
        });

        // 5. GPS Click Bindings
        DOM.gpsTrigger.addEventListener('click', triggerGPSLocation);

        // 6. Unit Toggles
        DOM.unitC.addEventListener('click', () => {
            if (AppState.currentUnit === 'C') return;
            AppState.currentUnit = 'C';
            DOM.unitC.classList.add('active');
            DOM.unitF.classList.remove('active');
            updateHeroTemperatureValues();
            renderHourlyCarousel();
            renderDailyForecast();
        });

        DOM.unitF.addEventListener('click', () => {
            if (AppState.currentUnit === 'F') return;
            AppState.currentUnit = 'F';
            DOM.unitF.classList.add('active');
            DOM.unitC.classList.remove('active');
            updateHeroTemperatureValues();
            renderHourlyCarousel();
            renderDailyForecast();
        });

        // 7. Favorite bookmark bindings
        DOM.favoriteToggleBtn.addEventListener('click', toggleCurrentCityAsFavorite);

        // 8. Load persistent favorite cities from local storage
        initFavoritesStorage();

        // 9. Load default city
        loadWeatherDashboard();
    }

    // Initialize once document is ready
    window.addEventListener('DOMContentLoaded', initApp);

})();
