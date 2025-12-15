
// Weather Module
// Exports: fetchWeather, showWeatherModal

let weatherData = null;
let forecastData = null;

export async function fetchWeather() {
    const weatherBtnText = document.getElementById('weatherBtnText');

    try {
        if (!navigator.geolocation) {
            if (weatherBtnText) weatherBtnText.textContent = 'Clima (Indisponível)';
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // Public demo key

            const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`;

            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(currentUrl),
                fetch(forecastUrl)
            ]);

            const currentData = await currentResponse.json();
            const hourlyData = await forecastResponse.json();

            if (currentData.main && currentData.weather) {
                weatherData = currentData;
                forecastData = hourlyData;

                const temp = Math.round(currentData.main.temp);
                const icon = currentData.weather[0].icon;

                let totalRain = 0;
                if (hourlyData.list) {
                    for (let i = 0; i < Math.min(8, hourlyData.list.length); i++) {
                        if (hourlyData.list[i].rain && hourlyData.list[i].rain['3h']) {
                            totalRain += hourlyData.list[i].rain['3h'];
                        }
                    }
                }

                if (weatherBtnText) {
                    const iconImg = `<img src="https://openweathermap.org/img/wn/${icon}.png" style="width:24px; height:24px; vertical-align:middle; margin-right:4px;">`;
                    const rainInfo = totalRain > 0 ? `🌧️ ${totalRain.toFixed(1)}mm` : '☀️ Sem chuva';
                    weatherBtnText.innerHTML = `${iconImg}${temp}°C | ${rainInfo}`;
                }
            }
        }, (error) => {
            if (weatherBtnText) weatherBtnText.textContent = 'Clima (Localização negada)';
        });
    } catch (error) {
        if (weatherBtnText) weatherBtnText.textContent = 'Clima (Erro)';
        console.error('Weather error:', error);
    }
}

export function showWeatherModal() {
    if (!weatherData) {
        alert('Dados do clima ainda não foram carregados. Aguarde um momento.');
        return;
    }

    const data = weatherData;

    document.getElementById('weatherModalTemp').innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" style="width:80px; vertical-align:middle;"> ${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherModalDesc').textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    document.getElementById('weatherModalLocation').textContent = `${data.name}, ${data.sys.country}`;

    document.getElementById('weatherHumidity').textContent = `${data.main.humidity}%`;
    document.getElementById('weatherFeelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('weatherWind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('weatherPressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('weatherVisibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('weatherClouds').textContent = `${data.clouds.all}%`;

    const currentRain = data.rain ? (data.rain['1h'] || 0) : 0;
    document.getElementById('weatherRainNow').textContent = `${currentRain.toFixed(1)} mm/h`;

    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById('weatherSunrise').textContent = sunrise.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('weatherSunset').textContent = sunset.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    renderRainfallChart();
    document.getElementById('weatherModal').classList.add('visible');
}

function renderRainfallChart() {
    const container = document.getElementById('rainfallChart');
    if (!forecastData || !forecastData.list) {
        container.innerHTML = '<p style="text-align:center; color:#999;">Dados de previsão não disponíveis</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
    const entries = forecastData.list.slice(0, 8);

    entries.forEach(entry => {
        const time = new Date(entry.dt * 1000);
        const timeStr = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const rain = entry.rain ? (entry.rain['3h'] || 0) : 0;
        const maxRain = 10;
        const barWidth = Math.min((rain / maxRain) * 100, 100);

        html += `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="min-width: 50px; font-size: 0.85rem; color: #666;">${timeStr}</div>
                <div style="flex: 1; background: #e0e0e0; height: 24px; border-radius: 4px; position: relative; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #42A5F5, #1976D2); height: 100%; width: ${barWidth}%; transition: width 0.3s;"></div>
                    <div style="position: absolute; top: 50%; left: 8px; transform: translateY(-50%); font-size: 0.75rem; font-weight: bold; color: ${barWidth > 30 ? 'white' : '#333'};">
                        ${rain.toFixed(1)} mm
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}
