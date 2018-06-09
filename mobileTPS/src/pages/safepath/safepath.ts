import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {
	GoogleMaps,
	GoogleMap,
	GoogleMapsEvent,
	GoogleMapOptions,
	CameraPosition,
	MarkerOptions,
	Marker
} from '@ionic-native/google-maps';

declare var google;

@Component({
	selector: 'page-safepath',
	templateUrl: 'safepath.html'
})
export class SafepathPage {
	alat: number;
	alng: number;
	blat: number;
	blng: number;
	loc: any;
	dest: any;
	map: any;
	directionsService: any;
	directionsDisplay: any;
	destination: any;
	marker: any;
	locmarker: any;

	constructor(public navCtrl: NavController) {
		this.alat = 43.6565064;
		this.alng = -79.3806653;
		this.blat = this.alat;
		this.blng = this.alng;
    this.dest = new google.maps.LatLng(this.blat, this.blng);
		this.directionsService = new google.maps.DirectionsService();
	}

	ionViewDidLoad() {
	  this.drawMap();
  }

  drawInitialMap() {
    this.loc = new google.maps.LatLng(this.alat, this.alng);
    let mapOptions = {
      zoom: 17,
      center: new google.maps.LatLng((this.alat + this.blat) / 2, (this.alng + this.blng) / 2)
    }
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    this.locmarker = new google.maps.Marker(this.loc);

  }


  drawMap() {
    this.loc = new google.maps.LatLng(this.alat, this.alng);
		this.initialize(function(loc: any, dest: any, directionsDisplay: any, directionsService: any, map: any, callback) {
			let request = {
				origin: loc,
				destination: dest,
				travelMode: 'WALKING'
			};
			directionsService.route(request, function(result, status) {
				if (status == 'OK') {
					directionsDisplay.setDirections(result);
				}
			});
			callback(map);
		});
	}

	loadMap() {

		let mapOptions: GoogleMapOptions = {
			camera: {
				target: {
					lat: 43.0741904,
					lng: -89.3809802
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
				lng: -89.3809802
			}
		});
		// marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
		//	 alert('clicked');
		// });
	}

	initialize(callback) {
		this.directionsDisplay = new google.maps.DirectionsRenderer();
		let mapOptions = {
			zoom: 17,
			center: new google.maps.LatLng((this.alat + this.blat) / 2, (this.alng + this.blng) / 2)
		}
		this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
		this.directionsDisplay.setMap(this.map);
		callback(this.loc, this.dest, this.directionsDisplay, this.directionsService, this.map, function(map: any) {
			google.maps.event.trigger('resize', map);
		});
	}

  getDestination(keyPressed, callback) {

	  if (keyPressed.code == 'Enter') {
      console.log(this.destination);

      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': this.destination }, (results, status) => {
        this.blat = results[0].geometry.location.lat();
        this.blng = results[0].geometry.location.lng();
        this.dest = new google.maps.LatLng(this.blat, this.blng);
        this.drawMap();
        console.log("lat: " + this.blat + ", long: " + this.blng);
      });

    }
  }

}
