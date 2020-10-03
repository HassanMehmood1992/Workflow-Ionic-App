/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { AppProcessLookupPopupPage } from './../../pages/app-process-lookup-popup/app-process-lookup-popup';
import { ModalController } from 'ionic-angular';
import { Component, Input, Output, EventEmitter } from '@angular/core';

/*
ModuleID: app-process-lookup
Description: A reuseable component on the form which allows users to select data from the lookup lists related to process
Location: ./components/app-process-lookup
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@Component({
  selector: 'app-process-lookup',
  templateUrl: 'app-process-lookup.html'
})
export class AppProcessLookupComponent {

  @Input('ngModel') ngModel;
  @Input('lookupJson') lookupJson;
  @Input('ClassName') className;
  @Input('formDataJSON') formDataJSON;
  @Input('fieldName') fieldName;
  @Input('controlOptions') controlOptions;

  @Output() ngModelChange = new EventEmitter();

  @Output() onProcessLookupChange = new EventEmitter();


  private selectionType: any; // type of process lookup single/multiple
  private lookupName: any; // name of the lookup to be opened
  private lookupColumns: any; // columns to be looked up
  private columnHeadings: any; // heading of the columns
  private columnTypes: any; // types of columns
  private formFields: any; // form fields to set data to
  private filterString: any; // filter string if used any
  private sortString: any; // sort string if used any
  private selectorHeading: any; // selector header on the look up
  private placeHolder: any; // placeholder in the field
  private disabled: any; // check to draw disabled
  private required: any; // check to see if required
  private processId: any; // process id whose lookup data is fetched
  private validationText: any; // validation text to show if it is required
  public clicked: boolean; // fire validation on the in case it is required field.

  constructor(public modalCtrl: ModalController
  ) {

    this.clicked = false;
    this.className = "form-control"
    this.selectionType = "";
    this.lookupName = "";
    this.lookupColumns = "";
    this.columnHeadings = "";
    this.columnTypes = "";
    this.formFields = [];
    this.filterString = "";
    this.sortString = "";
    this.selectorHeading = "";
    this.placeHolder = "";
    this.disabled = false;
    this.required = false;
    this.processId = "";
    this.validationText = "";
    this.clicked = false;
  }

  /**
  * Initializes the component and set its properties
  */
  ngOnInit() {
    this.setLookupProperties();
    if (this.ngModel == undefined) {
      this.ngModel = "";
    }

  }


  /**
  * Opens process lookup popup based on its properties. Also sends its value back to the caller Component.
  */
  openDialog(): void {

    var self = this;
    let processlookupModal = self.modalCtrl.create(AppProcessLookupPopupPage, { data: { lookupDetails: self } }, { enableBackdropDismiss: true });
    processlookupModal.onDidDismiss(result => {
      if (result != undefined) {
        if (result.modelValue != undefined && result.modelRow != undefined) {
          if (result.modelValue.length > 1) {
            self.clicked = false;
            self.ngModel = "";
            for (let i: number = 0; i < result.modelValue.length; i++) {
              if (self.columnTypes[0].toLowerCase() == "peoplepicker") {
                self.ngModel += result.modelValue[i][0].DisplayName + "; ";
              }
              else {
                self.ngModel += result.modelValue[i] + "; ";
              }
            }
            self.ngModel = self.ngModel.substr(0, self.ngModel.length - 2);
          }
          else if (result.modelValue.length == 1) {
            if (self.columnTypes[0].toLowerCase() == "peoplepicker") {
              self.ngModel = result.modelValue[0][0].DisplayName;
            }
            else {
              self.ngModel = result.modelValue[0];
            }
          }

          self.ngModelChange.emit(self.ngModel);
          self.onProcessLookupChange.emit(result.modelRow);
        }
        else {
          self.clicked = true;
          self.ngModel = "";
          self.ngModelChange.emit(self.ngModel);
          self.onProcessLookupChange.emit(result);
        }
      }
    });
    if (!self.controlOptions.disabled && !self.controlOptions.readonly) {
      self.clicked = true;
      processlookupModal.present();
    }

  }


  /**
  * Set the properties of the lookup 
  */
  setLookupProperties() {
    if (this.fieldName == undefined || this.fieldName == "") {
      this.fieldName = "myProcessLookup";
    }

    if (this.controlOptions != "undefined") {
      this.processId = this.controlOptions.processId;
      this.lookupName = this.controlOptions.lookupName;
      this.selectionType = this.controlOptions.selectionType;
      this.columnHeadings = this.controlOptions.columnHeadings.split(",");
      this.columnTypes = this.controlOptions.columnTypes.split(",");
      this.lookupColumns = this.controlOptions.lookupColumns.split(",");
      this.formFields = this.controlOptions.formFields.split(",");
      this.filterString = this.controlOptions.filterString;
      this.sortString = this.controlOptions.sortString.split(",");
      if (this.controlOptions.selectorHeading != undefined) {
        this.selectorHeading = this.controlOptions.selectorHeading;
      }
      else {
        this.selectorHeading = "Data Selector";
      }
      if (this.controlOptions.placeholder != undefined) {
        this.placeHolder = this.controlOptions.placeholder;
      }
      else {
        this.placeHolder = "";
      }
    }
  }

}
