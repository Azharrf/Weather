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
const airQ = document.getElementById('aqi');
const direct = document.getElementById('direct');
const API_KEY = "716acfbbcc8f782aa94fec10f404c92f";
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const searchButton = document.querySelector('.search-button');
const sInput = document.querySelector('.search-input');
const tempBtn = document.querySelectorAll('.suhu-btn');
const celBtn = document.querySelector('.celcius');
const fahBtn = document.querySelector('.fahrenheit');
const header = document.querySelector('.header');

var suhuGlobal = "metric";
geoLoc();

function suhuBtn(suhu) {
    let units = suhu == "celcius" ? "metric" : "imperial";
        // console.log(units);
        // getWeather(units);
        suhuGlobal = units;
        // console.log("city", city);
    if(sInput.value){
        getWeatherCity();
    } else {
        geoLoc();
    }

    if(suhu == "celcius") {
        celBtn.classList.add('active');
        fahBtn.classList.remove('active');
    } else {
        fahBtn.classList.add('active');
        celBtn.classList.remove('active');
    }
}

// fungsi pertama
// geoLoc();
async function geoLoc() {
    try{
        const coba = await getPosition();
        const positions = await getWeather(coba.coords, suhuGlobal);
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
sInput.addEventListener('keyup', async function(e) {
    if(e.key == "enter" || e.keyCode === 13){
        getWeatherCity();
    }
});

searchButton.addEventListener('click', function() {
    getWeatherCity();
});

let getWeatherCity = async function(){
    try{
        const city = await getCity(sInput.value);
        // console.log("city", city);
        const positions = await getWeather(city.coord, suhuGlobal);
        showWeather(positions, city.name);
        // sInput.value = '';
    } catch(err) {
        alert(err);
    }
}

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

function getWeather(pos, units) {
    // console.log("get weather", pos);
    let {latitude, longitude, lat, lon} = pos;
    // console.log("mtr", mtr);
    // console.log("imp", imp);

    return Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude || lat}&lon=${longitude || lon}&exclude=hourly,minutely&units=${units}&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude || lat}&lon=${longitude || lon}&appid=${API_KEY}`)
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

function showWeather(data, city){
    // console.log('data', data, city);
    let result = Object.assign({}, data[0], data[1]);
    // console.log(result);
    // Object.values(result).forEach(r => showWeather(r));

    const {timezone} = result;
    const {dt, humidity, sunrise, sunset, temp, uvi, visibility} = result.current;
    const {description, icon, main} = result.current.weather[0];

    predictDaily(result.daily);
    barUv(uvi);
    wind(result.current);
    barHumidity(humidity);
    barVsblty(visibility);
    airQuality(result.list[0]);
    showCity(city, timezone);
        
    
    // Tampil Cuaca Sesua Location
    dateTime.innerHTML = `${window.moment(dt*1000).format('dddd, D MMMM')}`;
    suhu.innerHTML = `${Math.floor(temp)}<span>°C</span>`;
    sunRise.innerHTML = `${window.moment(sunrise*1000).format('hh:mm a')}`;
    sunSet.innerHTML = `${window.moment(sunset*1000).format('hh:mm a')}`;
    descrip.innerHTML = main;
    imgWeather.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    imgDesc.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    mainCloud.innerHTML = description;
}

function showCity(city, timezone){
    if(city == null){
        kota.innerHTML = timezone;
    } else {
        kota.innerHTML = city;
    }
}

function predictDaily(e){
    let predict = '';
    Object.values(e).forEach((day, idx) => {
        if(idx > 0){
            predict += weatherDaily(day);
        }
    });

    let weekWeather = document.querySelector('.week-weather');
    weekWeather.innerHTML = predict;
}

function weatherDaily(d){
    console.log(d)
    return `<div class="day-weather d-flex flex-column justify-content-center align-items-center">
                <p class="day">${window.moment(d.dt*1000).format('ddd')}</p>
                <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png" alt="">
                <p class="suhu">${Math.round(d.temp.day)}° <span>${Math.round(d.temp.night)}°</span></p>
            </div>`
}

function barUv(uvi) {
    const bar = document.querySelector('.bar');
    let start = 45;
    let angle = 15;
    let value = Math.round(uvi);

    setTimeout(() => {
        if(value >= 0){
            bar.style.transform = 'rotate(' +(start+(value*angle)) + 'deg)';
            bar.style.transition = 'all 1s ease';
            count(value, uvIndex);
        }
    }, 50);
}

function wind(r){
    const wSpeed = r.wind_speed;
    const num = r.wind_deg;
    const val = Math.floor((num / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

    let direction = arr[(val % 16)];
    direct.innerHTML = direction;
    speed.innerHTML = `${wSpeed}<span>km/h</span>`;
}

function barHumidity(h){
    const barHmdty = document.querySelector('.humidity-progress');
    const lvHmdty = document.getElementById('level-hmdty');
    let value = h;
    const span = '%';
    
    count(value, hmdty, span);

    if(value <= 25) {
        lvHmdty.innerText = 'Poor Low';
    } else if(value >= 25 && value <= 30){
        lvHmdty.innerText = 'Medium';
    } else if(value >= 30 && value <= 60){
        lvHmdty.innerText = 'Normal';
    } else if(value >= 60 && value <= 70){
        lvHmdty.innerText = 'Medium';
    } else if(value >= 70){
        lvHmdty.innerText = 'Poor High';
    }

    setTimeout(() => {
        barHmdty.style.height = `${value}%`;
    }, 10);
}

function barVsblty(v){
    const lvVsblty = document.getElementById('level-vsblty');
    let value = Math.floor(v/1000);
    const span = `km`

    // vsblty.innerHTML = `${value} <span>km</span>`;
    count(value, vsblty, span);

    if(value <= 0.04){
        lvVsblty.innerText = 'Dense Fog';
    } else if(value >= 0.04 && value <= 0.2){
        lvVsblty.innerText = 'Thick Fog';
    } else if(value >= 0.2 && value <= 1){
        lvVsblty.innerText = 'Fog';
    } else if(value >= 1 && value <= 2){
        lvVsblty.innerText = 'Mist';
    } else if(value >= 2 && value <= 4){
        lvVsblty.innerText = 'Poor Visibility';
    } else if(value >= 4 && value <= 10){
        lvVsblty.innerText = 'Moderate Visibility';
    } else if(value >= 10 && value <= 40){
        lvVsblty.innerText = 'Good Visibility';
    } else if(value >= 40){
        lvVsblty.innerText = 'Excellent Visibility';
    } 
}

function airQuality(a){
    const lvAir = document.getElementById('level-air');
    const barAir = document.querySelector('.air-progress')
    // const {aqi} = a.main;
    const {no2} = a.components;

    airQ.innerText = no2;

    if(no2 >= 0 && no2 <= 50){
        lvAir.innerText = 'Good';
    } else if(no2 >= 50 && no2 <= 100){
        lvAir.innerText = 'Fair';
    } else if(no2 >= 100 && no2 <= 200){
        lvAir.innerText = 'Moderate';
    } else if(no2 >= 200 && no2 <= 400){
        lvAir.innerText = 'Poor';
    } else if(no2 >= 400){
        lvAir.innerText = 'Very Poor';
    }

    setTimeout(() => {
        barAir.style.height = `${(no2*4)/10}%`;
    }, 10);
}

function count(val, elm, span){
    let from = 0;
    let value = val;
    let step = value > from ? 1 : -1;

    if(from == value){
        elm.innerHTML = from;
        return;
    }

    let counter = setInterval(() => {
        from += step;
        elm.innerHTML = `${from}${span ? `<span>${span}</span>` : ''}`;

        if(from == value){
            clearInterval(counter);
        }
    }, 20);
}