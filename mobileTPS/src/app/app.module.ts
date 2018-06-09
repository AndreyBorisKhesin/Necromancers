import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { AccountPage } from '../pages/account/account';
import { HomePage } from '../pages/home/home';
import { ReportPage } from '../pages/report/report';
import { SafepathPage } from '../pages/safepath/safepath';
import { VicinityPage } from '../pages/vicinity/vicinity';

import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    AccountPage,
    HomePage,
    ReportPage,
    SafepathPage,
    VicinityPage,

    ListPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AccountPage,
    HomePage,
    ReportPage,
    SafepathPage,
    VicinityPage,

    ListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
