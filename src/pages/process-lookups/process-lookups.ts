import { FormControl } from '@angular/forms';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-process-lookups
Description: Renders process lookup list from local database.
Location: ./pages/page-process-lookups
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { Subscription } from 'rxjs/Subscription';
import { LookupPage } from './../lookup/lookup';
import { ClientDbProcessResourcesProvider } from './../../providers/client-db-process-resources/client-db-process-resources';
import { ClientDbProcessLookupObjectsProvider } from './../../providers/client-db-process-lookup-objects/client-db-process-lookup-objects';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { App } from 'ionic-angular/components/app/app';
import { ApplicationTabsPage } from '../tabs-application/ApplicationTabs';



@IonicPage()
@Component({
  selector: 'page-process-lookups',
  templateUrl: 'process-lookups.html',
})
export class ProcessLookupsPage implements OnInit {

  Lookups: any[] = [];//all lookups array

  showOnSortApplied;//show if sort enabled flat
  mysearch: any = '';//search input string
  subscription: Subscription;//subscription service
  @ViewChild(Content) content: Content;//current content ref

  searchControl: FormControl;//search input control

  descending: boolean = false;//descending sort flag
  order: number = 1;//default order number
  column: string = 'LookupID';//column to sort on

  lookupsUpdate: Subscription; // subscription for lookups updates
  processResourcesUpdate: Subscription; // subscription for process resources updates


  /**
  * Default contructor of component.
  */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private globalservice: ProcessDataProvider,
    private clientDbProcessLookupObjectsProvider: ClientDbProcessLookupObjectsProvider,
    private clientDbProcessResourcesProvider: ClientDbProcessResourcesProvider,
    private app: App,
    private _backNav: BacknavigationProvider) {
    this.searchControl = new FormControl();
    this.showOnSortApplied = '';
  }

  /**
  * Navigate to process screen
  */
  gotomyprocess() {
    this.lookupsUpdate.unsubscribe();
    this.processResourcesUpdate.unsubscribe();
    this.globalservice.processId = 0;

    if(this.globalservice.processToast){
      this.globalservice.processToast.dismiss();
    }
    
    this.app.getRootNav().pop().catch((error) => {
      this.app.getRootNav().setRoot(ApplicationTabsPage, { tabIndex: 0 });
    });
  }

  /**
  * Toggle alpha sort
  */
  toggleSortAndPublish(toggleSort) {
    if(!this.descending){
      this.column = 'LookupTitle';
    }
    else{
      this.column = 'LookupID';
    }
    this.descending = !this.descending;
    //this.order = this.descending ? 1 : -1;
  }

  /**
  * Component initialiaztion lifecycle hook
  */
  ngOnInit() {
    this.subscription = this._backNav.navItem$.subscribe(item => {
      this.mysearch = item;
    })

    this.clientDbProcessLookupObjectsProvider.getAllProcessLookupObjects();
    this.clientDbProcessResourcesProvider.getAllProcessResources(this);
  }

  /**
  * Ion view load lifecycle hook.
  */
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

    //observe lookups updates
    this.lookupsUpdate = this.clientDbProcessLookupObjectsProvider.lookupsUpdater$.subscribe(item => {
      this.updateLookups();
    })
    //observe process resources updates
    this.processResourcesUpdate = this.clientDbProcessResourcesProvider.processesUpdater$.subscribe(item => {
      this.updateLookups();
    })
  }


  /**
  * View leaving listener
  */
  ionViewWillLeave() {
    this.globalservice.hideAllFilters = false;
    this.lookupsUpdate.unsubscribe();
    this.processResourcesUpdate.unsubscribe();
  }


  /**
   * Update the lookups from local db
   */
  updateLookups() {
    var newVal = this.clientDbProcessResourcesProvider.getProcessSetting(this.globalservice.processId);
    var LookupPermissions = [];
    this.Lookups = [];
    if (newVal) {
      if (newVal.processUserSettings.Process_User_Permissions) {
        LookupPermissions = newVal.processUserSettings.Process_User_Permissions;
      }
      else if (newVal.processUserSettings.User_Permissions) {
        LookupPermissions = newVal.processUserSettings.User_Permissions;
      }
      var temp = this.clientDbProcessLookupObjectsProvider.getprocessLookupDefinitions(this.globalservice.processId);
      var updatedLP = [];
      if (temp) {
        for (var i = 0; i < temp.length; i++) {

          for (var j = 0; j < LookupPermissions.length; j++) {
            if (LookupPermissions[j].PermissionName === 'View' &&
              LookupPermissions[j].ItemType === 'ProcessLookupObject' &&
              LookupPermissions[j].ID.toString() === temp[i].LookupID.toString()) {
              updatedLP.push(temp[i]);
              break;
            }
          }
        }
      }
      this.Lookups = updatedLP;
    }
  }


  /**
  * View changed detection event
  */
  ngDoCheck() {
    this.content.resize();
  }


  /**
  * Open selected lookup.
  */
  openLookup(lookupid, lookuptitle, availableoffline, ViewAllDataRoles, FilterQuery) {
    this.app.getRootNav().push(LookupPage, { processId: this.globalservice.processId, processTitle: 'testTiTlE', lookupid: lookupid, lookuptitle: lookuptitle, availableoffline: availableoffline, ViewAllDataRoles: ViewAllDataRoles, FilterQuery: FilterQuery });
  }


}
