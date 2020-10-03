/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ApplicationDataProvider
Description: A static service to keep application data
Location: ./providers/ApplicationDataProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/




import { Injectable } from '@angular/core';

/*
  Generated class for the ApplicationDataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApplicationDataProvider {

  private _manufacturer: string = '';
  private _model: string = '';
  private _platform: string = '';
  private _uuid: string = '';

  set manufacturer(_manufacturer) {
    this._manufacturer = _manufacturer;
  }
  set model(model) {
    this._model = model;
  }
  set platform(platform) {
    this._platform = platform;
  }
  set uuid(uuid) {
    this._uuid = uuid;
  }

  get manufacturer():string {
    return this._manufacturer;
  }
  get model():string {
    return this._model;
  }
  get platform():string {
    return this._platform;
  }
  get uuid():string {
    return this._uuid;
  }


  constructor() {
    
  }

}
