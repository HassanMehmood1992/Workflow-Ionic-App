import { FormControl } from '@angular/forms';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-pivots
Description: Renders pivots list from local database.
Location: ./pages/page-pivots
Author: Hassan
Version: 1.0.0
Modification history: none
*/


import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { ClientDbProcessObjectsProvider } from './../../providers/client-db-process-objects/client-db-process-objects';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Content } from 'ionic-angular';
import { PivotPage } from '../pivot/pivot';
import { Subscription } from 'rxjs/Subscription';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import { ApplicationTabsPage } from '../tabs-application/ApplicationTabs';


@IonicPage()
@Component({
  selector: 'page-pivots',
  templateUrl: 'pivots.html',
})
export class PivotsPage implements OnInit {
  @ViewChild(Content) content: Content;

  Pivots: any[];//all pivots array

  showOnSortApplied;//flat to show if sort is applied 
  mysearch: any = '';//current search query
  subscription: Subscription;//subscribtion service

  searchControl: FormControl;//control for search input

  descending: boolean = false;//alpha sort flag
  order: number = 1; //current order for array
  column: string = 'ProcessObjectID';//column to sort

  reportsUpdate: Subscription; // subscription for pivots updates

   /**
  * Default contructor of component.
  */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private globalservice: ProcessDataProvider,
    private clientDbProcessObjectsProvider: ClientDbProcessObjectsProvider,
    private app: App,
    private _backNav: BacknavigationProvider,
    private errorReportingProvider: ErrorReportingProvider) {
      this.searchControl = new FormControl();
      this.showOnSortApplied = ''; 
  }
 /**
  * Navigate back to process screen
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

  /**
  * Toggle alpha sorting
  */
  toggleSortAndPublish(toggleSort) {
    if(!this.descending){
      this.column = 'Title';
    }
    else{
      this.column = 'ProcessObjectID';
    }
    this.descending = !this.descending;
    // this.descending = !this.descending;
    // this.order = this.descending ? 1 : -1;
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
      this.updatePivots();
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
  * Ion view load hook
  */
  ionViewDidLoad() {
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this._backNav.changeNav(search);
    })
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
   * Update the pivots from local db
   */
  updatePivots(){
    try{
      this.clientDbProcessObjectsProvider.getProcessObjects(this.globalservice.processId, 'ProcessPivot').then((response: any) => {
        var temp = response;
        this.Pivots = [];
        for (var i = 0; i < temp.length; i++) {
            temp[i].visibility = false;
            if(temp[i].Availability.toLowerCase() == 'mobile' || temp[i].Availability.toLowerCase() == 'both')
            {
              temp[i].visibility = true;
            }
            this.Pivots.push(temp[i]);
          }
      });
    }
    catch(error)
    {
      this.Pivots = [];
      if (error != 'NoConnection') {
        this.errorReportingProvider.logErrorOnAppServer('Pivots Error',
          'Error while loading pivots',
          this.globalservice.user.AuthenticationToken,
          this.globalservice.processId,
          'Pivots.updatePivots',
          error.message ? error.message : '',
          error.stack ? error.stack : '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');
      }
    }
  }

  /**
  * View change lifecycle hook
  */
  ngDoCheck() {
    this.content.resize();
  }

  /**
  * Move to pivot clicked
  */
  goToPivot(pivot) {
 
    this.app.getRootNav().push(PivotPage, { reportId: pivot.ProcessObjectID, reportTitle: pivot.Title, processId: this.globalservice.processId });
  };

  /**
  * Component destroy lifecycle hook.
  */
  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.subscription.unsubscribe();
  }

}
