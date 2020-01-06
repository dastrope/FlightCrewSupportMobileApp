import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})

export class Tab3Page {
  /**
   * This (defunct) page is responsible for handling METAR weather report retrieval and translation
   * As of November 1st 2019 this API requires a free account and valid API token for requests
   */
  stationInfo;
  rawMetar;
  deviceLat: number;
  deviceLong: number;
  ICAO = '';

  constructor(private http: HttpClient, private geolocation: Geolocation) {}

  getResponseCoords(){
    // function to request METAR report from the closest station to the device coords
    this.geolocation.getCurrentPosition().then((data) => {
      // resp.coords.latitude
      // resp.coords.longitude
      this.deviceLat = data.coords.latitude;
      this.deviceLong = data.coords.longitude;
      let httpRequest = 'https://avwx.rest/api/metar/' + this.deviceLat.toString() + ','
      + this.deviceLong.toString() + '?&options=translate%2Cinfo%2Cspeech&format=json&onfail=cache';
     this.getMetarInfo(httpRequest);
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }

  getResponseId(){
    // function to request METAR report from the airport or base identified by the ICAO code
    let httpRequest = 'https://avwx.rest/api/metar/' + this.ICAO
    + '?options=translate%2Cinfo&format=json&onfail=cache';
    this.getMetarInfo(httpRequest);
  }

  getMetarInfo(httpRequest) {
    // function to open up the JSON retrieved by the API call and translate the raw data
    this.http.get(httpRequest)
     .subscribe((response) => {
      let info = response['info'];
      let city = info['city'];
      let state = info['state'];
      let name = info['name'];
      let country = info['country'];
      let el = info['elevation'];
      let lat = info['latitude'];
      let long = info['longitude'];
      let infostring = '<b>Station Information</b><br>'
       + 'Location: ' + city + ', ' + state + ', ' + country + '<br>Name: ' + name
       + '<br>Elevation: ' + el + '<br>Latitude: ' + lat + '<br>Longitude: ' + long;
      document.getElementById('station').innerHTML = infostring;

       console.log(response);
       let time = response['time']['repr'];
       let translate = response['translate'];
       let alt = translate['altimeter'];
       let clouds = translate['clouds'];
       let other = translate['other'];
       let vis = translate['visibility'];
       let dew = translate['dewpoint'];
       let wind = translate['wind'];
       let temp = translate['temperature'];
       // calculation to determine humidity based on dew point and temperature information provided
       let humidity = (100*(Math.exp((17.625 * Number.parseFloat(dew)) /
       (243.04 + Number.parseFloat(dew))) / Math.exp((17.625 * Number.parseFloat(temp)) /
       (243.04 + Number.parseFloat(temp))))).toPrecision(4) + '%' ;
       let remarks = translate['remarks'];
       let remarkskeys = Object.keys(remarks);
       let remark = '';
       let raw = response['raw'];
       for (let key of remarkskeys) {
         remark += '<br>' + remarks[key];
       }

       // piece together the translated elements of the METAR report 
       let metarstring = '<b>Decoded METAR Report</b><br>Time Issued(Zulu): ' + time + '<br>Wind: ' + wind
       + '<br>Weather: ' + other + '<br>Clouds: ' + clouds + '<br>Visibility: '
       + vis + '<br>Temperature: ' + temp + ', dewpoint ' + dew + '<br>Humidity: '
       + humidity + '<br>QNH: ' + alt + '<br>Remarks: ' + remark;
       document.getElementById('metar').innerHTML = metarstring;

       // include the raw METAR for reference
       document.getElementById('raw').innerHTML = '<b>RAW METAR</b><br>' + raw ;
    });
  }
}
