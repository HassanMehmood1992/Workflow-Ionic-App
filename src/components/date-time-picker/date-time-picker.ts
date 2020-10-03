/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/




import { Component, EventEmitter, Output, Input } from '@angular/core';
import * as moment from 'moment';

/*
ModuleID: date-time-picker
Description: A reuseable component on the form which allows users select date and time in different formats
Location: ./components/date-time-picker
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Component({
  selector: 'app-date-time-picker',
  templateUrl: 'date-time-picker.html'
})
export class DateTimePickerComponent {

  @Input('ngModel') ngModel; // data model provided as an input to this Component.
  @Input('ClassName') className; // class name provided as an input to this Component.
  @Input('fieldName') fieldName; // field name provided as an input to this Component.
  @Input('controlOptions') controlOptions; // controlOptions provided as an input to this Component.
  

  @Output() ngModelChange = new EventEmitter(); // emitter to send values back to the caller Component.

  @Output() onDatePickerChange = new EventEmitter();// emitter to send values back to the caller Component.

  @Output() afterDateTimePickerOpen = new EventEmitter();// emitter to send values back to the caller Component.

  @Output() afterDateTimePickerClosed = new EventEmitter();// emitter to send values back to the caller Component.

 
  public clicked:boolean;
  constructor() { 
    this.className = "form-control";
    this.clicked = false;
  }

  /**
  * Called upon initialization of the Component.
  */
  ngOnInit() {
    if(this.ngModel == null || this.ngModel == undefined || this.ngModel == ""){
      this.ngModel = "";
    }
    if(this.controlOptions.placeholder == null || this.controlOptions.placeholder == undefined)
    {
      this.controlOptions.placeholder = "Select date time"
    }
  }

  /**
  * called when the date or time is changed. 
  */
  dateTimeChange(){
    this.ngModel = moment(this.ngModel).toDate();
    this.ngModelChange.emit(this.ngModel);
  }

  /**
  * called when the date picker is focused
  */
  afterPickerOpen(){
    this.ngModel = "";
    this.clicked = true;
    this.afterDateTimePickerOpen.emit(moment(this.ngModel).toDate());
  }

  /**
  * called when the date picker is blured
  */
  afterPickerClosed(){
    if(this.ngModel){
      this.clicked = false;
    }
    this.afterDateTimePickerClosed.emit(moment(this.ngModel).toDate());
  }

  /**
  * called when the date picker is changed
  */
  dateChange()
  {

    if(this.ngModel){
      this.clicked = false;
    }
    this.ngModelChange.emit(this.ngModel);
    this.onDatePickerChange.emit(this.ngModel);
  }

}
