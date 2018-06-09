import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import {VicinityPage} from "../vicinity/vicinity";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  lat: number;
  lng: number;
  dist_from_you: any;
  emerg_type: any
  time: any;
  maj_int: any;
  tip: any;

  constructor(private http: Http, public navCtrl: NavController) {
    let tip_list = ["Lock your car doors and keep valuables out of sight.", "If you are away from home for an extended time," +
    " ask someone to collect your mail and newspapers.", "Stay off your phone while driving.", "Walk home with friends after dark."];
    let randInt = this.randomInt(0, 3)
    this.tip = tip_list[randInt];
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
    this.dist_from_you = args['dist_from_you'];
    this.emerg_type = args['emerg_type'];
    this.time = args['time'];
    this.maj_int = args['maj_int']
  }

  /**
   * generate a random integer between min and max
   * @param {number} min
   * @param {number} max
   * @return {number} random generated integer
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;

  }
  goToOtherPage() {
    this.navCtrl.push(VicinityPage)
  }
}
