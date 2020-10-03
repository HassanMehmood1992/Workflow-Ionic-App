import { NgZone } from '@angular/core';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: LoadingProvider
Description: Provide a loading mechanism to show progress.
Location: ./providers/LoadingProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';

/*
  Generated class for the LoadingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LoadingProvider {

  private loader: any;//reference of the ionic loading provider

  /**
   * Class constructor
   */
  constructor(public loadingCtrl: LoadingController,private ngZone: NgZone) {
  }

  /**
   * Present the loading for a duration specified by timeout and 
   * with message specified by context
   */
  presentLoading(content, timeout) {
    this.loader = this.loadingCtrl.create({
      content: content,
      duration: timeout,
    });
    this.loader.present();
  }

  presentLoadingForm(content, timeout,clickoutsidetoclose) {
    this.loader = this.loadingCtrl.create({
      content: content,
      duration: timeout,
      enableBackdropDismiss: clickoutsidetoclose
    });
    this.loader.present();
  }

  /**
   * Hide the loading
   */
  hideLoading() {
    this.somePromiseMethod(this).then((scope:LoadingProvider) => {
      if (!scope.loader._isHidden) {
        scope.loader.dismiss();
      }
    });
  }

  somePromiseMethod(scope) {
    let promise = new Promise((resolve, reject) => {
      resolve(scope);
    });
    return promise;
  }

}
