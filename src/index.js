import React from 'react';
import ReactDOM from 'react-dom';
var request = require('request');

class Weather extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            city: props.city,
            cityName: "--",
            type: "--",
            time: new Date().toString(),
            temp: "--",
            icon: "",
            high: "--",
            low: "--",
            feelsLike: "--",
            humidity: "--",
            windSpeed: "--",
            windDirection: "--"
        }

        this.getData = this.getData.bind(this);
        this.cityNameInput = this.cityNameInput.bind(this);

        this.cityNameRef = React.createRef();
    }

    componentDidMount() {
        // get inital data

        // set the interval
        setInterval(this.getData, 1000); // runs every 1 second
    }

    getData = () => {
        // get data from weather api
        let apiKey = '45907d22480db6848331344fca6458c2';
        let city = this.cityNameRef.current.value;
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

        request(url, function (err, response, body) {
            var weatherInfo = JSON.parse(body);

            // if city name is invalid
            // eslint-disable-next-line
            if (weatherInfo.cod == 400 || weatherInfo.cod == 404) {
                this.setState({
                    city: this.state.city,
                    cityName: "--",
                    type: "--",
                    time: new Date().toString(),
                    temp: "--",
                    icon: "",
                    high: "--",
                    low: "--",
                    feelsLike: "--",
                    humidity: "--",
                    windSpeed: "--",
                    windDirection: "--"
                });
            } else { // if city name is valid
                this.setState( {

                    // set properties
                    city: weatherInfo.name, // city
                    cityName: weatherInfo.name + ", " + weatherInfo.sys.country,
                    type: weatherInfo.weather[0].description, // weather description e.g.(rain, snow, overcast, thunderstorm)
                    time: new Date().toString(),
                    temp: weatherInfo.main.temp.toString() + "°F",
                    icon: `http://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`,
                    high: weatherInfo.main.temp_max.toString() + "°F",
                    low: weatherInfo.main.temp_min.toString() + "°F",
                    feelsLike: weatherInfo.main.feels_like.toString() + "°F",
                    humidity: weatherInfo.main.humidity.toString() + "%",
                    windSpeed: weatherInfo.wind.speed.toString() + " mph",
                    windDirection: weatherInfo.wind.deg.toString() + "°"
                } )
            }
        }.bind(this));
    }

    cityNameInput = (event) => {
        this.setState( {city: event.target.value} );
        setTimeout(this.getData, 100);
    }

    render() {
        return (
            <div>
                <h1 className="capitalize">Get the Weather in <input type="text" onChange={this.cityNameInput} id="cityName" ref={this.cityNameRef}/></h1>
                <p>City: {this.state.cityName}</p>
                <h3>Live</h3>
                <p className="capitalize">Weather Conditions: {this.state.type}</p>
                <img src={this.state.icon} alt=""/>
                <p>Temperature: {this.state.temp}</p>
                <p>Feels Like: {this.state.feelsLike}</p>
                <p>Humidity: {this.state.humidity}</p>
                <p>Wind Speed: {this.state.windSpeed}</p>
                <p>Wind Direction: {this.state.windDirection}</p>
                <h3>Today</h3>
                <p>High: {this.state.high}</p>
                <p>Low: {this.state.low}</p>
                <p className="text-muted">Server Time: {this.state.time}</p>
            </div>
        );
    }
}

// #region Start

ReactDOM.render((
    <Weather/>
), document.getElementById('root'));

// #endregion