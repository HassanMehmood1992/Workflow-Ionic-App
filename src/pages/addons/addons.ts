import { FormControl } from '@angular/forms';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-addons
Description: Renders addons list from local database.
Location: ./pages/page-addons
Author: Hassan
Version: 1.0.0
Modification history: 
17-Nov-2017   Hassan    Updating to angular new version
20-Feb-2018   Hassan    Implemented enhancemenet related to availability/permissions of addons
*/

/**
 * Importing neccassary liberaries and modules for this class 
 */
import { ErrorReportingProvider } from './../../providers/error-reporting/error-reporting';
import { Subscription } from 'rxjs/Subscription';
import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { AddonPage } from './../addon/addon';
import { ClientDbProcessObjectsProvider } from './../../providers/client-db-process-objects/client-db-process-objects';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { App } from 'ionic-angular/components/app/app';
import { ApplicationTabsPage } from '../tabs-application/ApplicationTabs';

/**
 * Generated class for the AddonsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
/**
 * 
 * Renders the Addons List view where all addons are listed
 * @export
 * @class AddonsPage
 */
@IonicPage()
@Component({
  selector: 'page-addons',
  templateUrl: 'addons.html',
})
export class AddonsPage {
  @ViewChild(Content) content: Content;

  Addons: any;

  showOnSortApplied;
  mysearch: any = '';
  subscription: Subscription;

  searchControl: FormControl;

  descending: boolean = false;
  order: number = 1;
  column: string = 'AddOnId';

  reportsUpdate: Subscription; // subscription for addons updates

/**
 * Creates an instance of AddonsPage.
 * @param {NavController} navCtrl 
 * @param {NavParams} navParams 
 * @param {ProcessDataProvider} globalservice 
 * @param {ClientDbProcessObjectsProvider} clientDbProcessObjectsProvider 
 * @param {App} app 
 * @param {ErrorReportingProvider} errorReportingProvider 
 * @param {BacknavigationProvider} _backNav 
 * @memberof AddonsPage
 */
constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public globalservice: ProcessDataProvider,
    private clientDbProcessObjectsProvider: ClientDbProcessObjectsProvider,
    private app: App,
    private errorReportingProvider: ErrorReportingProvider,
    private _backNav: BacknavigationProvider) {
      this.searchControl = new FormControl();
      this.showOnSortApplied = '';
  }
  /**
   * 
   * Navigate back to process page on back navigation by user from top navigation
   * @memberof AddonsPage
   */
  gotomyprocess() {
    this.reportsUpdate.unsubscribe();
    this.globalservice.processId = 0;

    if(this.globalservice.processToast){
      this.globalservice.processToast.dismiss();
    }
    
    this.app.getRootNav().pop().catch((error) => {
      this.app.getRootNav().setRoot(ApplicationTabsPage, { tabIndex: 0 });
    });
  }
  toggleSortAndPublish(toggleSort) {
    if(!this.descending){
      this.column = 'Title';
    }
    else{
      this.column = 'AddOnId';
    }
    this.descending = !this.descending;
    // this.descending = !this.descending;
    // this.order = this.descending ? 1 : -1;
  }
  ionViewDidLoad() {
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this._backNav.changeNav(search);
    })
  }

  /**
  * Triggered when the ion view is going to enter
  */
  ionViewWillEnter() {
    this.mysearch = '';
    this.globalservice.toggleSearch = false;
    this.globalservice.sort = false;
    this.globalservice.toggleSort = false;

    //observe workflows updates
    this.reportsUpdate = this.clientDbProcessObjectsProvider.objectsUpdater$.subscribe(item => {
      this.updateAddons();
    })
  }

  /**
  * View leaving listener
  */
  ionViewWillLeave() {
    this.globalservice.hideAllFilters = false;
    this.reportsUpdate.unsubscribe();
  }

  /**
  * Component initialization lifecycle hook
  */
  ngOnInit() {
    this.subscription = this._backNav.navItem$.subscribe(item => {
      this.mysearch = item;
    })
    this.clientDbProcessObjectsProvider.getAllProcessObjects();
  }

  /**
   * Update the addons from local db
   */
  updateAddons(){
    try{
      this.clientDbProcessObjectsProvider.getProcessObjects(this.globalservice.processId, 'ProcessAddOn').then((response: any) => {
        var temp = response;
        this.Addons = [];
        for (var i = 0; i < temp.length; i++) {
            temp[i].visibility = false;
            if(temp[i].AddonHeader.Availability.toLowerCase() == 'mobile' || temp[i].AddonHeader.Availability.toLowerCase() == 'both')
            {
              temp[i].visibility = true;
            }
            temp[i].Title = temp[i].AddonHeader.Title;
            this.Addons.push(temp[i]);
          }
      });
      }
      catch(error)
      {
        this.Addons = [];
        if (error != 'NoConnection') {
          this.errorReportingProvider.logErrorOnAppServer('Addon Error',
            'Error while loading addons',
            this.globalservice.user.AuthenticationToken,
            this.globalservice.processId,
            'Addons.updateAddons',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        }
      }
  }

  ngDoCheck() {
    this.content.resize();
  }

  gotocustompage(addon) {
    this.app.getRootNav().push(AddonPage, { processId: this.globalservice.processId, custompageid: addon.AddOnId, title: addon.AddonHeader.Title });
  };

}
