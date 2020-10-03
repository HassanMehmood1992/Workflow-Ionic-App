/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/*
ModuleID: page-my-processes-pending-approval-popup
Description: Popup to show pending process in favorites.
Location: ./pages/page-my-processes-pending-approval-popup
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@IonicPage()
@Component({
  selector: 'page-my-processes-pending-approval-popup',
  templateUrl: 'my-processes-pending-approval-popup.html',
})
export class MyProcessesPendingApprovalPopupPage {
  process; // current process opened in a popup
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    this.process = this.navParams.get('params');
  }

  /**
  * get the current process from parameters
  */
  ionViewDidEnter(){
   this.process = this.navParams.get('params');
  }

  /**
  * hide tab
  */
  close()
  {
    this.viewCtrl.dismiss();
  }


}
