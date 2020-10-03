/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/




import { AppProcessDblookupPopupPage } from './../../pages/app-process-dblookup-popup/app-process-dblookup-popup';
import { ModalController } from 'ionic-angular';
import { Component, Input, EventEmitter, Output } from '@angular/core';

/*
ModuleID: app-database-lookup
Description: A reuseable component on the form which allows users to select data from the database related to process
Location: ./components/app-database-lookup
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Component({
  selector: 'app-database-lookup',
  templateUrl: 'app-database-lookup.html'
})
export class AppDatabaseLookupComponent {

  @Input('ngModel') ngModel;
  @Input('ClassName') className;
  @Input('formDataJSON') formDataJSON;
  @Input('fieldName') fieldName;
  @Input('controlOptions') controlOptions;
  @Output() ngModelChange = new EventEmitter();
  @Output() onDatabaseLookupChange = new EventEmitter();

  public selectionType:any; // determine the selection of lookup type signle / multiple
  public query:any; // query string to be executed to fetch data
  public columnHeadings:any; // heading of the columns
  public selectorHeading:any; // selector heading of the columns
  private columnNames: any; // column names use to display columns
  private columnTypes: any; // columns types peoplepicker / text etc
  private formFields: any; // form fields to be set when the popup closes
  public placeHolder: any; // placeholder on the field
  public clicked:boolean; // used to check for validation

  constructor(public modalCtrl:ModalController) {
    this.className = "form-control"
    this.selectionType = "";
    this.query = "";
    this.columnHeadings = "";
    this.selectorHeading = "";
    this.columnNames = "";
    this.columnTypes = "";
    this.formFields = "";
    this.placeHolder = "";
    this.clicked = false;
  }

  /**
  * Initialize the Component. 
  */
  ngOnInit() {
    this.setLookupProperties();
    if (this.ngModel == undefined) {
      this.ngModel = "";
    }
  }

  /**
  * Open dialog for database lookup popup. 
  */
  openDialog(): void {
    let processlookupModal = this.modalCtrl.create(AppProcessDblookupPopupPage,     {data: {lookupDetails:this}}, {enableBackdropDismiss:true});
    processlookupModal.onDidDismiss(result => {
      if (result != undefined) {
          if (result.modelValue != undefined && result.modelRow != undefined) {
            if (result.modelValue.length > 1) {
              this.clicked = false;
              this.ngModel = "";
              for (let i: number = 0; i < result.modelValue.length; i++) {
                if(this.columnTypes[0].toLowerCase() == "peoplepicker"){
                  this.ngModel += result.modelValue[i][0].DisplayName + "; ";  
                }
                else{
                  this.ngModel += result.modelValue[i] + "; ";  
                }
              }
              this.ngModel = this.ngModel.substr(0, this.ngModel.length - 2);
            }
            else if (result.modelValue.length == 1) {
              if(this.columnTypes[0].toLowerCase() == "peoplePicker"){
                this.ngModel = result.modelValue[0][0].DisplayName;  
              }
              else{
                this.ngModel = result.modelValue[0];  
              }
            }
  
            this.ngModelChange.emit(this.ngModel);
            this.onDatabaseLookupChange.emit(result.modelRow);
          }
          else {
            this.clicked = true;
            this.ngModel = "";
            this.ngModelChange.emit(this.ngModel);
            this.onDatabaseLookupChange.emit(result);
          }
        }
    });
    processlookupModal.present();
  }

  /**
  * Sets properties of the database lookup upon opening 
  */
  setLookupProperties() {
    if(this.fieldName == undefined || this.fieldName == ""){
      this.fieldName = "myProcessLookup";
    }

    if (this.controlOptions != undefined) {
        this.selectionType = this.controlOptions.selectionType;
        this.query = this.controlOptions.query;
        this.columnHeadings = this.controlOptions.columnHeadings.split(",");
        this.columnNames = this.controlOptions.columnNames.split(",");
        this.formFields = this.controlOptions.formFields.split(",");
        this.columnTypes = this.controlOptions.columnTypes.split(",");

      if(this.selectorHeading != undefined){
        this.selectorHeading = this.controlOptions.selectorHeading;
      }
      else{
        this.selectorHeading = "Data Selector";
      }
    }
  }

}
