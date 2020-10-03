import { FormControl } from '@angular/forms';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-reports
Description: Renders reports list from local database.
Location: ./pages/page-reports
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { Subscription } from 'rxjs/Subscription';
import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { ClientDbProcessObjectsProvider } from './../../providers/client-db-process-objects/client-db-process-objects';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Content } from 'ionic-angular';
import { ReportPage } from '../report/report';
import { ApplicationTabsPage } from '../tabs-application/ApplicationTabs';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';

/**
 * Generated class for the ReportsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reports',
  templateUrl: 'reports.html',
})
export class ReportsPage {
  Reports: any[]; // Global variable of class to store reports for the current process
  showOnSortApplied; // Global flag to show if sorting is applied or not
  mysearch: any = ''; // Global variable of class to store the query search
  subscription: Subscription; // Global variable of class to store subscription
  @ViewChild(Content) content: Content; // Global variable of class to store content of the page
  searchControl: FormControl; // Global variable of class to store form control for the search query
  descending: boolean = false; // Global flag to check if the sorting is descending or ascending
  order: number = 1; // Global variable of class to store order
  column: string = 'ProcessObjectID'; // Global variable of class to store column for sorting

  reportsUpdate: Subscription; // subscription for reports updates

  /**
  * Class constructor
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
  * Navigate the current user to my processes
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
  * Toggle sort and publish for the current view
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
  * The initialize function for reports component
  */
  ngOnInit() {
    this.subscription = this._backNav.navItem$.subscribe(item => {
      this.mysearch = item;
    })

    this.clientDbProcessObjectsProvider.getAllProcessObjects();
  }

  /**
  * register for search event
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

    //observe workflows updates
    this.reportsUpdate = this.clientDbProcessObjectsProvider.objectsUpdater$.subscribe(item => {
      this.updateReports();
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
   * Update the reports from local db
   */
  updateReports() {
    try {
      this.clientDbProcessObjectsProvider.getProcessObjects(this.globalservice.processId, 'ProcessReport').then((response: any) => {
        var temp = response;
        this.Reports = [];
        for (var i = 0; i < temp.length; i++) {
          temp[i].visibility = false;
          if (temp[i].Availability.toLowerCase() == 'mobile' || temp[i].Availability.toLowerCase() == 'both') {
            temp[i].visibility = true;
          }
          this.Reports.push(temp[i]);
        }
      });
    }
    catch (error) {
      this.Reports = [];
      if (error != 'NoConnection') {
        this.errorReportingProvider.logErrorOnAppServer('Reports Error',
          'Error while loading reports',
          this.globalservice.user.AuthenticationToken,
          this.globalservice.processId,
          'Reports.ionViewDidEnter',
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
  * Navigate the user to reports tab
  */
  goToReoprt(report) {
    this.app.getRootNav().push(ReportPage, { reportId: report.ProcessObjectID, reportTitle: report.Title, processId: this.globalservice.processId });
  };


  /**
  * Triggered when the context is resized
  */
  ngDoCheck() {
    this.content.resize();
  }

}
