/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment'; 
/*
ModuleID: rfdateformat2
Description: returns RapidFlow date format. Used to create consistency of datetime in different components.
Location: ./pipes/rfdateformat2
Author: Hassan
Version: 1.0.0
Modification history: none
*/


@Pipe({
  name: 'rfdateformat2',//pipe name
})
export class Rfdateformat2Pipe implements PipeTransform {
  /**
   * Converts input string to date format used by rapidflow system
   */
  transform(input: string) {
    if (input)
    {
      return moment(input).format('DD-MMM-YYYY').toUpperCase();
    }
    //returns empty string if undefined
    return '';
  }
}

@Pipe({
  name: 'rfdateformat3',//pipe name
})
export class Rfdateformat3Pipe implements PipeTransform {
  /**
   * Converts input string to date format used by rapidflow system
   */
  transform(input: string) {
    if (input)
    {
      return moment(input).format('hh:mm A').toUpperCase();
    }
    //returns empty string if undefined
    return '';
  }
}