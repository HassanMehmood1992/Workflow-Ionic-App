/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

//required imports
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

/*
ModuleID: processOffset
Description: returns date time based on process timezone
Location: ./pipes/processOffset
Author: Arsalan
Version: 1.0.0
Modification history: none
*/


@Pipe({
  name: 'processOffset',//pipe name
})
export class ProcessOffsetPipe implements PipeTransform {
  /**
   * Converts date to process timezone
   */
  transform(date: any, args?: any): any {
    if(date){
    // var targetTime = new Date(date);//time to convert
    // var timeZoneFromDB = args;//time zone value from database

    // //get the timezone offset from local time in minutes
    // var tzDifference = parseFloat(timeZoneFromDB) * 60;
    
    // //convert the offset to milliseconds, add to targetTime, and make a new Date
    // var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);
    
    // //return datetime according to the new timezone
    // return moment(offsetTime).format("DD-MMM-YYYY hh:mm A").toUpperCase();
    return moment(moment.utc(date).format()).zone(args).format('DD-MMM-YYYY hh:mm A')
    }
    return null;
    }
}
