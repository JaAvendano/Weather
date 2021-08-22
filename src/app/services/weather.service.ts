import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private weatherUrl =
    'https://www.ncei.noaa.gov/access/services/data/v1?' +
    'dataset=local-climatological-data&' +
    '&units=metric&' +
    'dataTypes=' +
    'HourlyStationPressure,' +
    'HourlyDryBulbTemperature,' +
    'HourlyRelativeHumidity,' +
    'HourlyDewPointTemperature&' +
    'stations=72278023183&' +
    'startDate=2015-01-01&' +
    'endDate=2015-12-31&' +
    'includeAttributes=true&' +
    'format=json';
  constructor(private client: HttpClient) {}

  getDatedWeatherData(startDate: string, endDate: string) {
    let url =
      'https://www.ncei.noaa.gov/access/services/data/v1?' +
      'dataset=local-climatological-data&' +
      '&units=metric&' +
      'dataTypes=' +
      'HourlyStationPressure,' +
      'HourlyDryBulbTemperature,' +
      'HourlyRelativeHumidity,' +
      'HourlyDewPointTemperature&' +
      'stations=72278023183&' +
      'startDate=' +
      startDate +
      '&' +
      'endDate=' +
      endDate +
      '&' +
      'includeAttributes=true&' +
      'format=json';
    return this.client.get(url);
  }
  getWeatherData() {
    return this.client.get(this.weatherUrl);
  }
}
