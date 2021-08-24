import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { WeatherService } from './services/weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Weather';

  data: any[] = [];
  graphingData: object[] = null;
  view: [number, number] = [700, 300];
  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;

  timeline: boolean = true;
  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };

  axisOptions = [
    { name: 'Atmospheric Pressure', units: ' Pressure (kPa)' },
    { name: 'Relative Humidity', units: 'Relative Humidity (%)' },
    { name: 'Temperature C', units: 'Temperature (°C)' },
    { name: 'Time', units: 'Time (t)' },
    {
      name: 'Specific humidity',
      units: 'Specific Humidity (water)kg/(air)kg ',
    },
    { name: 'Water Saturation Pressure', units: 'Pressure (kPa)' },
    { name: 'Partial Pressure (Water Vapor)', units: 'Pressure (kPa)' },
    { name: 'Partial Pressure (Air)', units: 'Pressure (kPa)' },
    {
      name: 'Specific Enthalpy (Water Vapor)',
      units: 'Specific Enthalpy (kJ/kg)',
    },
    { name: 'Specific Enthalpy (air)', units: 'Specific Enthalpy (kJ/kg)' },
    { name: 'Total Specific Enthalpy', units: 'Specific Enthalpy (kJ/Kg)' },
    { name: 'Gamma', units: 'Unitless' },
    { name: 'Water Density', units: 'Density (kg/meter^3)' },
    { name: 'Air Density', units: 'Density (kg/meter^3)' },
    { name: 'Gallons', units: 'Volume (gallons)' },
  ];
  selectedXAxis = this.axisOptions[3];
  selectedYAxis = this.axisOptions[2];
  xAxisLabel: string = this.selectedXAxis.units;
  yAxisLabel: string = this.selectedYAxis.units;
  constructor(private weatherService: WeatherService) {}

  onSelect(data: any): void {}
  onActive(data: any): void {}
  onDeactive(data: any) {}
  updateGraph(form: NgForm) {
    let data = form.value;
    this.selectedXAxis = data.xValue;
    this.selectedYAxis = data.yValue;
    this.graphingData = [];
    this.graphingData.push(this.setGraphingData());
  }
  sortData(rawData) {
    return rawData
      .map((data) => {
        /*

      faulty data set values should have already been dealt with.

      data layout
      DATE
      HourlyDewPointTemperature
      HourlyDryBulbTemperature
      HourlyStationPressure
      HourlyRelativeHumidity
      */
        //converting to kPa from inHg
        let pressure: number = (+data.HourlyStationPressure * 3.38639) | NaN;
        let tempC: number = +data.HourlyDryBulbTemperature | NaN;
        //numbers get rounded down to zero
        let rHumidity: number = +data.HourlyRelativeHumidity | NaN;

        if (
          // everything excluded will be undefined
          pressure != NaN &&
          tempC != NaN &&
          rHumidity != NaN &&
          pressure != 0
        ) {
          let kTemp = tempC + 273.15;
          let pg = this.calcPg(tempC);
          //dividing by 100 since humidity should be in decimal form
          let pv = (rHumidity * pg) / 100;
          let pa = pressure - pv;
          // mv/ma = .622*(Pv/Pa)
          let sHumidity = 0.622 * (pv / pa);
          let hg = 2500.9 + 1.82 * tempC; // kJ/kg
          let ha = 1.005 * tempC; // kJ/kg
          let h = ha + sHumidity * hg; // should be hv but hg is approximately hhv at low temp. kJ/kg
          let rhoA = pa / (0.287 * kTemp); //Ra=.287
          let rhoV = pv / (0.4615 * kTemp); //Rv=.4615
          let gallons = (rhoV / 997) * 264.172;
          let date = new Date(data.DATE);
          let result = {
            kPaPressure: pressure,
            cTemperature: tempC,
            rHumidity: rHumidity,
            sHumidity: sHumidity,
            date: date,
            pg: pg,
            pv: pv,
            pa: pressure - pg,
            hg: hg,
            ha: ha,
            h: h,
            gamma: this.gammaFunction(tempC),
            rhoA: rhoA,
            rhoV: rhoV,
            gallons: gallons,
          };
          return result;
        }
      })
      .filter((item) => {
        return item != undefined;
      });
  }
  calcPg(tempC: number) {
    return 0.6112 * Math.exp(this.gammaFunction(tempC));
  }
  gammaFunction(tempC: number): number {
    let gamma = (18.68 - tempC / 234.5) * (tempC / (257.14 + tempC));
    return gamma | 0;
  }
  setGraphingData() {
    let targetData = this.data.map((item) => {
      let result = {
        name: item[this.getSelectedDataKey(this.selectedXAxis.name)],
        value: +item[this.getSelectedDataKey(this.selectedYAxis.name)],
      };
      return result;
    });
    return {
      name: this.selectedYAxis.name,
      series: targetData,
    };
  }
  getSelectedDataKey(selected: string) {
    switch (selected) {
      case this.axisOptions[0].name:
        return 'kPaPressure';
      case this.axisOptions[1].name:
        return 'rHumidity';
      case this.axisOptions[2].name:
        return 'cTemperature';
      case this.axisOptions[3].name:
        return 'date';
      case this.axisOptions[4].name:
        return 'sHumidity';
      case this.axisOptions[5].name:
        return 'pg';
      case this.axisOptions[6].name:
        return 'pv';
      case this.axisOptions[7].name:
        return 'pa';
      case this.axisOptions[8].name:
        return 'hg';
      case this.axisOptions[9].name:
        return 'ha';
      case this.axisOptions[10].name:
        return 'h';
      case this.axisOptions[11].name:
        return 'gamma';
      case this.axisOptions[12].name:
        return 'rhoV';
      case this.axisOptions[13].name:
        return 'rhoA';
      case this.axisOptions[14].name:
        return 'gallons';
    }
  }
  /**
   * used to weed out faulty data set values.
   * this method only deals with the dew point, pressure, relative humidity and temperature
   * only these are dealt with here so that the computation doesn't hold back the rendering
   * the computation is done on the after view init life cycle.
   */

  ngOnInit() {
    this.weatherService.getWeatherData().subscribe((data) => {
      this.data = data as any;
      this.data = this.sortData(this.data);
      /**
       * using directive to cor0diate graphing and api call
       * if graphing is done with no data then console error results.
       */
      this.graphingData = [];
      this.graphingData.push(this.setGraphingData());
    });
  }
}
