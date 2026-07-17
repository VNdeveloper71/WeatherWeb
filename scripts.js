//Weather Web
//Support: ChatGPT

//Lấy phần tử HTML
const loadingScreen = document.getElementById("loading-screen");

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const historyList = document.getElementById("history-list");
const lastUpdated = document.getElementById("last-updated");

const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weather-condition");
const cityName = document.getElementById("city-name");

const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const uvIndex = document.getElementById("uv-index");
const uvLevel = document.getElementById("uv-level");

const aqi = document.getElementById("aqi");
const aqiLevel = document.getElementById("aqi-level");
const pressure = document.getElementById("pressure");
const moonPhaseIcon = document.getElementById("moon-phase-icon");
const moonPhaseName = document.getElementById("moon-phase-name");

const hourlyContainer = document.getElementById("hourly-container");
const weekContainer = document.getElementById("week-container");

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
        alert("Please enter a city.");
        return;
    }

    showLoading();

    try {
        const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
        const geoResponse = await fetch(geoURL);
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found.");
            return;
        }

        const place = geoData.results[0];
        cityName.textContent = place.name;
        saveHistory(place.name);
        await getWeather(place.latitude, place.longitude);
        await getAQI(place.latitude, place.longitude);
    }

    catch (error) {
        hideLoading();
        console.error(error);
        alert(error.message);
    }
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
    // Nếu đã có thì xóa trước
    history = history.filter(item => item !== city);
    // Thêm lên đầu
    history.unshift(city);
    // Chỉ giữ 10 thành phố
    history = history.slice(0, 10);
    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );
    loadHistory();
}

//Get Weather
async function getWeather(lat, lon) {
    const weatherURL =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,pressure_msl&hourly=temperature_2m,weather_code&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

    const response = await fetch(weatherURL);

    const data = await response.json();

    console.log(data);

    updateCurrent(data);
    updateHourly(data);
    updateWeek(data);

    hideLoading();
}

async function getAQI(lat, lon){
    const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

    const response = await fetch(url);
    const data = await response.json();

    updateAQI(data);
}

//Current Weather
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

    weatherIcon.textContent = weather[code][0];

    weatherCondition.textContent = weather[code][1];

    temperature.textContent = current.temperature_2m + "°C";

    feelsLike.textContent = current.apparent_temperature + "°C";

    humidity.textContent = current.relative_humidity_2m + "%";

    windSpeed.textContent = current.wind_speed_10m + " km/h";

    sunrise.textContent = data.daily.sunrise[0].split("T")[1];

    sunset.textContent = data.daily.sunset[0].split("T")[1];

    pressure.textContent = Math.round(data.current.pressure_msl) + " hPa";

    const now = new Date();
    lastUpdated.textContent = `🕒 Last updated: ${now.toLocaleDateString([], {
        hour: "2-digit",
        minute: "2-digit"
    })}`;

    const uv = data.daily.uv_index_max[0];

    uvIndex.textContent = uv;

    if (uv <= 2) {
        uvLevel.textContent = "Low";
        uvIndex.style.color = "#22c55e";
        uvLevel.style.color = "#22c55e";
    }
    else if (uv <= 5) {
        uvLevel.textContent = "Moderate";
        uvIndex.style.color = "#eab308";
        uvLevel.style.color = "#eab308";
    }
    else if (uv <= 7) {
        uvLevel.textContent = "High";
        uvIndex.style.color = "#f97316";
        uvLevel.style.color = "#f97316";
    }
    else if (uv <= 10) {
        uvLevel.textContent = "Very High";
        uvIndex.style.color = "#ef4444";
        uvLevel.style.color = "#ef4444";
    }
    else {
        uvLevel.textContent = "Extreme";
        uvIndex.style.color = "#9333ea";
        uvLevel.style.color = "#9333ea";
    }

    updateMoonPhase();
}

//AQI-index
function updateAQI(data){

    const value = data.current.us_aqi;

    aqi.textContent = value;

    if(value<=50){
        aqiLevel.textContent="Good";
        aqi.style.color="#22c55e";
        aqiLevel.style.color="#22c55e";
    }
    else if(value<=100){
        aqiLevel.textContent="Moderate";
        aqi.style.color="#eab308";
        aqiLevel.style.color="#eab308";
    }
    else if(value<=150){
        aqiLevel.textContent="Unhealthy";
        aqi.style.color="#f97316";
        aqiLevel.style.color="#f97316";
    }
    else if(value<=200){
        aqiLevel.textContent="Very Unhealthy";
        aqi.style.color="#ef4444";
        aqiLevel.style.color="#ef4444";
    }
    else{
        aqiLevel.textContent="Hazardous";
        aqi.style.color="#9333ea";
        aqiLevel.style.color="#9333ea";
    }

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
function updateHourly(data) {
    hourlyContainer.innerHTML = "";

    const currentTime = data.current.time;
    const hour = parseInt(currentTime.split("T")[1].split(":")[0]);

    for (let i = hour; i < hour + 12; i++) {
        const index = i % 24;
        const card = document.createElement("div");
        card.className = "hour-card";

        const code = data.hourly.weather_code[index];
        const day = isDay(
            data.hourly.time[index],
            data.daily.sunrise[0],
            data.daily.sunset[0]
        );

        const weather = day ? (weatherDay[code] || ["❓", "Unknown"]) : (weatherNight[code] || ["❓", "Unknown"]);

        card.innerHTML = `
            <p>${data.hourly.time[index].split("T")[1]}</p>
            <h3>${weather[0]}</h3>
            <p>${data.hourly.temperature_2m[index]}°C</p>
        `;
        hourlyContainer.appendChild(card);
    }

}

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
cityInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchCity();
    }
});

loadHistory();

//Default
cityInput.value = "Vĩnh Long";
searchCity();