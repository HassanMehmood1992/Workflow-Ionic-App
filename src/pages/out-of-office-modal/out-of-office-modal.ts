/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { HelperProvider } from './../../providers/helper/helper';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


class OutOfOfficeSetting {
  Delegated_To: {
    Email: String,
    DisplayName: String
  };
  Start_Date: any;
  End_Date: any;
}
/*
ModuleID: page-out-of-office-modal
Description: Renders out of office popup to set out of office in process and app settings.
Location: ./pages/page-out-of-office-modal
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@IonicPage()
@Component({
  selector: 'page-out-of-office-modal',
  templateUrl: 'out-of-office-modal.html',
})
export class OutOfOfficeModalPage {

  peoplePickerDisplayText: String = ''; // use to display people picker value on the model
  peoplePickerArray: any[] = []; // array containing the list of people retrieved from the server
  today; // checks for todays date
  outOfOfficeSetting: OutOfOfficeSetting = new OutOfOfficeSetting();

  outOfOfficeForm: FormGroup = this.formBuilder.group({
    'peoplePicker': ['', [Validators.required]],
    'startDate': ['', [Validators.required]],
    'endDate': ['', [Validators.required]]
  });

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private modal: ModalController,
    private alertCtrl: AlertController,
    private helperProvider: HelperProvider,
    private formBuilder: FormBuilder) {
   
    this.calculateToday();

  }

  /**
  * Called once after the ng after init. Calculates today
  */
  ngAfterViewInit()
  {
    this.calculateToday();
  }

  /**
  * Hides the popup
  */
  dismiss() {
    this.viewCtrl.dismiss();
  }

  /**
  * Opens up people picker popup
  */
  openPeoplePicker() {
    var peoplePicker = this.modal.create('PeoplePickerPage', { "peoplePickerArray": this.peoplePickerArray, "maxSelectedItems": 1, "selfSelection": false });
    peoplePicker.onDidDismiss(data => {
      if (Array.isArray(data)) {
        this.peoplePickerArray = data;
        this.peoplePickerDisplayText = '';
        for (var i = 0; i < data.length; i++) {
          if (data[i].DisplayName) {
            this.peoplePickerDisplayText += data[i].DisplayName;
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
  * Updates the out of office settings
  */
  update() {
    this.outOfOfficeSetting.Delegated_To = { DisplayName: this.peoplePickerArray[0].DisplayName, Email: this.peoplePickerArray[0].Email };
    this.outOfOfficeSetting.Start_Date = this.helperProvider.convertDateToUTC(this.outOfOfficeSetting.Start_Date);
    this.outOfOfficeSetting.End_Date = this.helperProvider.convertDateToUTC(this.outOfOfficeSetting.End_Date);
    this.viewCtrl.dismiss(this.outOfOfficeSetting);
  }

  /**
  * Called on the start date changes. validates date
  */
  startDateChanged() {
    if (this.outOfOfficeSetting.End_Date) {
      if (Date.parse(this.outOfOfficeSetting.End_Date) < (Date.parse(this.outOfOfficeSetting.Start_Date))) {
        this.outOfOfficeSetting.Start_Date = '';
        this.alertCtrl.create({
          title: 'Out of Office',
          subTitle: 'Start date should be less than End date',
          buttons: ['OK']
        }).present();
      }
    }
  }

  /**
  * Called on the end date changes. validates date
  */
  endDateChanged() {
    if (this.outOfOfficeSetting.Start_Date) {
      if (Date.parse(this.outOfOfficeSetting.End_Date) < (Date.parse(this.outOfOfficeSetting.Start_Date))) {
        this.outOfOfficeSetting.End_Date = '';
        this.alertCtrl.create({
          title: 'Out of Office',
          subTitle: 'End date should be greater than Start date',
          buttons: ['OK']
        }).present();
      }
    }

  }

  /**
  * calculate today values
  */
  calculateToday()
  {
     var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth()+1;
    var dt = d.getDate();
    var dt2 = "";
    var month2 = "";

    if(dt<10){
      dt2 = '0' + dt
    }
    else{
      dt2 = dt.toString();
    }
    if(month<10){
      month2 = '0' + month
    }
    else{
      month2 = month.toString();
    }
    var day = (year + '-'+ month2+ '-'+ dt2);
    this.today = day.toString();
  }

}
