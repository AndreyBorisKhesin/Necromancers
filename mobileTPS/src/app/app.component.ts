import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AccountPage } from '../pages/account/account';
import { CommentsPage } from '../pages/comments/comments';
import { HomePage } from '../pages/home/home';
import { ReportPage } from '../pages/report/report';
import { SafepathPage } from '../pages/safepath/safepath';
import { VicinityPage } from '../pages/vicinity/vicinity';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'My Account', component: AccountPage },
      { title: 'Report an Incident', component: ReportPage },
      { title: 'Find a Safe Route', component: SafepathPage },
      { title: 'Incidents Near Me', component: VicinityPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
