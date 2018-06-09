import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {Http} from '@angular/http'
import { CommentsPage } from '../comments/comments';

@Component({
  selector: 'page-vicinity',
  templateUrl: 'vicinity.html'
})
export class VicinityPage {
  lat: number;
  lng: number;
  n: number;
  items: Array<{ dist_from_you: any, emerg_type: any, time: any, maj_int: any, event_id: number }>;
  dist_from_you: any;
  emerg_type: any
  time: any;
  maj_int: any;

  constructor(private http: Http, public navCtrl: NavController) {
    this.lat = 43.6565064;
    this.lng = -79.3806653;
    this.n = 5;
    this.items = [];
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

  incidents(argslist: any) {
    this.items = []
    for (let i = 0; i < this.n; i++) {
      let args = argslist[i];
      let item: { dist_from_you: any, emerg_type: any, time: any, maj_int: any, event_id: number };
      item = {
        dist_from_you: args['dist_from_you'],
        emerg_type: args['emerg_type'],
        time: args['time'],
        maj_int: args['maj_int'],
        event_id: args['id'],
      }
      this.items.push(item)
    }
  }

  see_comments(event, id) {
    this.navCtrl.push(CommentsPage, {
      id: id
    });
  }
}
