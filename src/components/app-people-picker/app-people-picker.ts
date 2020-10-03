/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { FormGroup } from '@angular/forms';
import { ModalController } from 'ionic-angular';
import { PeoplePickerPage } from './../../pages/people-picker/people-picker';
import { Component, Input, Output, EventEmitter } from '@angular/core';

/*
ModuleID: app-people-picker
Description: A reuseable component on the form which allows users to select person in input field
Location: ./components/app-people-picker
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Component({
  selector: 'app-people-picker',
  templateUrl: 'app-people-picker.html'
})
export class AppPeoplePickerComponent {

  peoplePickerArray: any[] = [];
  @Input('ngModel') ngModel;
  @Input('selfSelection') selfSelection;
  @Input('selectionType') selectionType;
  @Input('groupSelection') groupSelection;
  @Input('ClassName') className;
  @Input('selectorHeading') selectorHeading;
  @Input('controlOptions') controlOptions;
  @Input('fieldName') fieldName;


  @Output() ngModelChange = new EventEmitter();

  @Output() onPeoplePickerChange = new EventEmitter();

  public tempNgModel: string; // temp modal to hold value of people
  public placeHolder: string; // placeholder to be shown
  public myForm: FormGroup; // for form validation
  public clicked: boolean; // fire validation if the user clicks on it


  constructor(public modalCtrl: ModalController) {
    this.tempNgModel = "";
    this.className = "form-control"
    this.clicked = false;
  }

  /**
  * Initializes the component and set its properties
  */

  ngOnInit() {
    this.setPeoplePickerProperties();
    if (this.ngModel == undefined) {
      this.ngModel = [];
    }
    if (this.ngModel.length == undefined) {
      let tempObject = this.ngModel;
      this.ngModel = [];
      this.ngModel.push(tempObject);
    }

    if (this.ngModel.length == 1) {
      this.tempNgModel = this.ngModel[0].DisplayName;
    }
    else if (this.ngModel.length > 1) {

    }
    this.peoplePickerArray = this.ngModel;

    if (this.selectorHeading == undefined || this.selectorHeading == "") {
      if (this.groupSelection) {
        this.selectorHeading = "Group Selector"
      }
      else {
        this.selectorHeading = "Person Selector"
      }
    }

    if (this.groupSelection) {
      this.placeHolder = "Select group name"
    }
    else {
      this.placeHolder = "Select person name or email address"
    }
    if (this.controlOptions.placeholder == null || this.controlOptions.placeholder == undefined) {
      this.controlOptions["placeholder"] = "Select person ";
    }

    if (this.groupSelection == undefined || this.groupSelection == "") {
      this.groupSelection = false;
    }
  }

  /**
  * Open People picker dialog
  */
  openDialog(): void {
    var maxSelectedItems: Number = 10000;
    if (typeof this.selfSelection === 'string') {
      if (this.selfSelection === "false") {
        this.selfSelection = false;
      }
      else {
        this.selfSelection = true;
      }
    }
    if (this.selectionType === 'single') {
      maxSelectedItems = 1;
    }
    let peoplepickerModal = this.modalCtrl.create(PeoplePickerPage, { "peoplePickerArray": this.peoplePickerArray, "maxSelectedItems": maxSelectedItems, "selfSelection": this.selfSelection });
    peoplepickerModal.onDidDismiss(result => {
      if (result) {
        if (result.length == 0 || result.length == undefined) {
          if (this.controlOptions.required) {
            this.clicked = true;
            this.ngModel = result;
            this.ngModelChange.emit(this.ngModel);
          }
          else {
            this.clicked = false;
          }
        }
        this.peoplePickerArray = result;
        this.ngModelChange.emit(result);
        this.onPeoplePickerChange.emit(result);
      }
    });
    if (!this.controlOptions.disabled && !this.controlOptions.readonly) {
      this.clicked = true;
      peoplepickerModal.present();
    }
  }

  /**
  * Sets properties in people picker field
  */
  setPeoplePickerProperties() {
    if (this.fieldName == undefined || this.fieldName == "") {
      this.fieldName = "myPeoplePicker";
    }
    if (this.controlOptions != undefined) {
      if (this.selectionType == undefined) {
        this.selectionType = this.controlOptions.selectionType;
      }
      if (this.selfSelection == undefined) {
        this.selfSelection = this.controlOptions.selfSelection;
      }
      if (this.selectorHeading == undefined) {
        this.selectorHeading = this.controlOptions.selectorHeading;
      }
    }
  }

}
