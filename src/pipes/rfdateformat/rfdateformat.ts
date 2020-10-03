/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



//required imports
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment'; 
/*
ModuleID: rfdateformat
Description: returns RapidFlow date format. Used to create consistency of datetime in different components.
Location: ./pipes/rfdateformat
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Pipe({
  name: 'rfdateformat',//pipe name
})
export class RfdateformatPipe implements PipeTransform {
  /**
   * Converts input string to date format used by rapidflow system
   */
  transform(input: string) {
    if (input)
    {
      return moment(input).format('DD-MMM-YYYY hh:mm A').toUpperCase();
    }
    return '';
  }
}
