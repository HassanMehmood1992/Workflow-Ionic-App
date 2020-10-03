/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: CountServiceProvider
Description: Service which contains observable to invoke an event regarding counts update on process level.
Location: ./providers/CountServiceProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {ReplaySubject} from 'rxjs'

/*
  Generated class for the CountServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CountServiceProvider {

  private _navItemSource = new ReplaySubject;// Emittier for counts change event
  navItem$ = this._navItemSource.asObservable();// Observer used by other classes for subscribing for counts changes

  /**
   * Emmit value change event
   */
  changeNav(val) {
    this._navItemSource.next(val);
  }

}
