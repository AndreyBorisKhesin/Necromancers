import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {Http} from '@angular/http'

@Component({
  selector: 'page-vicinity',
  templateUrl: 'vicinity.html'
})
export class VicinityPage {
  lat: number;
  lng: number;
  dist_from_you: any;
  emerg_type: any
  time: any;
  maj_int: any;

  constructor(private http: Http, public navCtrl: NavController) {
    this.lat = 43.6565064;
    this.lng = -79.3806653;
}

  ionViewWillEnter() {
    this.http.post('https://109dcaa9.ngrok.io/incidents', {
      'lat': this.lat,
      'lng': this.lng
    }).toPromise().then(data => {
      this.incidents(data.json())
    }).catch(error => {
      console.error('An error occurred in HomePage', error);
      return Promise.reject(error.message || error);
    });
  }

  incidents(args: any) {
    this.dist_from_you = args['dist_from_you'].toFixed(2);
    this.emerg_type = args['emerg_type'];
    this.time = args['time'];
    this.maj_int = args['maj_int'];
  }

}
