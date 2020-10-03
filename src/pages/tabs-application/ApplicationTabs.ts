/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: application-tabs
Description: Renders app level tabs.
Location: ./pages/application-tabs
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { NavParams } from 'ionic-angular';
import { AppSettingsPage } from './../app-settings/app-settings';
import { DirectoryPage } from './../directory/directory';
import { MyProcessesPage } from './../my-processes/my-processes';
import { Component } from '@angular/core';
import { ENV } from './../../config/environment.prod';
import { Platform } from 'ionic-angular';


@Component({
  templateUrl: 'tabs.html',
  selector: 'application-tabs',
})
export class ApplicationTabsPage {
  myIndex; // Global variable of class to store the current index of the tab
  tab1Root = MyProcessesPage; // Global variable of class to store my processess tab
  tab2Root = DirectoryPage; // Global variable of class to store directory tab
  tab3Root = AppSettingsPage; // Global variable of class to store application settings
  private referenceWidth; // Global variable of class to store the reference width

  /**
  * Class constructor
  */
  constructor(public navparams: NavParams,
    public globalservice: ProcessDataProvider,
    public plt: Platform) {

    if (this.plt.is('ios')) {
      this.referenceWidth = ENV.MINIMUM_SUPPORTED_DEVICE_LONGEDGE_REPORTS_IOS;
    }
    else if (this.plt.is('android')) {
      this.referenceWidth = ENV.MINIMUM_SUPPORTED_DEVICE_LONGEDGE_REPORTS_ANDROID;
    }

    this.myIndex = this.navparams.data.tabIndex || 0;
    
    /**
    * Function that checks the orientation of the device
    */
    window.addEventListener('orientationchange', () => {
      if (!(<any>window).isTablet) {
        switch (window.orientation) {
          case 90: // landscape
          case -90:
            {
              //always show on landscape..
              this.globalservice.hideshowsearch = false;
            }
            break;

          case 0: // portrait
          case 180:
            {
              if (parseInt(this.referenceWidth) > screen.width) {
                this.globalservice.hideshowsearch = true;
              }
              else {
                this.globalservice.hideshowsearch = false;
              }
            }
            break;
        }
      }
      else {
        this.globalservice.hideshowsearch = false;
      }
    });

    if (!(<any>window).isTablet) {
      switch (window.orientation) {
        case 90: // landscape
        case -90:
          {
            //always show on landscape..
            this.globalservice.hideshowsearch = false;
          }
          break;

        case 0: // portrait
        case 180:
          {
            if (parseInt(this.referenceWidth) > screen.width) {
              this.globalservice.hideshowsearch = true;
            }
            else {
              this.globalservice.hideshowsearch = false;
            }
          }
          break;
      }
    }
    else {
      this.globalservice.hideshowsearch = false;
    }

  }
}
