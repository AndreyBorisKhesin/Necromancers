import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';

@Component({
	selector: 'page-report',
	templateUrl: 'report.html'
})
export class ReportPage {
	report : {
		name: any,
		type: any,
        text: any,
		lat: any,
		lng: any
	}

	constructor(private http: Http, public navCtrl: NavController) {
		this.report = {name: undefined, type: undefined, lat: 43.6565064, lng: -79.3806653, text: undefined};
	}

	send(event: any) {
		this.http.post('https://109dcaa9.ngrok.io/report', {
			'name': this.report.name,
			'type': this.report.type,
            'text': this.report.text,
            'lat': this.report.lat,
            'lng': this.report.lng,
		}).toPromise();
	}
}
