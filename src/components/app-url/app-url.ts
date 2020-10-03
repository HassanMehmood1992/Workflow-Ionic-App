import { AppUrlPopupPage } from './../../pages/app-url-popup/app-url-popup';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalController } from 'ionic-angular';
import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';

/**
 * Generated class for the AppUrlComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-url',
  templateUrl: 'app-url.html'
})
export class AppUrlComponent {

  @Input('ngModel') ngModel;
  @Input('className') className;;
  @Input('fieldName') fieldName;
  @Input('formDataJSON') formDataJSON;
  @Input('controlOptions') controlOptions;
  @Output() ngModelChange = new EventEmitter();
  
  selectionType;
  selectorHeading;


  public myForm: FormGroup; // for form validation
  public clicked: boolean; // fire validation if the user clicks on it


  constructor(public modalCtrl: ModalController, @Inject(FormBuilder) formBuilder: FormBuilder) {
    this.className = "form-control"
    this.clicked = false;
    this.selectionType = 'single';
    this.selectorHeading = 'Add URL';
    this.myForm = formBuilder.group({});
  }

  /**
  * Initializes the component and set its properties
  */

  ngOnInit() {
    this.setURLProperties();
    if (this.ngModel == undefined) {
      this.ngModel = [];
    }
    if (this.ngModel.length == undefined) {
      let tempObject = this.ngModel;
      this.ngModel = [];
      this.ngModel.push(tempObject);
    }


    if (this.controlOptions.placeholder == null || this.controlOptions.placeholder == undefined) {
      this.controlOptions["placeholder"] = "Select URL ";
    }
  }

  /**
  * Open People picker dialog
  */
  openDialog(): void {
    var self = this;
    if(self.selectionType.toLowerCase() == 'single' && self.ngModel.length < 1)
    {
      let peoplepickerModal = self.modalCtrl.create(AppUrlPopupPage, {selectorHeader: self.selectorHeading});
       var tempObject = {};
      peoplepickerModal.onDidDismiss(result => {
        if (result) {
            if (result.length == 0 || result.length == undefined) {
              if (this.ngModel == "") {
                this.ngModel = [];
              }
              if(this.selectionType != undefined){
                if(this.selectionType == "single"){
                  if (this.controlOptions.required) {
                    this.clicked = true;
                    this.ngModel = [];
                    this.ngModel.push(result);
                  }
                  else {
                    this.clicked = false;
                    this.ngModel = [];
                    this.ngModel.push(result);
                  }
                }
                else{
                  if (this.controlOptions.required) {
                    this.clicked = true;
                    this.ngModel.push(result);
                  }
                  else {
                    this.clicked = false;
                    this.ngModel.push(result);
                  }
                }
              }
            }
            this.ngModelChange.emit(this.ngModel);
          }
      });
      if (!self.controlOptions.disabled && !self.controlOptions.readonly) {
        self.clicked = true;
        peoplepickerModal.present();
      }
    }
    else if(self.selectionType.toLowerCase() == 'multiple')
    {
      let peoplepickerModal = self.modalCtrl.create(AppUrlPopupPage, {selectorHeader: self.selectorHeading});
      peoplepickerModal.onDidDismiss(result => {
        if (result) {
            if (result.length == 0 || result.length == undefined) {
              if (this.ngModel == "") {
                this.ngModel = [];
              }
              if(this.selectionType != undefined){
                if(this.selectionType == "single"){
                  if (this.controlOptions.required) {
                    this.clicked = true;
                    this.ngModel = [];
                    this.ngModel.push(result);
                  }
                  else {
                    this.clicked = false;
                    this.ngModel = [];
                    this.ngModel.push(result);
                  }
                }
                else{
                  if (this.controlOptions.required) {
                    this.clicked = true;
                    this.ngModel.push(result);
                  }
                  else {
                    this.clicked = false;
                    this.ngModel.push(result);
                  }
                }
              }
            }
            this.ngModelChange.emit(this.ngModel);
          }
      });
      if (!self.controlOptions.disabled && !self.controlOptions.readonly) {
        self.clicked = true;
        peoplepickerModal.present();
      }
    }
    else
    {
      alert('More than one URL is not allowed');
    }

  }
  removeURL(URL, index) {
    this.ngModel.splice(index, 1);
    if (this.ngModel.length == 0) {
      if (this.controlOptions != undefined) {
        if (this.controlOptions.required) {
          this.myForm.controls[this.fieldName] = new FormControl();
          this.myForm.controls[this.fieldName].setValidators(Validators.required);
          this.ngModelChange.emit([]);
        }
        else {
          this.ngModelChange.emit(this.ngModel);
          this.myForm.controls[this.fieldName] = new FormControl();
          this.myForm.controls[this.fieldName].setValidators(Validators.nullValidator);
        }
      }
    }
  }

  /**
  * Sets properties in people picker field
  */
  setURLProperties() {
    if (this.fieldName == undefined || this.fieldName == "") {
      this.fieldName = "myUrlField";
    }
    if (this.controlOptions != undefined) {
      if (this.controlOptions.selectionType == undefined) {
        this.selectionType = 'single';
      }
      else
      {
         this.selectionType = this.controlOptions.selectionType;
      }

      if (this.controlOptions.selectorHeading == undefined) {
        this.selectorHeading = 'Add URL';
      }
      else
      {
        this.selectorHeading = this.controlOptions.selectorHeading
      }
    }
    if (this.controlOptions != undefined) {
      if (this.controlOptions.required) {
        this.myForm.controls[this.fieldName] = new FormControl();   
        this.myForm.controls[this.fieldName].setValidators(Validators.required);
      }
      else {
        this.myForm.controls[this.fieldName] = new FormControl();
        this.myForm.controls[this.fieldName].setValidators(Validators.nullValidator);
      }
    }
  }
}
