/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { Pipe, PipeTransform } from '@angular/core';

/*
ModuleID: decodeUriComponent
Description: returns a decoded string if it can be decoded. Used in html to render encoded text
Location: ./pipes/decodeUriComponent
Author: Arsalan
Version: 1.0.0
Modification history: none
*/

@Pipe({
  name: 'decodeUriComponent',//pipe name
})
export class DecodeUriComponentPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: any, args?: any): any {
    try{
      var decoded = decodeURIComponent(decodeURIComponent(value));//decode uri components
      return decoded;//return decoded value
    }
    catch(error){
       return value;
    }
    
    }
}


@Pipe({
  name: 'decodeUriComponentSingle',//pipe name
})
export class DecodeUriComponentSinglePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: any, args?: any): any {
    var decoded = value;
    try{
       decoded = decodeURIComponent(decoded);
      decoded = decodeURIComponent(decoded);
      return decoded;//return decoded value
    }
    catch(error){
       return decoded;
    }
    
    }
}
