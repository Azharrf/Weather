const dateTime = document.getElementById('date-time');
const imgWeather = document.getElementById('weather-main');
const suhu = document.getElementById('suhu');
const imgDesc = document.getElementById('img-desc');
const descrip = document.querySelector('.desc');
const mainCloud = document.querySelector('.main');
const kota = document.querySelector('.kota');
const uvIndex = document.getElementById('uv-index');
const speed = document.getElementById('speed');
const sunRise = document.getElementById('sunrise');
const sunSet = document.getElementById('sunset');
const hmdty = document.getElementById('humidity');
const vsblty = document.getElementById('visibility');
const aqi = document.getElementById('aqi');
const API_KEY = "716acfbbcc8f782aa94fec10f404c92f";
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const sButton = document.querySelector('.search-button');
const sInput = document.querySelector('.search-input');

// fungsi pertama
geoLoc();
async function geoLoc() {
    try{
        const coba = await getPosition();
        const positions = await getWeather(coba.coords);
        showWeather(positions);
    } catch(err) {
        alert(err);
    }
};

function getPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// fungsi kedua
sButton.addEventListener('click', async function() {
    try{
        const city = await getCity(sInput.value);
        console.log("city", city);
        const positions = await getWeather(city.coord);
        showWeather(positions);

    } catch(err) {
        alert(err);
    }
});

function getCity(city){
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
    .then(response => {
        if(!response.ok) {
            throw new Error(response.statusText)
        }
        return response.json();
    })
    .then(response => {
        if(response.Response === 'False') {
            throw new Error(response.Error)
        }
        return response;
    })
}


function getWeather(pos) {
    console.log("get weather", pos)
    let {latitude, longitude, lat, lon} = pos;

    return Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude || lat}&lon=${longitude || lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`),
        fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude || lat}&lon=${longitude || lon}&appid=${API_KEY}`)
    ])
    .then(function (response) {
        return Promise.all(response.map(function (response){
            if(!response.ok){
                throw new Error(response.statusText)
            }
            return response.json();
        }))
    })
    .then(function (response) {
        return Promise.all(response.map(function (response){
            if(response.Response === 'False'){
                throw new Error(response.Error)
            }
            return response;
        }))
    }) 
}

function showWeather(data){
    // console.log(data);
    let result = Object.assign({}, data[0], data[1]);
    // console.log(result);
    // Object.values(result).forEach(r => showWeather(r));
    predictDaily(result.daily);

    const {co} = result.list[0].components;
    const {timezone} = result;
    const {dt, humidity, sunrise, sunset, temp, uvi, visibility, wind_speed} = result.current;
    const {description, icon, main} = result.current.weather[0];
    
    // Tampil Cuaca Sesua Location
    dateTime.innerHTML = `${window.moment(dt*1000).format('dddd, DD MMM')}`;
    kota.innerHTML = timezone;
    hmdty.innerHTML = humidity;
    sunRise.innerHTML = `${window.moment(sunrise*1000).format('hh:mm a')}`;
    sunSet.innerHTML = `${window.moment(sunset*1000).format('hh:mm a')}`;
    suhu.innerHTML = `${temp}<span>°C</span>`;
    uvIndex.innerHTML = uvi;
    vsblty.innerHTML = visibility;
    speed.innerHTML = wind_speed;
    descrip.innerHTML = description;
    imgWeather.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    imgDesc.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    mainCloud.innerHTML = main;
    aqi.innerHTML = co;
}

function predictDaily(e){
    let predict = '';
    Object.values(e).forEach(d => predict += weatherDaily(d));
    let weekWeather = document.querySelector('.week-weather');
    weekWeather.innerHTML = predict;
}

function weatherDaily(d){
    return `<div class="day-weather d-flex flex-column justify-content-center align-items-center">
                <p class="day">${window.moment(d.dt*1000).format('ddd DD')}</p>
                <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png" alt="">
                <p>${d.temp.day}°</p>
            </div>`
}