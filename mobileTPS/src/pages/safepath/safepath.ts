import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {Http} from '@angular/http';
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
  waypts: any;

	points: number[] = [	43.6598611, -79.3785907, // bed bath & beyond
				43.6613693, -79.3832247,
				43.6565006, -79.3772478,
				43.6573143, -79.3875618,
				43.6644121, -79.3924746,
				43.6651592, -79.3789572,
				43.6576616, -79.3790312];

	constructor(private http: Http, public navCtrl: NavController) {
		this.alat = 43.6565064;
		this.alng = -79.3806653;
		this.dest = new google.maps.LatLng(this.blat, this.blng);
		this.directionsService = new google.maps.DirectionsService();
		this.waypts = [
      {
        location: new google.maps.LatLng(43.6565064, -79.3806653),
        stopover: true
      },
      {
        location: new google.maps.LatLng(43.657312, -79.3844062),
        stopover: true
      },
      {
        location: new google.maps.LatLng(43.6643174, -79.3871233),
        stopover: true
      },
      {
        location: new google.maps.LatLng(43.6649499, -79.3845334),
        stopover: true
      }
    ];
	}

	ionViewWillEnter() {
		this.http.post('https://109dcaa9.ngrok.io/incidents', {
			'lat': this.alat,
			'lng': this.alng
		}).toPromise().then(data => {
			this.drawInitialMap();
		}).catch(error => {
			console.error('An error occurred in HomePage', error);
			return Promise.reject(error.message || error);
		});
	}

	drawInitialMap() {
		this.alat = 43.6565064;
		this.alng = -79.3806653;
		this.loc = new google.maps.LatLng(this.alat, this.alng);
		let mapOptions = {
			zoom: 15,
			center: this.loc
		}
		this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
		this.marker = this.addMarker(this.alat, this.alng);
		this.addInfoWindow(this.marker, "You Are Here");
		this.locmarker = new google.maps.Marker(this.loc);

		for (var _i = 0; _i < this.points.length; _i = _i + 2) {
			var lat = this.points[_i];
			var lng = this.points[_i + 1];
			var marker = this.addHeatMarker(lat, lng);
			this.addInfoWindow(marker, "Stay clear");
			var loc = new google.maps.LatLng(lat, lng);
			this.locmarker = new google.maps.Marker(loc);
		}

		google.maps.event.trigger('resize', this.map);
	}

	addMarker(lat, lng) {
		let marker = new google.maps.Marker({
			map: this.map,
			animation: google.maps.Animation.DROP,
			position: new google.maps.LatLng(lat, lng)
		});
		return marker;
	}

	addHeatMarker(lat, lng) {
		let marker = new google.maps.Marker({
			map: this.map,
			icon: '../../assets/icon/circle.png',
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
		this.loc = new google.maps.LatLng(this.alat, this.alng);
		this.initialize(function(loc: any, dest: any, directionsDisplay: any, directionsService: any, map: any, callback) {
			let request = {
				origin: loc,
				destination: dest,
				travelMode: 'WALKING',
        waypoints: this.waypts,
        optimizeWaypoints: false
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
					lng: -79.3809802
				},
				zoom: 14,
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

	initialize(callback) {
		this.directionsDisplay = new google.maps.DirectionsRenderer();
		let mapOptions = {
			zoom: 14,
			center: new google.maps.LatLng((this.alat + this.blat) / 2, (this.alng + this.blng) / 2)
		}
		this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
		for (var _i = 0; _i < this.points.length; _i = _i + 2) {
			var lat = this.points[_i];
			var lng = this.points[_i + 1];
			var marker = this.addHeatMarker(lat, lng);
			this.addInfoWindow(marker, "Stay clear");
			var loc = new google.maps.LatLng(lat, lng);
			this.locmarker = new google.maps.Marker(loc);
		}
		this.directionsDisplay.setMap(this.map);
		callback(this.loc, this.dest, this.directionsDisplay, this.directionsService, this.map, function(map: any) {
			google.maps.event.trigger('resize', map);
		});
	}

	getDestination(keyPressed, callback) {

		if (keyPressed.code == 'Enter') {
			console.log(this.destination);

			/*let geocoder = new google.maps.Geocoder();
			geocoder.geocode({ 'address': this.destination }, (results, status) => {
				this.blat = results[0].geometry.location.lat();
				this.blng = results[0].geometry.location.lng();
				this.dest = new google.maps.LatLng(this.blat, this.blng);
				this.drawMap();
				console.log("lat: " + this.blat + ", long: " + this.blng);
			});*/

      this.blat = 43.6661914;
      this.blng = -79.3834618;
      this.dest = new google.maps.LatLng(this.blat, this.blng);
      this.drawMap();
		}
	}

}
