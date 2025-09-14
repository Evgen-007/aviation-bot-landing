const ICAO_DB = {
  'Москва': 'UUEE',
  'Санкт-Петербург': 'ULLI',
  'Казань': 'UWKD',
  'Новосибирск': 'UNNT'
};

function setTodayDate() {
  const dateInput = document.getElementById('date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
}

async function fetchWeather(city) {
  try {
    const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`);
    const geoData = await geoResp.json();
    if (!geoData.results || geoData.results.length === 0) {
      return null;
    }
    const { latitude, longitude } = geoData.results[0];
    const weatherResp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    const weatherData = await weatherResp.json();
    return {
      icao: ICAO_DB[city] || 'N/A',
      weather: weatherData.current_weather
    };
  } catch (e) {
    return null;
  }
}

async function handleCityInput(inputId, infoId) {
  const city = document.getElementById(inputId).value.trim();
  if (!city) {
    document.getElementById(infoId).textContent = '';
    return;
  }
  const data = await fetchWeather(city);
  const infoEl = document.getElementById(infoId);
  if (data && data.weather) {
    infoEl.textContent = `ICAO: ${data.icao}, Температура: ${data.weather.temperature}°C, Ветер: ${data.weather.windspeed} м/с`;
  } else {
    infoEl.textContent = 'Данные не найдены';
  }
}

function initCityHandlers() {
  document.getElementById('depCity').addEventListener('change', () => handleCityInput('depCity', 'depInfo'));
  document.getElementById('arrCity').addEventListener('change', () => handleCityInput('arrCity', 'arrInfo'));
  document.getElementById('altCity1').addEventListener('change', () => handleCityInput('altCity1', 'altInfo1'));
  document.getElementById('altCity2').addEventListener('change', () => handleCityInput('altCity2', 'altInfo2'));
}

function generateTemplate() {
  const date = document.getElementById('date').value;
  const docNumber = document.getElementById('docNumber').value;
  const unit = document.getElementById('unit').value;
  const metRank = document.getElementById('metRank').value;
  const metName = document.getElementById('metName').value;
  const cmdRank = document.getElementById('cmdRank').value;
  const cmdName = document.getElementById('cmdName').value;
  const atcRank = document.getElementById('atcRank').value;
  const atcName = document.getElementById('atcName').value;
  const dep = document.getElementById('depInfo').textContent;
  const arr = document.getElementById('arrInfo').textContent;
  const alt1 = document.getElementById('altInfo1').textContent;
  const alt2 = document.getElementById('altInfo2').textContent;

  const text = `Дата: ${date}\nНомер бланка: ${docNumber}\nВ/ч: ${unit}\nДежурный синоптик: ${metRank} ${metName}\nКомандир экипажа: ${cmdRank} ${cmdName}\nРуководитель полётов: ${atcRank} ${atcName}\nАэродром взлёта: ${dep}\nАэродром посадки: ${arr}\nЗапасные аэродромы:\n  1. ${alt1}\n  2. ${alt2}`;

  document.getElementById('template').textContent = text;
  document.getElementById('output').style.display = 'block';
}

function initGenerate() {
  document.getElementById('generate').addEventListener('click', generateTemplate);
}

document.addEventListener('DOMContentLoaded', () => {
  setTodayDate();
  initCityHandlers();
  initGenerate();
});
