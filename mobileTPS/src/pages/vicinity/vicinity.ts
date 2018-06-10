import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {Http} from '@angular/http'
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
} from '@ionic-native/google-maps';
import { CommentsPage } from '../comments/comments';

declare var google;

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
  map:any;
  loc:any;
  locmarker: any;
  marker: any;

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

  ionViewDidLoad() {
    this.drawInitialMap();
  }

  drawInitialMap() {
      this.loc = new google.maps.LatLng(this.lat, this.lng);

      let mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(this.lat, this.lng)
      }
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    this.marker = this.addMarker(this.lat, this.lng);
    this.addInfoWindow(this.marker, "You Are Here")
    this.locmarker = new google.maps.Marker(this.loc);

  }

  addMarker(lat, lng) {
       let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(lat, lng)
      });
      return marker;
    }

    addInfoWindow(marker, content){
      var infowindow = new google.maps.InfoWindow({
         content: '<div >' + content + '</div>'
    });

      marker.addListener('click', function() {
        infowindow.open(this.map, marker);
      });
    }

  drawMap() {
    this.initialize()
  }



  initialize() {
    let mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(this.lat, this.lng)
    }
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
  }

  loadMap() {

    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: 43.0741904,
          lng: -79.3809802
        },
        zoom: 18,
        tilt: 30
      }
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

    this.marker = this.map.addMarkerSync({
      title: 'Ionic',
      icon: 'blue',
      animation: 'DROP',
      position: {
        lat: 43.0741904,
        lng: -79.3809802
      }
    });
    // marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
    //	 alert('clicked');
    // });
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
      let marker = this.addMarker(args['lat'], args['lng']);
      this.addInfoWindow(marker, args['emerg_type'])
    }
  }

  see_comments(event, id) {
    this.navCtrl.push(CommentsPage, {
      id: id
    });
  }
}
