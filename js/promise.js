// // Weather1
// let weather = {
//     "apiKey" : "716acfbbcc8f782aa94fec10f404c92f",

//     fetchWeather: function(city) {
//         fetch("https://api.openweathermap.org/data/2.5/weather?q="+ city +"&units=metric&appid="+ this.apiKey)
//         .then((response) => response.json())
//         .then((data) => this.displayWeather(data));
//     },
//     displayWeather: function(data) {
//         const {name, visibility} = data;
//         const {icon, description, main} = data.weather[0];
//         const {humidity, temp} = data.main;
//         const {sunrise, sunset} = data.sys;
//         const {speed} = data.wind;
//         console.log(name, visibility,icon, description, main, humidity, temp, sunrise, sunset, speed);
//         document.querySelector('.kota').innerHTML = name;
//         document.getElementById('visibility').innerHTML = visibility + "<span> km</span>";
//         document.getElementById('weather-main').src = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';
//         document.querySelector('.desc').innerHTML = description;
//         document.getElementById('img-desc').src = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';
//         document.querySelector('.main').innerHTML = main;
//         document.getElementById('humidity').innerHTML = humidity + "<span> %</span>";
//         document.getElementById('suhu').innerHTML = temp + "<span>°C</span>";
//         document.querySelector('.sunrise').innerHTML = sunrise;
//         document.querySelector('.sunset').innerHTML = sunset;
//         document.getElementById('speed').innerHTML = speed + "<span> km/h</span>";
//     },
//     search: function() {
//         this.fetchWeather(document.querySelector('.search-input').value);
//     },
// };

// document.querySelector('.search-button').addEventListener('click', function() {
//     weather.search();
// });

// document.querySelector('.search-input').addEventListener('keyup', function(event) {
//     if(event.key == "enter" || event.keyCode === 13) {
//         weather.search();
//     }
// });



// Weather2

// Set Time
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
const API_KEY = "716acfbbcc8f782aa94fec10f404c92f";
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// // get Location saat load
window.addEventListener('load', async function() {
    try{
            const coba = await getPosition();
            // console.log(coba);
            const positions = await getWeather(coba);
            console.log(positions);
            // loadWeather(positions);
    } catch(err) {
            alert(err);
    }
});

const getPosition = function (options) {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

function getWeather(pos) {
    const {latitude, longitude} = pos.coords;
    // console.log(`${latitude}${longitude}`);
    return fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`)
    .then(response => {
        // console.log(response)
        if(!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();           
    })
    // .then(response => {
    //     // console.log(response);
    //     if(response.Response == 'False') {
    //         throw new Error(response.Error);
    //     }
    //     return response;
    // })
}

// Update cuaca sesuai geolocation
function loadWeather(data){
    // console.log(data);
    const {timezone} = data;
    const {dt, humidity, sunrise, sunset, temp, uvi, visibility, wind_speed} = data.current;
    const {description, icon, main} = data.current.weather[0];
    
    // Tampil Cuaca Sesua Location
    dateTime.innerHTML = time(dt);
    kota.innerHTML = timezone;
    hmdty.innerHTML = humidity;
    sunRise.innerHTML = riseSet(sunrise);
    sunSet.innerHTML = riseSet(sunset);
    suhu.innerHTML = `${temp}<span>°C</span>`;
    uvIndex.innerHTML = uvi;
    vsblty.innerHTML = visibility;
    speed.innerHTML = wind_speed;
    descrip.innerHTML = description;
    imgWeather.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    imgDesc.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    mainCloud.innerHTML = main;
}

function time(e){
    const time = new Date(e*1000);
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12Format = hour <= 12 ? + hour - 12 : hour
    const minutes = time.getMinutes();
    const ampm = hour <= 13 ? 'Am' : 'Pm';

    return `${days[day]}, <span>${hoursIn12Format < 10 ? `0` + hoursIn12Format : hoursIn12Format}:${minutes < 10 ? `0` + minutes : minutes} ${ampm}</span>`;
}

function riseSet(e) {
    const date = new Date(e * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours <= 13 ? 'Am' : 'Pm';

    return `${hours < 10 ? `0` + hours : hours}:${minutes < 10 ? `0` + minutes : minutes} ${ampm}`;
}