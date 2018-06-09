import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {
    let tip_list = ["Lock your car doors and keep valuables out of sight.", "If you are away from home for an extended time," +
    " ask someone to collect your mail and newspaper.", "Stay off your phone while driving.", "Walk home with friends after dark."];
    let randInt = this.randomInt(0, 3)
      this.tip = tip_list[randInt];
      }



    /**
     * generate a random integer between min and max
     * @param {number} min
     * @param {number} max
     * @return {number} random generated integer
     */
    randomInt(min, max){
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}
