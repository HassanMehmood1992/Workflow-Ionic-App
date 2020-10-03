/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


import { Pipe, PipeTransform } from '@angular/core';
/*
ModuleID: keys
Description: Returns keys array after splitting.
Location: ./pipes/keys
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@Pipe({
  name: 'keys',
})
export class KeysPipe implements PipeTransform {
  /**
   * Generates and returns array of keys
   */
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
      keys.push({key: key, value: value[key]});
    }
    return keys;//return keys array
  }
}

