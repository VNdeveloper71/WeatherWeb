//Weather Web
//Support: ChatGPT

//HTML elements
const loadingScreen = document.getElementById("loading-screen");

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const historyList = document.getElementById("history-list");
const lastUpdated = document.getElementById("last-updated");
const temperatureChart = document.getElementById("temperature-chart");
const chartRange = document.getElementById("chart-range");
const chartMetricLabel = document.getElementById("chart-metric-label");
const chartPeriodLabel = document.getElementById("chart-period-label");
const windSummary = document.getElementById("wind-summary");
const windCompassNeedle = document.getElementById("wind-compass-needle");
const chartTabs = document.querySelectorAll(".chart-tab");

const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weather-condition");
const cityName = document.getElementById("city-name");

const tempHigh = document.getElementById("temp-high");
const tempLow = document.getElementById("temp-low");
const feelsLikeHero = document.getElementById("feels-like-hero");

const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const uvIndex = document.getElementById("uv-index");
const uvLevel = document.getElementById("uv-level");

const aqi = document.getElementById("aqi");
const aqiLevel = document.getElementById("aqi-level");
const moonPhaseIcon = document.getElementById("moon-phase-icon");
const moonPhaseName = document.getElementById("moon-phase-name");
const uvBar = document.getElementById("uv-bar");
const aqiBar = document.getElementById("aqi-bar");

const hourlyContainer = document.getElementById("hourly-container");
const weekContainer = document.getElementById("week-container");
const sunCard = document.querySelector(".sun-card");
const sunOrb = document.querySelector(".sun-orb");
const moonOrb = document.querySelector(".moon-orb");
const sunTimeMarkers = document.getElementById("sun-time-markers");
const sunArc = document.querySelector(".sun-arc");

const chartMetricConfig = {
    temperature: {
        label: "Temperature Trend",
        period: "12 hours ahead",
        unit: "°C",
        color: "#1687c7",
        fill: "rgba(22, 135, 199, .16)",
        formatter: value => `${value.toFixed(1)}°C`,
        range: values => `${Math.min(...values).toFixed(1)}° / ${Math.max(...values).toFixed(1)}°`
    },
    rain: {
        label: "Rainfall",
        period: "12 hours ahead",
        unit: "mm",
        color: "#38bdf8",
        fill: "rgba(56, 189, 248, .18)",
        formatter: value => `${value.toFixed(1)} mm`,
        range: values => `${Math.min(...values).toFixed(1)}mm / ${Math.max(...values).toFixed(1)}mm`
    },
    humidity: {
        label: "Humidity",
        period: "12 hours ahead",
        unit: "%",
        color: "#22c55e",
        fill: "rgba(34, 197, 94, .18)",
        formatter: value => `${value.toFixed(0)}%`,
        range: values => `${Math.min(...values).toFixed(0)}% / ${Math.max(...values).toFixed(0)}%`
    },
    wind: {
        label: "Wind Speed",
        period: "12 hours ahead",
        unit: "km/h",
        color: "#60a5fa",
        fill: "rgba(96, 165, 250, .18)",
        formatter: value => `${value.toFixed(1)} km/h`,
        range: values => `${Math.min(...values).toFixed(1)} km/h / ${Math.max(...values).toFixed(1)} km/h`
    }
};

let activeChartMetric = "temperature";
let currentWeatherData = null;
let sunProgressTimer = null;

//Loading
function showLoading() {
    loadingScreen.classList.add("show");
}

function hideLoading() {
    loadingScreen.classList.remove("show");
}

//Weather Code
const weatherDay = {

    0: ["☀", "Clear Sky"],
    1: ["🌤", "Mainly Clear"],
    2: ["⛅", "Partly Cloudy"],
    3: ["☁", "Cloudy"],

    45: ["🌫", "Fog"],
    48: ["🌫", "Rime Fog"],

    51: ["🌦", "Light Drizzle"],
    53: ["🌦", "Moderate Drizzle"],
    55: ["🌦", "Dense Drizzle"],
    56: ["🌧", "Freezing Drizzle"],
    57: ["🌧", "Heavy Freezing Drizzle"],

    61: ["🌦", "Slight Rain"],
    63: ["🌧", "Moderate Rain"],
    65: ["🌧", "Heavy Rain"],
    66: ["🌧", "Freezing Rain"],
    67: ["🌧", "Heavy Freezing Rain"],

    71: ["🌨", "Slight Snow"],
    73: ["❄", "Moderate Snow"],
    75: ["❄", "Heavy Snow"],
    77: ["🌨", "Snow Grains"],

    80: ["🌦", "Slight Rain Shower"],
    81: ["🌧", "Moderate Rain Shower"],
    82: ["🌧", "Violent Rain Shower"],

    85: ["🌨", "Slight Snow Shower"],
    86: ["❄", "Heavy Snow Shower"],

    95: ["⛈", "Slight Thunderstorm"],
    96: ["⛈", "Moderate Thunderstorm"],
    99: ["⛈", "Severe Thunderstorm"]

};

const weatherNight = {

    0: ["🌙", "Clear Sky"],
    1: ["🌙", "Mainly Clear"],
    2: ["☁", "Partly Cloudy"],
    3: ["☁", "Cloudy"],

    45: ["🌫", "Fog"],
    48: ["🌫", "Rime Fog"],

    51: ["🌧", "Light Drizzle"],
    53: ["🌧", "Moderate Drizzle"],
    55: ["🌧", "Dense Drizzle"],
    56: ["🌧", "Freezing Drizzle"],
    57: ["🌧", "Heavy Freezing Drizzle"],

    61: ["🌧", "Slight Rain"],
    63: ["🌧", "Moderate Rain"],
    65: ["🌧", "Heavy Rain"],
    66: ["🌧", "Freezing Rain"],
    67: ["🌧", "Heavy Freezing Rain"],

    71: ["🌨", "Slight Snow"],
    73: ["❄", "Moderate Snow"],
    75: ["❄", "Heavy Snow"],
    77: ["🌨", "Snow Grains"],

    80: ["🌧", "Slight Rain Shower"],
    81: ["🌧", "Moderate Rain Shower"],
    82: ["🌧", "Violent Rain Shower"],

    85: ["🌨", "Slight Snow Shower"],
    86: ["❄", "Heavy Snow Shower"],

    95: ["⛈", "Slight Thunderstorm"],
    96: ["⛈", "Moderate Thunderstorm"],
    99: ["⛈", "Severe Thunderstorm"]
};

//Day_Night
function isDay(currentTime, sunrise, sunset) {
    const now = new Date(currentTime);
    const rise = new Date(sunrise);
    const set = new Date(sunset);

    return now >= rise && now < set;
}

//Search City
async function searchCity() {
    const city = cityInput.value.trim();
    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    showLoading();

    try {
        const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const geoResponse = await fetch(geoURL, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (!geoResponse.ok) throw new Error(`HTTP ${geoResponse.status}`);
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found.");
            hideLoading();
            return;
        }

        const place = geoData.results[0];
        cityName.textContent = place.name;
        saveHistory(place.name);
        await getWeather(place.latitude, place.longitude);
        // getAQI runs independently and handles its own errors
        getAQI(place.latitude, place.longitude);
    }

    catch (error) {
        hideLoading();
        if (error.name === "AbortError") {
            console.warn("Search request timed out");
            alert("Search request timed out. Please try again.");
        } else {
            console.error(error);
            alert("Error: " + error.message);
        }
    }
}

async function useCurrentLocation() {
    if (!navigator.geolocation) {
        alert("Your browser does not support geolocation.");
        return;
    }

    showLoading();
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        cityName.textContent = "Current location";
        try {
            await getWeather(coords.latitude, coords.longitude);
            getAQI(coords.latitude, coords.longitude);
            hideLoading();
        }
        catch (error) {
            hideLoading();
            console.error("Weather request for current location failed:", error);
            alert("Unable to load weather for your current location. Please try again.");
        }
    }, () => {
        hideLoading();
        alert("Location access was denied.");
    });
}

//history
function loadHistory() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    historyList.innerHTML = "";
    history.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        historyList.appendChild(option);
    });
}
function saveHistory(city) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    // Remove the city if it is already in the history.
    history = history.filter(item => item !== city);
    // Add the city to the beginning of the history.
    history.unshift(city);
    // Keep only the 10 most recent cities.
    history = history.slice(0, 10);
    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );
    loadHistory();
}

//Get Weather
async function getWeather(lat, lon, retries = 2) {
    const weatherURL =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,pressure_msl&hourly=temperature_2m,weather_code,precipitation,relative_humidity_2m,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(weatherURL, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        currentWeatherData = data;
        console.log(data);

        updateCurrent(data);
        updateHourly(data);
        updateWeek(data);
        hideLoading();
    } catch (error) {
        console.warn("Weather fetch failed:", error.message);
        if (retries > 0) {
            console.log(`Retrying weather in 2 seconds... (${retries} retries left)`);
            await new Promise(r => setTimeout(r, 2000));
            await getWeather(lat, lon, retries - 1);
        } else {
            console.error("Weather data unavailable after retries");
            // Fallback: show error message but don't alert user
            alert("Unable to load weather data. Please try again.");
        }
    }
}

async function getAQI(lat, lon, retries = 2) {
    const aqiURL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=auto`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(aqiURL, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        updateAQI(data);
    } catch (error) {
        console.warn("AQI fetch failed:", error.message);
        if (retries > 0) {
            await new Promise(r => setTimeout(r, 1500));
            await getAQI(lat, lon, retries - 1);
        } else {
            updateAQI(null);
        }
    }
}

//Current Weather
function parseLocalHour(value) {
    if (!value) return 12;
    const timePart = String(value).split("T")[1] || "00:00";
    const [hours, minutes] = timePart.split(":").map(Number);
    return (hours || 0) + ((minutes || 0) / 60);
}

function getArcPoint(hour, width, height) {
    if (hour === 24) {
        return { x: width * 0.92, y: height * 0.54 };
    }

    const normalized = ((hour % 24) + 24) % 24 / 24;
    const x = width * (0.08 + normalized * 0.84);
    const y = height * 0.54;
    return { x, y };
}

function renderTimeMarkers() {
    if (!sunTimeMarkers) return;

    const markerHours = [0, 6, 12, 18, 24];
    sunTimeMarkers.innerHTML = "";

    markerHours.forEach(hour => {
        const marker = document.createElement("span");
        marker.className = "sun-time-marker";
        marker.textContent = hour === 12 ? "☀" : hour === 0 || hour === 24 ? "🌙" : "•";
        marker.title = `${String(hour).padStart(2, "0")}h`;
        sunTimeMarkers.appendChild(marker);
    });
}

function updateSunPosition(data) {
    if (!sunOrb || !sunOrb.parentElement) return;

    const visual = sunOrb.parentElement;
    const visualWidth = visual.clientWidth || visual.offsetWidth || 300;
    const visualHeight = visual.clientHeight || visual.offsetHeight || 120;

    if (!sunTimeMarkers.children.length) {
        renderTimeMarkers();
    }

    const sunriseHour = parseLocalHour(data.daily.sunrise[0]);
    const sunsetHour = parseLocalHour(data.daily.sunset[0]);

    const sunPoint = getArcPoint(sunriseHour, visualWidth, visualHeight);
    sunOrb.style.display = "block";
    sunOrb.style.left = `${sunPoint.x}px`;
    sunOrb.style.bottom = `${sunPoint.y}px`;
    sunOrb.style.transform = "translateX(-50%)";

    if (sunArc) {
        const utcOffsetSeconds = Number(data.utc_offset_seconds) || 0;
        const updateProgress = () => {
            const localTime = new Date(Date.now() + utcOffsetSeconds * 1000);
            const localHour = localTime.getUTCHours()
                + localTime.getUTCMinutes() / 60
                + localTime.getUTCSeconds() / 3600;
            sunArc.style.setProperty("--sun-progress", `${(localHour / 24) * 100}%`);
        };

        updateProgress();
        if (sunProgressTimer !== null) {
            clearInterval(sunProgressTimer);
        }
        sunProgressTimer = setInterval(updateProgress, 60_000);
    }

    if (moonOrb) {
        const moonHour = Math.min(Math.max(sunsetHour + 1.2, 18.5), 21.5);
        const moonPoint = getArcPoint(moonHour, visualWidth, visualHeight);
        moonOrb.style.display = "block";
        moonOrb.style.left = `${moonPoint.x}px`;
        moonOrb.style.bottom = `${moonPoint.y}px`;
        moonOrb.style.transform = "translateX(-50%)";
        moonOrb.style.filter = "drop-shadow(0 0 12px rgba(195, 208, 255, 0.8))";
    }

    const markerHours = [0, 6, 12, 18, 24];
    [...sunTimeMarkers.children].forEach((marker, index) => {
        const mHour = markerHours[index];
        const point = getArcPoint(mHour, visualWidth, visualHeight);
        marker.style.left = `${point.x}px`;
        marker.style.bottom = `${point.y}px`;
        marker.style.opacity = "1";
        marker.textContent = mHour === 12 ? "☀️" : mHour === 0 || mHour === 24 ? "🌙" : "•";
        marker.title = `${mHour === 0 ? "0h" : mHour === 12 ? "12h" : mHour === 24 ? "24h" : `${mHour}h`}`;
    });
}

function updateCurrent(data) {
    const current = data.current;
    const code = current.weather_code;

    const day = isDay(
        current.time,
        data.daily.sunrise[0],
        data.daily.sunset[0]
    );

    const weather = day ? weatherDay : weatherNight;

    document.body.classList.remove("day", "night");
    document.body.classList.add(day ? "day" : "night");
    document.body.classList.remove("weather-clear", "weather-cloudy", "weather-rain", "weather-storm");
    const weatherType = code >= 95 ? "weather-storm" : code >= 51 ? "weather-rain" : code >= 1 ? "weather-cloudy" : "weather-clear";
    document.body.classList.add(weatherType);

    if (sunCard) {
        sunCard.classList.toggle("night-mode", !day);
    }
    weatherIcon.textContent = weather[code][0];

    weatherCondition.textContent = weather[code][1];

    temperature.textContent = current.temperature_2m + "°C";

    tempHigh.textContent = data.daily.temperature_2m_max[0] + "°";
    tempLow.textContent = data.daily.temperature_2m_min[0] + "°";

    feelsLike.textContent = current.apparent_temperature + "°C";
    feelsLikeHero.textContent = current.apparent_temperature;

    humidity.textContent = current.relative_humidity_2m + "%";

    updateWindSummary(current.wind_speed_10m, current.wind_direction_10m);

    sunrise.textContent = data.daily.sunrise[0].split("T")[1];

    sunset.textContent = data.daily.sunset[0].split("T")[1];

    const now = new Date();
    lastUpdated.textContent = `🕒 Last updated: ${now.toLocaleDateString([], {
        hour: "2-digit",
        minute: "2-digit"
    })}`;

    updateSunPosition(data);

    const uv = data.daily.uv_index_max[0];

    uvIndex.textContent = uv;
    uvBar.style.width = Math.min((uv / 11) * 100, 100) + "%";

    if (uv <= 2) {
        uvLevel.textContent = "Low";
        uvIndex.style.color = "#22c55e";
        uvLevel.style.color = "#22c55e";
        uvBar.style.background = "#22c55e";
    }
    else if (uv <= 5) {
        uvLevel.textContent = "Moderate";
        uvIndex.style.color = "#eab308";
        uvLevel.style.color = "#eab308";
        uvBar.style.background = "#eab308";
    }
    else if (uv <= 7) {
        uvLevel.textContent = "High";
        uvIndex.style.color = "#f97316";
        uvLevel.style.color = "#f97316";
        uvBar.style.background = "#f97316";
    }
    else if (uv <= 10) {
        uvLevel.textContent = "Very High";
        uvIndex.style.color = "#ef4444";
        uvLevel.style.color = "#ef4444";
        uvBar.style.background = "#ef4444";
    }
    else {
        uvLevel.textContent = "Extremely High";
        uvIndex.style.color = "#9333ea";
        uvLevel.style.color = "#9333ea";
        uvBar.style.background = "#9333ea";
    }

    updateMoonPhase();
}

//AQI-index
function updateAQI(data){
    
    if (!data || !data.current || data.current.us_aqi === undefined) {
        // Set default values when data is unavailable
        aqi.textContent = "--";
        aqiLevel.textContent = "No data available";
        aqi.style.color = "#999";
        aqiLevel.style.color = "#999";
        aqiBar.style.width = "0%";
        aqiBar.style.background = "#ddd";
        return;
    }

    const value = data.current.us_aqi;

    aqi.textContent = value;
    aqiBar.style.width = Math.min((value / 500) * 100, 100) + "%";

    if(value<=50){
        aqiLevel.textContent="Good";
        aqi.style.color="#22c55e";
        aqiLevel.style.color="#22c55e";
        aqiBar.style.background="#22c55e";
    }
    else if(value<=100){
        aqiLevel.textContent="Normal";
        aqi.style.color="#eab308";
        aqiLevel.style.color="#eab308";
        aqiBar.style.background="#eab308";
    }
    else if(value<=150){
        aqiLevel.textContent="Unhealthy";
        aqi.style.color="#f97316";
        aqiLevel.style.color="#f97316";
        aqiBar.style.background="#f97316";
    }
    else if(value<=200){
        aqiLevel.textContent="Very Unhealthy";
        aqi.style.color="#ef4444";
        aqiLevel.style.color="#ef4444";
        aqiBar.style.background="#ef4444";
    }
    else{
        aqiLevel.textContent="Dangerous";
        aqi.style.color="#9333ea";
        aqiLevel.style.color="#9333ea";
        aqiBar.style.background="#9333ea";
    }

}

function degreesToCompass(deg) {
    const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
}

function updateWindSummary(speed, direction) {
    if (speed === undefined || speed === null) {
        windSummary.textContent = "-- km/h · --";
        windCompassNeedle.style.transform = "translate(-50%, -50%) rotate(0deg)";
        return;
    }

    const dirName = direction === undefined || direction === null ? "--" : degreesToCompass(direction);
    windSummary.textContent = `${speed} km/h · ${dirName}`;
    const degrees = direction === undefined || direction === null ? 0 : Number(direction);
    windCompassNeedle.style.transform = `translate(-50%, -50%) rotate(${(degrees + 90) % 360}deg)`;
    windSpeed.textContent = `${speed} km/h · ${dirName}`;
}

//Moon Phase
function updateMoonPhase(){

    const now = new Date();

    const lp = 2551443;

    const newMoon = new Date(
        "2000-01-06T18:14:00Z"
    );

    const phase =
    ((now - newMoon) / 1000) % lp;

    const percent = phase / lp;

    let icon;
    let name;

    if(percent < 0.0625){
        icon = "🌑";
        name = "New Moon";
    }
    else if(percent < 0.1875){
        icon = "🌒";
        name = "Waxing Crescent";
    }
    else if(percent < 0.3125){
        icon = "🌓";
        name = "First Quarter";
    }
    else if(percent < 0.4375){
        icon = "🌔";
        name = "Waxing Gibbous";
    }
    else if(percent < 0.5625){
        icon = "🌕";
        name = "Full Moon";
    }
    else if(percent < 0.6875){
        icon = "🌖";
        name = "Waning Gibbous";
    }
    else if(percent < 0.8125){
        icon = "🌗";
        name = "Last Quarter";
    }
    else if(percent < 0.9375){
        icon = "🌘";
        name = "Waning Crescent";
    }
    else{
        icon = "🌑";
        name = "New Moon";
    }

    moonPhaseIcon.textContent = icon;
    moonPhaseName.textContent = name;
}

//Hourly Forecast
function getHourlyMetricValues(data) {
    const currentTime = data.current.time;
    const hour = parseInt(currentTime.split("T")[1].split(":")[0]);
    const times = data.hourly.time.slice(hour, hour + 12);

    const values = {
        temperature: data.hourly.temperature_2m.slice(hour, hour + 12),
        rain: data.hourly.precipitation.slice(hour, hour + 12),
        humidity: data.hourly.relative_humidity_2m.slice(hour, hour + 12),
        wind: data.hourly.wind_speed_10m.slice(hour, hour + 12)
    };

    return { times, values };
}

function updateHourly(data) {
    hourlyContainer.innerHTML = "";

    const currentTime = data.current.time;
    const hour = parseInt(currentTime.split("T")[1].split(":")[0]);
    const { times, values } = getHourlyMetricValues(data);

    for (let i = 0; i < 12; i++) {
        const index = (hour + i) % 24;
        const card = document.createElement("div");
        card.className = "hour-card";

        const code = data.hourly.weather_code[index];
        const day = isDay(
            data.hourly.time[index],
            data.daily.sunrise[0],
            data.daily.sunset[0]
        );

        const weather = day ? (weatherDay[code] || ["❓", "Unknown"]) : (weatherNight[code] || ["❓", "Unknown"]);
        const value = values[activeChartMetric][i];
        const metric = chartMetricConfig[activeChartMetric];

        card.innerHTML = `
            <p>${times[i].split("T")[1]}</p>
            <h3>${weather[0]}</h3>
            <p>${metric.formatter(value)}</p>
        `;
        hourlyContainer.appendChild(card);
    }

    drawChartForMetric(values[activeChartMetric], times, activeChartMetric);
}

function drawChartForMetric(values, times, metricName) {
    const metric = chartMetricConfig[metricName];
    const context = temperatureChart.getContext("2d");
    const width = temperatureChart.clientWidth;
    const height = 190;
    const scale = window.devicePixelRatio || 1;

    temperatureChart.width = width * scale;
    temperatureChart.height = height * scale;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(scale, scale);
    context.clearRect(0, 0, width, height);

    const minValue = metricName === "humidity" ? 0 : metricName === "rain" ? 0 : Math.floor(Math.min(...values) - 1);
    const maxValue = metricName === "humidity" ? 100 : metricName === "rain" ? Math.max(10, Math.ceil(Math.max(...values) + 1)) : Math.ceil(Math.max(...values) + 1);

    const padding = { top: 18, right: 12, bottom: 30, left: 42 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = values.map((value, index) => ({
        x: padding.left + (chartWidth * index) / (values.length - 1),
        y: padding.top + ((maxValue - value) / (maxValue - minValue || 1)) * chartHeight
    }));

    context.strokeStyle = "rgba(16, 35, 63, .1)";
    context.lineWidth = 1;
    for (let step = 0; step <= 4; step++) {
        const y = padding.top + (chartHeight * step) / 4;
        const value = maxValue - ((maxValue - minValue) * step) / 4;
        context.beginPath();
        context.moveTo(padding.left, y);
        context.lineTo(width - padding.right, y);
        context.stroke();

        context.fillStyle = "#60718a";
        context.font = "600 11px sans-serif";
        context.textAlign = "right";
        context.fillText(`${value.toFixed(metricName === "humidity" || metricName === "rain" ? 0 : 1)}`, padding.left - 8, y + 4);
    }

    context.beginPath();
    context.moveTo(padding.left, padding.top);
    context.lineTo(padding.left, height - padding.bottom);
    context.lineTo(width - padding.right, height - padding.bottom);
    context.strokeStyle = "rgba(16, 35, 63, .15)";
    context.stroke();

    const gradient = context.createLinearGradient(0, padding.top, 0, height);
    gradient.addColorStop(0, metric.fill);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.03)");
    context.beginPath();
    context.moveTo(points[0].x, height - padding.bottom);
    points.forEach(point => context.lineTo(point.x, point.y));
    context.lineTo(points.at(-1).x, height - padding.bottom);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();

    context.beginPath();
    points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.strokeStyle = metric.color;
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    points.forEach((point, index) => {
        context.beginPath();
        context.arc(point.x, point.y, 4, 0, Math.PI * 2);
        context.fillStyle = metric.color;
        context.fill();

        context.fillStyle = "#60718a";
        context.font = "600 11px sans-serif";
        context.textAlign = index === 0 ? "left" : index === points.length - 1 ? "right" : "center";
        const hourText = String(Number(times[index].split("T")[1].slice(0, 2))) + "h";
        context.fillText(hourText, point.x, height - 10);
    });

    chartMetricLabel.textContent = metric.label;
    chartPeriodLabel.textContent = metric.period;
    chartRange.textContent = metric.range(values);
}

function setActiveChartMetric(metricName) {
    activeChartMetric = metricName;
    chartTabs.forEach(button => {
        const isActive = button.dataset.metric === metricName;
        button.classList.toggle("active", isActive);
    });

    if (currentWeatherData) {
        updateHourly(currentWeatherData);
    }
}

chartTabs.forEach(button => {
    button.addEventListener("click", () => {
        setActiveChartMetric(button.dataset.metric);
    });
});

//Weekly Forecast
function updateWeek(data) {
    weekContainer.innerHTML = "";
    console.log(data.daily.weather_code);
    for (let i = 0; i < 7; i++) {
        const card = document.createElement("div");
        card.className = "day-card";

        const start = i * 24;
        const end = start + 24;

        const count = {};

        for (let j = start; j < end; j++) {
            const code = data.hourly.weather_code[j];
            count[code] = (count[code] || 0) + 1;
        }

        let code = null;
        let max = 0;

        for (const key in count) {
            if (count[key] > max) {
                max = count[key];
                code = Number(key);
            }
        }

        const weather = weatherDay[code] || ["❓", "Unknown"];
        const day = new Date(data.daily.time[i]);
        card.innerHTML = `
            <h3>
                ${day.toLocaleDateString("en-US", {
            weekday: "long"
        })}
            </h3>

            <h2>${weather[0]}</h2>

            <p>${data.daily.temperature_2m_max[i]}° / ${data.daily.temperature_2m_min[i]}°</p>
        `;
        weekContainer.appendChild(card);
    }

}

//Event
searchBtn.addEventListener("click", searchCity);
locationBtn.addEventListener("click", useCurrentLocation);
cityInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchCity();
    }
});

loadHistory();

//Default
cityInput.value = "Vĩnh Long";
searchCity();