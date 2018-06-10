import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import {VicinityPage} from "../vicinity/vicinity";
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
	selector: 'page-comments',
	templateUrl: 'comments.html'
})
export class CommentsPage {
	id: any;
	event_lat: number;
	event_lng: number;
	lat: number;
	lng: number;
	emerg_type: any
	time: any;
	maj_int: any;
	comments: Array<{name: any, time: any, text: any}>;
	posted_comment : {name: any, text: any};
	loc: any;
	map: any;
	marker: any;
	locmarker: any;

	constructor(private http: Http, public navCtrl: NavController, public navParams: NavParams) {
		this.lat = 43.6565064;
		this.lng = -79.3806653;
		this.id = navParams.get('id');
		this.comments = []
		this.posted_comment = {name: "", text: ""};
	}

	ionViewWillEnter() {
		this.http.post('https://109dcaa9.ngrok.io/incident_data', {
			'lat': this.lat,
			'lng': this.lng,
			'id': this.id
		}).toPromise().then(data => {
			this.incident_data(data.json())
		}).catch(error => {
			console.error('An error occurred in CommentPage', error);
			return Promise.reject(error.message || error);
		});
		this.http.post('https://109dcaa9.ngrok.io/comments', {
			'lat': this.lat,
			'lng': this.lng,
			'id': this.id
		}).toPromise().then(data => {
			this.parse_comments(data.json())
		}).catch(error => {
			console.error('An error occurred in CommentPage', error);
			return Promise.reject(error.message || error);
		});
	}

	incident_data(args: any) {
		this.emerg_type = args['emerg_type'];
		this.event_lat = args['lat'];
		this.event_lng = args['lng'];
		this.time = args['time'];
	}

	parse_comments(argslist: any) {
		this.comments = []
		for (let i = 0; i < argslist.length; i++) {
			let args = argslist[i];
			let item : {name: any, time: any, text: any};
			item = {
				name: args['name'],
				time: args['time'],
				text: args['text'],
			}
		}
	}

	send(event: any) {
		this.http.post('https://109dcaa9.ngrok.io/post_comment', {
			'name': this.posted_comment.name,
			'text': this.posted_comment.text,
			'id': this.id
		}).toPromise();
	}
}
