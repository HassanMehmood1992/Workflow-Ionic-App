/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/




import { Component, Input, Output, EventEmitter } from '@angular/core';

/*
ModuleID: app-number-field
Description: A reuseable component on the form which allows users to input numbers with formats
Location: ./components/app-number-field
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Component({
  selector: 'app-number-field',
  templateUrl: 'app-number-field.html'
})
export class AppNumberFieldComponent {


  @Input('ngModel') ngModel;
  @Input('ClassName') className;
  @Input('isFooter') isFooter;
  @Input('formDataJSON') formDataJSON; 
  @Input('controlOptions') controlOptions;
  @Output() ngModelChange = new EventEmitter();

  @Output() onNumberFieldChange = new EventEmitter();

  public clicked:boolean; // check validation on the field
  constructor() {
    this.className = "form-control"
    this.isFooter = false;
    this.clicked = false;
  }

  /**
  * Send value back to the caller component
  */
  emitvalue()
  {
    if(isNaN(this.ngModel))
    {
      this.ngModel = 0;
      this.clicked = true;
      this.ngModelChange.emit(this.ngModel);
      this.onNumberFieldChange.emit(0);
    }
    else
    {
      if(this.ngModel == 0 && this.controlOptions.required){
        this.clicked = true;
      }
      else{
        this.clicked = false;
      }
      this.ngModelChange.emit(this.ngModel);
      this.onNumberFieldChange.emit(this.ngModel);
    }
  }

  onValueChange(events)
  {
    if(isNaN(this.ngModel))
    {
      this.ngModel = 0;
      this.clicked = true;
      this.ngModelChange.emit(this.ngModel);
    }
    else
    {
      if(this.ngModel == 0 && this.controlOptions.required){
        this.clicked = true;
      }
      else{
        this.clicked = false;
      }
      this.ngModelChange.emit(this.ngModel);
    }
  }


}
