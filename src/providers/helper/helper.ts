/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: HelperProvider
Description: Provides helper methods to be used in various comments.
Location: ./providers/HelperProvider
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { Injectable } from '@angular/core';

/*
  Generated class for the HelperProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HelperProvider {

  /**
   * Class constructor
   */
  constructor() {

  }

  /**
   * Splice slashes from a given string
   */
  spliceSlashes(element) {
    var regex = /\\\\/g;
    return element.replace(regex, '\\');
  }

  /**
   * Add slashes from a given string
   */
  addSlashes(element) {
    var regex = /\\/g;
    return element.replace(regex, '\\\\');
  }

  /**
   * Convert given date to UTC
   */
  convertDateToUTC(nonUTCDate) {
    var date = new Date(nonUTCDate);
    var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()));
    return utcDate;
  }

  /**
   * Get new UTC Timestamp
   */
  getUTCTimestamp() {
    var now = new Date;
    var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    return utc_timestamp;
  }

  /**
   * Get new UTC Time
   */
  getUTCTime() {
    var date = new Date();
    return (new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes())).toJSON().toString());
  }

  /**
   * Parse a JSON from string thaat is not empty and
   * not an object
   */
  parseJSONifString(JsonStr) {
    if (JsonStr == "") return JsonStr;
    if (typeof JsonStr !== 'object') {
      JsonStr = JSON.parse(JsonStr);
    }
    return JsonStr;
  }

  /**
   * Check if current date time falls in diagnostic logging time 
   */
  checkIfCurrentDateTimeInDiagnosticLoggingDateTime(data) {
    return false;
  }

  /**
   * Calculat and return difference between 
   * two dates
   */
  customSortDate(a, b) {
    return new Date(a.LastModified).getTime() - new Date(b.LastModified).getTime();
  }

  /**
   * Get column value for a process lookup
   * if string, return that string else return
   * Display Name of user.
   */
  getLookupColumnValue(column) {
    if (column) {
      if(column === '')
      {
        return '';
      }
      if (typeof column === 'object') {
        if (Array.isArray(column) && column.length > 0) {
          column = column[0];
          if (column.hasOwnProperty('DisplayName')) {
            return column.DisplayName;
          }
          else{
            return column.title;
          }
        }
        else {
          return;
        }
      }
      else {
        return column;
      }
    }
  }


}
