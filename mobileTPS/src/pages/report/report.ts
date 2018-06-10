import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import { CommentsPage } from '../comments/comments';

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

	constructor(private http: Http, public navCtrl: NavController, private toastCtrl: ToastController) {
		this.report = {name: undefined, type: undefined, lat: 43.6576163, lng: -79.3812037, text: undefined};
	}

	presentToast() {
		let toast = this.toastCtrl.create({
			message: 'Report submitted',
			duration: 3000,
			position: 'top'
		});

		toast.onDidDismiss(() => {
			console.log('Dismissed toast');
		});

		toast.present();
		}

	send(event: any) {
		this.http.post('https://109dcaa9.ngrok.io/report', {
			'name': this.report.name,
			'type': this.report.type,
			'text': this.report.text,
			'lat': this.report.lat,
			'lng': this.report.lng,
		}).toPromise().then(data => {
			this.gotocomments(data.json());
		}).catch(error => {
			console.error('An error occurred in ReportPage', error);
			return Promise.reject(error.message || error);
		});

		this.presentToast();
	}

	gotocomments(data: any) {
		this.navCtrl.push(CommentsPage, {
			id: data['id'],
		});
	}
}
