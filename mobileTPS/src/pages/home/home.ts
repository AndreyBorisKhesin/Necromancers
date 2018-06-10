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
	n: number;
	items: Array<{dist_from_you: any, emerg_type: any, time: any, maj_int: any}>;
	dist_from_you: any;
	emerg_type: any
	time: any;
	maj_int: any;
	tip: any;

	constructor(private http: Http, public navCtrl: NavController) {
		this.numbers();
	}

	numbers() {
		let tip_list = ["Lock your car doors and keep valuables out of sight.", "If you are away from home for an extended time," +
		" ask someone to collect your mail and newspapers.", "Stay off your phone while driving.", "Walk home with friends after dark."];
		let randInt = this.randomInt(0, 3);
		this.tip = tip_list[randInt];
		this.lat = 43.6565064;
		this.lng = -79.3806653;
		this.n = 5;
		this.items = [];
	}

	ionViewWillEnter() {
		this.loadIncidents();
	}

	loadIncidents() {
		this.http.post('https://109dcaa9.ngrok.io/incidents', {
			'lat': this.lat,
			'lng': this.lng,
			'n': this.n
		}).toPromise().then(data => {
			this.incidents(data.json())
		}).catch(error => {
			console.error('An error occurred in HomePage', error);
			return Promise.reject(error.message || error);
		});
	}

	incidents(argslist: any) {
		this.items = []
		for (let i = 0; i < Math.min(this.n, argslist.length); i++) {
			let args = argslist[i];
			let item : {dist_from_you: any, emerg_type: any, time: any, maj_int: any};
			item = {
				dist_from_you: args['dist_from_you'],
				emerg_type: args['emerg_type'],
				time: args['time'],
				maj_int: args['maj_int']
			}
			this.items.push(item)
		}
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
