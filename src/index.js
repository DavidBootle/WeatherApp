import React from 'react';
import ReactDOM from 'react-dom';
var request = require('request');
var zalgo = require('to-zalgo');

class Weather extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            city: undefined,
            state: undefined,
            country: undefined,
            cityName: "--",
            message: "--",
            serverTime: getServerTime(),
            temp: "--",
            icon: "",
            high: "--",
            low: "--",
            feelsLike: "--",
            humidity: "--",
            windSpeed: "--",
            windDirection: "--",
            isValid: false,
            zalgo: false
        }

        this.getData = this.getData.bind(this);
        this.getTime = this.getTime.bind(this);
        this.cityNameInput = this.cityNameInput.bind(this);

        this.cityNameRef = React.createRef();
    }

    componentDidMount() {
        // get inital data

        this.getData();

        // set the interval
        setInterval(this.getData, 3000); // runs every 2 seconds
        setInterval(this.getTime, 1000); // runs every second
    }

    getTime = () => {
        this.setState({
            serverTime: getServerTime()
        });
    }

    getData = () => {

        // get data from weather api
        let apiKey = 'f067b653c903f844ce5c3dd5e294bf5c';
        var location = parseLocation(this.cityNameRef.current.value);
        var url;
        if (location.city && location.state && location.country) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${location.city},${location.state},${location.country}&appid=${apiKey}&units=imperial`;
        } else if (location.city !== undefined && location.state !== undefined) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${location.city},${location.state}&appid=${apiKey}&units=imperial`;
        } else if (location.city && location.country) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${location.city},${location.country}&appid=${apiKey}&units=imperial`;
        } else if (location.city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${location.city}&appid=${apiKey}&units=imperial`
        } else {
            url = `https://api.openweathermap.org/data/2.5/weather?q=&appid=${apiKey}&units=imperial`
        }
        this.setState({city: location.city, state: location.state, country: location.country});

        request(url, function (err, response, body) {
            if (err) {
                console.log(err);
                this.setState({
                    city: "",
                    cityName: "",
                    message: "ERROR: " + err,
                    serverTime: "ERR",
                    temp: "ERR",
                    icon: "",
                    high: "ERR",
                    low: "ERR",
                    feelsLike: "ERR",
                    humidity: "ERR",
                    windSpeed: "ERR",
                    windDirection: "ERR",
                    isValid: true
                });
            } else {
                var weatherInfo = JSON.parse(body);

                // if city name is invalid
                // eslint-disable-next-line
                if (weatherInfo.cod == 400 || weatherInfo.cod == 404) {
                    this.setState({
                        city: this.state.city,
                        cityName: "--",
                        message: "--",
                        serverTime: getServerTime(),
                        temp: "--",
                        icon: "",
                        high: "--",
                        low: "--",
                        feelsLike: "--",
                        humidity: "--",
                        windSpeed: "--",
                        windDirection: "--",
                        isValid: false
                    });
                } else { // if city name is valid
                    this.setState( {

                        // set properties
                        city: this.state.city, // city
                        cityName: weatherInfo.name + ", " + weatherInfo.sys.country,
                        message: getWeatherMessage(weatherInfo.weather[0].id),
                        serverTime: getServerTime(),
                        temp: Math.round(weatherInfo.main.temp).toString() + "°F",
                        icon: `http://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`,
                        high: Math.round(weatherInfo.main.temp_max).toString() + "°F",
                        low: Math.round(weatherInfo.main.temp_min).toString() + "°F",
                        feelsLike: Math.round(weatherInfo.main.feels_like).toString() + "°F",
                        humidity: Math.round(weatherInfo.main.humidity).toString() + "%",
                        windSpeed: Math.round(weatherInfo.wind.speed).toString() + " mph",
                        windDirection: Math.round(weatherInfo.wind.deg) + "°",
                        isValid: true
                    } );
                    if (isNaN(weatherInfo.wind.deg) || weatherInfo.wind.deg === undefined) {
                        this.setState({
                            windDirection: "with no distinct direction."
                        });
                    } else {
                        this.setState({
                            windDirection: getWindDirection(weatherInfo.wind.deg)
                        })
                    }
                }
            }
        }.bind(this));
    }

    cityNameInput = (event) => {
        this.setState( {city: event.target.value} );
        // eslint-disable-next-line
        if (event.target.value.toLowerCase() == "zalgo") {
            this.setState({zalgo: true});
        } else {
            this.setState({zalgo: false});
        }
        setTimeout(this.getData, 500);
    }

    render() {
        // get url

        if (this.state.isValid) {
            // eslint-disable-next-line
            var cityName;
            if (this.state.state) {
                cityName = this.state.city.charAt(0).toUpperCase() + this.state.city.substring(1) + ", " + this.state.state.toUpperCase();
            } else if (this.state.country) {
                cityName = this.state.city.charAt(0).toUpperCase() + this.state.city.substring(1) + ", " + this.state.coutnry.toUpperCase();
            } else {
                cityName =this.state.cityName;
            }

            return (
                <div>
                    <div className="container pb-4 mt-4 title-box">
                        <h1 className="display-4 col-xl-12">Get the Weather in <br/><input type="text" onChange={this.cityNameInput} ref={this.cityNameRef} className='city-input'/></h1>
                    </div>
                    <div className="container centered">
                        <img src={this.state.icon} width="100" height="100" alt=""/>
                        <h2 style={{display: "inline"}}>In {this.state.cityName}, {this.state.message}</h2>
                    </div>
                    <div className="container">
                        <div className="row">
                            <div className="card col-md-4">
                                <div className="card-body">
                                    <h5 className="card-title">Temperature</h5>
                                    <p className="card-text">Right now in {cityName} it's <strong>{this.state.temp}</strong>, with a high of {this.state.high} and a low of {this.state.low}. Outside, it feels like {this.state.feelsLike}.&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</p>
                                </div>
                            </div>
                            <div className="card col-md-4">
                                <div className="card-body">
                                        <h5 className="card-title">Wind</h5>
                                        <p className="card-text">The wind is currently blowing to the {this.state.windDirection} at {this.state.windSpeed}.</p>
                                </div>
                            </div>
                            <div className="card col-md-4">
                                <div className="card-body">
                                    <h5 className="card-title">Humidity<strong>&nbsp;</strong></h5>
                                    <p className="card-text">&nbsp;The humidity is currently <strong>{this.state.humidity}.&nbsp;</strong>&nbsp;</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container small text-muted centered mt-2">
                        {this.state.serverTime}
                    </div>
                </div>
            );
        } else {
            // eslint-disable-next-line
            if (this.state.zalgo == true) {
                return (
                    <div>
                        <div className="container pb-4 mt-4 title-box">
                            <h1 className="display-4 col-xl-12">{zalgo('Get the Weather in')} <br/><input type="text" onChange={this.cityNameInput} ref={this.cityNameRef} className='city-input' value={this.state.city} autoFocus/></h1>
                        </div>
                        <div className="container small text-muted centered">
                            {zalgo(this.state.serverTime)}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div>
                        <div className="container pb-4 mt-4 title-box">
                            <h1 className="display-4 col-xl-12">Get the Weather in <br/><input type="text" onChange={this.cityNameInput} ref={this.cityNameRef} className='city-input' value={this.state.city} autoFocus/></h1>
                        </div>
                        <div className="container small text-muted centered">
                            {this.state.serverTime}
                        </div>
                    </div>
                );
            }
            
        }
            
    }
}

function getWeatherMessage(weatherCode) {
    // eslint-disable-next-line
    switch (weatherCode) {
        case 200: return "it's storming. Expect light rain and lightning.";
        case 201: return "it's storming. Expect rain and lightning";
        case 202: return "it's storming. Expect heavy rain and lightning.";
        case 210: return "it's storming. Expect light storms.";
        case 211: return "it's storming.";
        case 212: return "it's storming. Expect heavy storms.";
        case 221: return "it's storming. Expect scattered storms.";
        case 230: return "it's storming. Expect a light drizzle.";
        case 231: return "it's storming. Expect a medium drizzle.";
        case 232: return "it's storming. Expect a heavy drizzle.";

        case 300: return "it's drizzling. Expect a light drizzle.";
        case 301: return "it's drizzling.";
        case 302: return "it's drizzling. Expect a heavy drizzle.";
        case 310: return "it's drizzling. Expect a light drizzle mixed with rain.";
        case 311: return "it's drizzling. Expect a medium drizzle mixed with rain.";
        case 312: return "it's drizzling. Expect a heavy drizzle mixed with rain.";
        case 313: return "it's drizzling. Expect drizzling mixed with scattered showers.";
        case 314: return "it's drizzling. Expect drizzling mixed with scattered heavy showers.";
        case 321: return "the weather service says \"shower drizzle\". So whatever that is, I guess.";
        
        case 500: return "it's raining. Expect light rain.";
        case 501: return "it's raining. Expect moderate rain.";
        case 502: return "it's raining. Expect heavy rain.";
        case 503: return "it's raining. Expect very heavy rain.";
        case 504: return "it's raining. Expect extreme rain.";
        case 511: return "it's raining. Expect freezing rain.";
        case 520: return "it's raining. Expect light showers.";
        case 521: return "it's raining. Expect showers.";
        case 522: return "it's raining. Expect heavy showers.";
        case 531: return "it's raining. Expect scattered showers.";

        case 600: return "it's snowing. Expect light snow.";
        case 601: return "it's snowing."
        case 602: return "it's snowing. Expect heavy snow.";
        case 611: return "it's sleeting.";
        case 612: return "it's sleeting. Expect light sleet showers.";
        case 613: return "it's sleeting. Expect sleet showers.";
        case 615: return "it's snowing. Expect mixed light rain and snow.";
        case 616: return "it's snowing. Expect mixed rain and snow.";
        case 620: return "it's snowing. Expect light snow showers.";
        case 621: return "it's snowing. Expect snow showers.";
        case 622: return "it's snowing. Expect heavy snow showers.";

        case 701: return "it's misty.";
        case 711: return "it's smoky.";
        case 721: return "it's hazy.";
        case 731: return "there are dust devils.";
        case 741: return "it's foggy.";
        case 751: return "it's sandy.";
        case 761: return "it's dusty.";
        case 762: return "there is volcanic ash.";
        case 771: return "there are squalls.";
        case 781: return "there are tornados.";

        case 800: return "there are clear skies.";

        case 801: return "there are a few clouds.";
        case 802: return "there are scattered clouds.";
        case 803: return "it's cloudy.";
        case 804: return "it's overcast.";
    }
}

function getDay(dayNumber) {
    // eslint-disable-next-line
    switch (dayNumber) {
        case 0: return "Sunday";
        case 1: return "Monday";
        case 2: return "Tuesday";
        case 3: return "Wednesday";
        case 4: return "Thursday";
        case 5: return "Friday";
        case 6: return "Saturday";
    }
}

function getMonth(month) {
    // eslint-disable-next-line
    switch (month) {
        case 0: return "January";
        case 1: return "February";
        case 2: return "March";
        case 3: return "April";
        case 4: return "May";
        case 5: return "June";
        case 6: return "July";
        case 7: return "August";
        case 8: return "September";
        case 9: return "October";
        case 10: return "November";
        case 11: return "December";
    }
}

function getServerTime() {
    var serverTime = new Date();
    var timeInfo = {};
    timeInfo.day = getDay(serverTime.getDay());
    timeInfo.date = serverTime.getDate();
    timeInfo.year = serverTime.getFullYear();
    if (serverTime.getHours() < 12) {
        timeInfo.hour = serverTime.getHours().toString().padStart(2, "0");
        timeInfo.timeOfDay = "AM";
    } else {
        timeInfo.hour = (serverTime.getHours() - 12).toString().padStart(2, "0");
        timeInfo.timeOfDay = "PM";
    }
    timeInfo.minute = serverTime.getMinutes().toString().padStart(2, "0");
    timeInfo.second = serverTime.getSeconds().toString().padStart(2, "0");
    timeInfo.month = getMonth(serverTime.getMonth());

    return `${timeInfo.day}, ${timeInfo.month} ${timeInfo.date} ${timeInfo.year}, ${timeInfo.hour}:${timeInfo.minute}:${timeInfo.second} ${timeInfo.timeOfDay}`;
}

function getWindDirection(deg) {
    if (deg >= 0 && deg < 22.5) { return "north" } // if between 0 and 22.5 return north
    if (deg >= 22.5 && deg < 67.5) { return "northeast" } // if between 22.5 and 67.5 return northwest
    if (deg >= 67.5 && deg < 112.5) { return "east" } // if between 67.5 and 112.5 return east
    if (deg >= 112.5 && deg < 157.5) { return "southeast" } // if between 112.5 and 157.5 return southeast
    if (deg >= 157.5 && deg < 202.5) { return "south" } // if between 157.5 and 202.5 return south
    if (deg >= 202.5 && deg < 247.5) { return "southwest" } // if between 202.5 and 247.5 return southwest
    if (deg >= 247.5 && deg < 292.5) { return "west" } // if between 247.5 and 292.5 return west
    if (deg >= 292.5 && deg < 337.5) { return "northwest" } // if between 292.5 and 337.5 return northwest
    if (deg >= 337.5 && deg <= 360) { return "north" } // if between 337.5 and 360 return north
}

function parseLocation(locationString) {
    var locationInfo = locationString.split(',')
    // eslint-disable-next-line
    locationInfo = locationInfo.filter(function(value, index, array) { return value != "" }); // removes blank space objects
    var locationInfoTemp = [];
    locationInfo.forEach(function(value, index, array) {
        // remove space from front
        // eslint-disable-next-line
        while (value[0] == " ") {
            value = value.substring(1);
        }
        // remove spaces from rear
        // eslint-disable-next-line
        while (value[value.length - 1] == " ") {
            value = value.substring(0, value.length - 1);
        }
        locationInfoTemp.push(value);
    });
    locationInfo = locationInfoTemp;


    // no search params
    // eslint-disable-next-line
    if (locationInfo.length == 0) {
        return {
            city: undefined,
            state: undefined,
            country: undefined
        };
    } // no search parameters
    // only city
    // eslint-disable-next-line
    if (locationInfo.length == 1) {
        return {
            city: locationInfo[0].toLowerCase(),
            state: undefined,
            country: undefined
        };
    }
    // if it has country or state, determine which one, and format them correctly
    // eslint-disable-next-line
    if (locationInfo.length == 2 || locationInfo.length == 3) {
        // check if it's a state
        var locations = require('./locations');
        var isState = false;
        // eslint-disable-next-line
        var state = undefined;
        var isCountry = false;
        // eslint-disable-next-line
        var country = undefined;

        locations.stateList.forEach(function (value, index, array) {
            // eslint-disable-next-line
            if (value.name == locationInfo[1].toLowerCase() || value.abbreviation == locationInfo[1].toUpperCase()) {
                isState = true;
                state = value.abbreviation.toUpperCase();
            }
        });
        locations.countryList.forEach(function (value, index, array) {
            // eslint-disable-next-line
            if (value.name == locationInfo[1].toLowerCase() || value.code == locationInfo[1].toUpperCase()) {
                isCountry = true;
                country = value.code.toUpperCase();
            }
        });
        // eslint-disable-next-line
        if (locationInfo.length == 3) {
            locations.countryList.forEach(function (value, index, array) {
                // eslint-disable-next-line
                if (value.name == locationInfo[1].toLowerCase() || value.code == locationInfo[2].toUpperCase()) {
                    isCountry = true;
                    country = value.code.toUpperCase();
                }
            });
        }
        // eslint-disable-next-line
        if (isState && isCountry && locationInfo.length == 3) {
            return {
                city: locationInfo[0].toLowerCase(),
                state: locationInfo[1].toLowerCase(),
                country: locationInfo[2].toLowerCase()
            }
        } else if (isState) {
            return {
                city: locationInfo[0].toLowerCase(),
                state: locationInfo[1].toLowerCase(),
                country: 'usa'
            }
        } else if (isCountry) {
            return {
                city: locationInfo[0].toLowerCase(),
                state: undefined,
                country: locationInfo[1].toLowerCase()
            }
        } else {
            return {
                city: locationInfo[0].toLowerCase(),
                state: undefined,
                country: undefined
            }
        }
    }
    else {
        return {
            city: undefined,
            state: undefined,
            country: undefined
        }
    }
}

// #region Start

ReactDOM.render((
    <Weather/>
), document.getElementById('root'));

// #endregion
