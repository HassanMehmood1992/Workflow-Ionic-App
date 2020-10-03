/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: BacknavigationProvider
Description: Service which contains observable to invoke an event regarding search navigation etc.
Location: ./providers/BacknavigationProvider
Author: Hassan
Version: 1.0.0
Modification history: none
*/


import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from 'rxjs'

/*
  Generated class for the BacknavigationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BacknavigationProvider {

  private _navItemSource = new BehaviorSubject([]);
  // Observable navItem stream
  navItem$ = this._navItemSource.asObservable();
  // service command
  changeNav(val) {
    this._navItemSource.next(val);
  }

}
