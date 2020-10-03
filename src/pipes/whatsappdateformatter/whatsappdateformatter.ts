/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


//required imports
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

/*
ModuleID: whatsappdateformatter
Description: returns date formatted as time difference between days,weeks and then dates as used by whatsapp
Location: ./pipes/whatsappdateformatter
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Pipe({
  name: 'whatsappdateformatter',//pipe name
})
export class WhatsappdateformatterPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(date: Date, ...args) {
    if (date)
    {
      var oneDay = 24 * 60 * 60 * 1000; //one day seconds
      var secondDate = new Date(date);//input date
      var firstDate = new Date();//current date
      //get date difference between current date and input date in days
      var diffDays = Math.floor(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
      var dateB = moment(date);
      if (diffDays > 7) {
        return dateB.format('D-MMM-YYYY').toUpperCase();//return formatted date.
      }
      else
      
        {//if input date is current date
        if (diffDays === 0)
        {
          
          return dateB.format('LT');
        }
        else if (diffDays >= 1)
        {
          return dateB.format('dddd');
        }
      }
    }
    return '';
  }
}
