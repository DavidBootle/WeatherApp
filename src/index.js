import React from 'react';
import ReactDOM from 'react-dom';

var request = require('request');

// weather info storage
class WeatherInfo extends React.Component {
    constructor(props) {
        super(props);

        const defaultState = {
            city: '',
            weatherType: '',
            description: '',
            iconUrl: 'yeet',
            currentTemp: '',
            feelsLikeTemp: '',
            tempMin: '',
            tempMax: '',
            humidity: '',
            windSpeed: '',
            windDeg: '',
            infoTime: '',
            creationTime: ''
        }

        if (props.weatherinfo !== undefined && this.state != defaultState) {
            this.setState(props.weatherinfo);
        } else if (props.weatherinfo !== undefined) {
            this.state = props.weatherinfo;
        } else {
            this.state = defaultState;
        }

    }

    render() {
        const page = (
            <div>
                <h1>Current Weather Conditions In <b>{this.state.city}</b>:</h1>
                <img src={this.state.iconUrl} alt="weather-icon"/>
                <div className="inline">
                    <h2 className="inline capitalize">{this.state.description}</h2>
                </div>
                <p>Current Temperature: {this.state.currentTemp}°F</p>
                <p>Feels Like: {this.state.feelsLikeTemp}°F</p>
                <p>Max: {this.state.tempMax}°F<br/>Min: {this.state.tempMin}°F</p>
                <p>Humidity: {this.state.humidity}%</p>
                <p>Wind Speed: {this.state.windSpeed} mph<br/>Wind Direction: {this.state.windDeg}°</p>
                <p>Time Updated: {this.state.creationTime}</p>
                
            </div>
        );
        return page;
    }
}

class CityNameForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            city: ''
        }

        this.handleSubmitEvent = this.handleSubmitEvent.bind(this);
    }

    handleSubmitEvent = (event) => {
        event.preventDefault();
        let apiKey = '45907d22480db6848331344fca6458c2';
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${this.state.city}&appid=${apiKey}&units=imperial`;

        request(url, function (err, response, body) {
            changeCity(JSON.parse(body));
        });
    }

    handleCityChangeEvent = (event) => {
        this.setState({city: event.target.value});
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmitEvent}>
                    <label for="cityNameInput">City Name: </label>
                    <input
                        type="text"
                        name="city"
                        value={this.state.city}
                        onChange={this.handleCityChangeEvent}
                    />
                    <input type="submit"></input>
                </form>
            </div>
        );
    }
}

// get weather info
function getWeather(city) {
    let apiKey = '45907d22480db6848331344fca6458c2';
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

    request(url, function (err, response, body) {
        return JSON.parse(body);
    });
}

function formatDate(milliseconds) {
    var date = new Date(milliseconds);
    return date.getHours().toString() + ":" + date.getMinutes().toString() + ":" + date.getMilliseconds().toString();
}

function changeCity(weatherInfo) {
    var weather = {
        city: weatherInfo.name,
        weatherType: weatherInfo.weather[0].main,
        description: weatherInfo.weather[0].description,
        iconUrl: `http://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`,
        currentTemp: Math.round(weatherInfo.main.temp),
        feelsLikeTemp: Math.round(weatherInfo.main.feels_like),
        tempMin: Math.round(weatherInfo.main.temp_min),
        tempMax: Math.round(weatherInfo.main.temp_max),
        humidity: Math.round(weatherInfo.main.humidity),
        windSpeed: Math.round(weatherInfo.wind.speed),
        windDeg: weatherInfo.wind.deg,
        infoTime: formatDate(weatherInfo.dt),
        creationTime: new Date().toString()
    }
    var renderCompile = (
        <div>
            <CityNameForm/>
            <WeatherInfo weatherinfo={weather}/>
        </div>
    );
    ReactDOM.render(renderCompile, document.getElementById('root'));
}

ReactDOM.render(<CityNameForm/>, document.getElementById("root"));