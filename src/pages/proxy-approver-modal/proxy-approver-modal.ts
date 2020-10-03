/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-proxy-approver-modal
Description: Renders proxy approver modal. Uses local databse call to retrieve proxy approver settings and synchronization service to create up sync tasks.
Location: ./pages/page-proxy-approver-modal
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


/**
 * Generated class for the ProxyApproverModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-proxy-approver-modal',
  templateUrl: 'proxy-approver-modal.html',
})
export class ProxyApproverModalPage {

  peoplePickerDisplayText: String = '';//text to display in people picker field
  peoplePickerArray: any[] = [];//list containing people selected in picker

  proxyApproverForm: FormGroup = this.formBuilder.group({ //form group for proxy approver selection
    'peoplePicker': ['', [Validators.required]]
  });

  /**
  * Class constructor
  */
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
    private modal: ModalController,
    private formBuilder: FormBuilder) {

  }

  /**
  * Close the popup
  */
  dismiss() {
    this.viewCtrl.dismiss();
  }

  /**
  * Open the pepople picker modal
  */
  openPeoplePicker() {
    var peoplePicker = this.modal.create('PeoplePickerPage', { "peoplePickerArray": this.peoplePickerArray, "maxSelectedItems": 1, "selfSelection": false });
    peoplePicker.onDidDismiss(data => {
      if (Array.isArray(data)) {
        this.peoplePickerArray = data;
        this.peoplePickerDisplayText = '';
        for (var i = 0; i < data.length; i++) {
          if (data[i].DisplayName) {
            this.peoplePickerDisplayText += data[i].DisplayName;// + ' (' + data[i].Email + ')';
          }
          else {
            this.peoplePickerDisplayText += data[i].Email;
          }
          if (data.length > 1 && i < data.length - 1) {
            this.peoplePickerDisplayText += ('; ');
          }
        }
      }
    });
    peoplePicker.present();
  }

  /**
  * dismiss the view on update click
  */
  update() {
    this.viewCtrl.dismiss(this.peoplePickerArray[0]);
  }

}
