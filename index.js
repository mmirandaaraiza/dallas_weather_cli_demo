const axios = require('axios');
const chalk = require('chalk');
const figlet = require('figlet');
const fse = require('fs-extra');
const inquirer = require('inquirer');

require('dotenv').config();

const openWeatherAPIKey = process.env.OPEN_WEATHER_KEY;
let temperatureUnit;
let weatherData;


console.log(chalk.blue.bold(figlet.textSync('Dallas Weather CLI Demo')));

if (openWeatherAPIKey === undefined) {
    console.log(chalk.bold('This CLI requires that you set an API key for OpenWeather'));
    console.log(chalk.bold('Please create a file named ".env" in the root of this project and add OPEN_WEATHER_KEY=key to it'));
    console.log(chalk.bold('You can get a key from https://openweathermap.org/'));
    return;
}

inquirer.prompt([
    {
        type: 'list',
        name: 'unit',
        message: 'Do you want the weather in Celsius or Fahrenheit?',
        choices: [
            'C',
            'F',
        ],
    },
])
    .then((answers) => {
        temperatureUnit = answers.unit;
        return axios.get(`http://api.openweathermap.org/data/2.5/weather?id=4684888&units=${temperatureUnit === 'F' ? 'imperial' : 'metric'}&appid=${openWeatherAPIKey}`)
    })
    .then((response) => {
        if (response.status === 200) {
            const {data} = response;
            const {weather = []} = data;

            let precipitation = false;

            weather.forEach((element) => {
                const {id = 0} = element;
                const weatherCode = Math.floor(id / 100);

                switch (weatherCode) {
                    case 2:
                    case 3:
                    case 5:
                    case 6:
                        precipitation = true;
                        break;
                }
            });

            weatherData = {
                temperature: data.main && data.main.temp ? data.main.temp : 'unavailable',
                unit: temperatureUnit,
                precipitation,
            };

            return fse.appendFile('weather-log.csv', `${data.main.temp},${temperatureUnit},${precipitation}\n`);
        }

        throw new Error("Api call wasn't successful");
    })
    .then(() => {
        console.log(weatherData);
        console.log('Data was written to log file');
    })
    .catch((error) => {
        console.log(error);
    });