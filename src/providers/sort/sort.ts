/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: SortProvider
Description: Service which contains observable to invoke an event regarding sort.
Location: ./providers/SortProvider
Author: Hassan
Version: 1.0.0
Modification history: none
*/


/**
* Importing neccassary libraries and modules for this class 
*/
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from 'rxjs'

/*
  Generated class for the SortProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SortProvider {

  private _navItemSource = new BehaviorSubject(false);//behaviour subject for emitting sorting event
  // Observable navItem stream
  navItem$ = this._navItemSource.asObservable();//observable to be get by other classes to listen for sorting event
  
  /**
  * Emitter for sorting event
  */
  changeNav(val) {
    this._navItemSource.next(val);
  }

}
