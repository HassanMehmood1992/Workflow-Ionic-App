import { Subscription } from 'rxjs/Subscription';
import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { FormControl } from '@angular/forms';

/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-lookup
Description: Renders lookup data on page.
Location: ./pages/page-lookup
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
 * Importing neccassary liberaries and modules for this class 
 */
import * as moment from 'moment';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { LoadingProvider } from './../../providers/loading/loading';
import { SocketProvider } from './../../providers/socket/socket';
import { ClientDbProcessLookupsDataProvider } from './../../providers/client-db-process-lookups-data/client-db-process-lookups-data';
import { ClientDbProcessLookupObjectsProvider } from './../../providers/client-db-process-lookup-objects/client-db-process-lookup-objects';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Component, ViewChild, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { HelperProvider } from '../../providers/helper/helper';
import { VirtualScroll } from 'ionic-angular/components/virtual-scroll/virtual-scroll';
import { ErrorReportingProvider } from './../../providers/error-reporting/error-reporting';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ChangeEvent, VirtualScrollComponent } from 'angular2-virtual-scroll';
import { InfiniteScrollContent } from 'ionic-angular/components/infinite-scroll/infinite-scroll-content';
import { InfiniteScroll } from 'ionic-angular/components/infinite-scroll/infinite-scroll';

/**
 * Generated class for the LookupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-lookup',
  templateUrl: 'lookup.html',
})
export class LookupPage implements OnInit {

  @ViewChild(Content) content: Content;
  @ViewChild(VirtualScroll) verseList: VirtualScroll;
  @ViewChild(VirtualScrollComponent)
  private virtualScroll: VirtualScrollComponent;

  @ViewChild(InfiniteScrollContent)
  private infiniteScrollComponent: InfiniteScrollContent;
  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;

  processId; // To store ProcessID of current process whose lookups are being loaded
  processTitle; // Title of the process to show in the top navigation bar
  lookupid; // ID of the lookup object for internal reference
  lookuptitle; // Title of the lookup to be displayed in the list item
  availableoffline; // Flag to check if this lookup is offline available
  shownGroup; // Index of expanded list item
  ViewAllDataRoles; // Name of the roles to whom
  FilterQuery; // Filter string to be used to be applied when any filter is being applied on the rows to be retireved
  processLookupDefinition: any; // definition JSON of the process lookup
  cols; // To store process lookup columns
  processLookupData: any; //Process lookup data
  rowsMasterSet: any[];
  rows: any[]; // To store process lookup rows
  columnOptions: any; // to render column according to its type
  errorShown: boolean; // to check for error in rendering lookup data
  descending: boolean = false; // to store sort order of flag for the lookup items
  order: number = 1; // Order to be applied on the lookup items 
  column: string = ''; // to store column name to be displayed as title column in lookup
  sortColumn: string = 'LookupDataID'; // to store column name to be displayed as title column in lookup

  searchControl: FormControl;

  sort; // Global variable of class to store the sort sequence for server call
  searchQuery; // Global variable of class to store filter string for server call
  pageNumber; // Global variable of class to store page number for server call
  noMore; // Global variable of class to store limit for server call
  showLoading; // Global flag to check if the submissions is loading or not
  loadingPage: boolean = false;

  private lookupFetchControl = new FormControl();
  private lookupFetchCtrlSub: Subscription;

  /**
   * Creates an instance of LookupPage.
   * @param {NavController} navCtrl 
   * @param {NavParams} navParams 
   * @param {ClientDbProcessLookupObjectsProvider} clientDbProcessLookupObjectsProvider 
   * @param {ClientDbProcessLookupsDataProvider} clientDbProcessLookupsDataProvider 
   * @param {SocketProvider} socket 
   * @param {ProcessDataProvider} globalservice 
   * @param {StorageServiceProvider} storageServiceProvider 
   * @param {LoadingProvider} loading 
   * @param {AlertController} alertCtrl 
   * @param {HelperProvider} helperProvider 
   * @memberof LookupPage
   */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private clientDbProcessLookupObjectsProvider: ClientDbProcessLookupObjectsProvider,
    private clientDbProcessLookupsDataProvider: ClientDbProcessLookupsDataProvider,
    private socket: SocketProvider,
    public globalservice: ProcessDataProvider,
    private storageServiceProvider: StorageServiceProvider,
    private loading: LoadingProvider,
    private errorReportingProvider: ErrorReportingProvider,
    private alertCtrl: AlertController,
    private helperProvider: HelperProvider,
    private _backNav: BacknavigationProvider) {
    this.processId = navParams.get('processId');
    this.processTitle = navParams.get('processTitle');
    this.lookupid = navParams.get('lookupid');
    this.lookuptitle = navParams.get('lookuptitle');
    this.availableoffline = navParams.get('availableoffline');
    this.ViewAllDataRoles = navParams.get('ViewAllDataRoles');
    this.FilterQuery = navParams.get('FilterQuery');
    this.columnOptions = {};
    this.errorShown = false;
    this.searchControl = new FormControl();
    this.showLoading = false;

    this.lookupFetchCtrlSub = this.lookupFetchControl.valueChanges
    .debounceTime(500)
    .subscribe(newValue => this.doInfinite());
  }

  ionViewDidLoad() {
    this.searchControl.valueChanges.debounceTime(1200).subscribe(search => {
      this._backNav.changeNav(search);
      if (this.availableoffline.toLowerCase() === 'true') {
        this.applyLocalSearchOnItems(search);
      }
      else{
        this.applyServerSearchOnItems(search);
      }
    })
    this.infiniteScrollComponent.loadingSpinner = 'none';
  }

  /**
  * View leaving listener
  */
  ionViewWillLeave() {
    this.globalservice.hideAllFilters = false;
    this.globalservice.toggleSearch = false;
    this.globalservice.sort = false;
    this.globalservice.toggleSort = false;
  }

  toggleSortAndPublish(toggleSort) {
    if (!this.descending) {
      this.sortColumn = this.column;
    }
    else {
      this.sortColumn = 'LookupDataID';
    }
    this.descending = !this.descending;

    if (this.availableoffline.toLowerCase() === 'true') {
      this.applyLocalSortOnItems();
    }
    else{
      this.applyServerSortOnItems();
    }
  }

  applyLocalSearchOnItems(query) {
    this.rows = [];
    if (query != '') {
      for (let i = 0; i < this.rowsMasterSet.length; i++) {
        if (JSON.stringify(this.rowsMasterSet[i]).toLowerCase().includes(query.toLowerCase())) {
          this.rows.push(this.rowsMasterSet[i]);
        }
      }
    }
    else {
      this.rows = this.rowsMasterSet;
    }
  }

  applyServerSearchOnItems(query) {
    if (this.searchQuery != query) {
      if (query.length > 0) {
        this.searchQuery = query;
        this.pageNumber = 0;
        this.noMore = false;
        this.showLoading = true;
        this.fetchLookupValuesFromServer('');
      }
      else if (query.length <= 0 && this.searchQuery.length > 0) {
        this.searchQuery = query;
        this.pageNumber = 0;
        this.noMore = false;
        this.showLoading = true;
        this.fetchLookupValuesFromServer('');
      }
      else {
        this.searchQuery = "";
      }
    }
  }


  applyLocalSortOnItems() {
    let tempRows = this.rows;
    this.rows = [];
    tempRows = [].concat(tempRows || []).sort(this.getSortOrder(this.sortColumn));
    this.rows = tempRows;
  }

  applyServerSortOnItems() {
    if(this.descending){
      this.sort = 'desc';
    }
    else{
      this.sort = 'asc';
    }
    this.pageNumber = 0;
    this.noMore = false;
    this.showLoading = true;
    this.fetchLookupValuesFromServer('');
  }

  getSortOrder(prop) {
    return function (a, b) {
      if (a[prop] > b[prop]) {
        return 1;
      } else if (a[prop] < b[prop]) {
        return -1;
      }
      return 0;
    }
  }

  ngDoCheck() {
    this.content.resize();
  }


    /**
  * Function triggered when user is scrolling on the submissions
  */
  doInfinite() {
    if (this.availableoffline.toLowerCase() === 'false' && !this.noMore) {
      this.loadingPage = true;
      this.fetchLookupValuesFromServer(this.infiniteScroll);
    }
    else {
      this.infiniteScroll.complete();
    }
  }

  protected onListChange(event: ChangeEvent) {
    //this.doInfinite(this.infiniteScroll);
    if (event.end == this.rows.length){
      if (this.availableoffline.toLowerCase() === 'false' && !this.noMore) {
        this.lookupFetchControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
      }
    }
    //this.loading = true;
    // this.fetchNextChunk(this.buffer.length, 10).then(chunk => {
    //   this.buffer = this.buffer.concat(chunk);
    //   this.loading = false;
    // }, () => this.loading = false);
  }

  ngOnInit() {
    var self = this;
    self.clientDbProcessLookupObjectsProvider.getAllProcessLookupObjects().then(() => {
      //if lookup is available offline, get lookupData from localDB else get from server..
      if (self.availableoffline.toLowerCase() === 'true') {
        self.clientDbProcessLookupsDataProvider.getAllProcessLookupsData(parseInt(self.lookupid)).then((response: any) => {
          self.processLookupData = response;
          self.rows = [];
          self.processLookupDefinition = JSON.parse(self.clientDbProcessLookupObjectsProvider.getProcessLookupObject(parseInt(self.lookupid), parseInt(self.processId)).Value);
          self.columnOptions = {};
          for (var o = 0; o < self.processLookupDefinition.ColumnDefinitions.length; o++) {
            if (self.processLookupDefinition.ColumnDefinitions[o].Options.visible) {
              self.columnOptions[self.processLookupDefinition.ColumnDefinitions[o].ShortName] = self.processLookupDefinition.ColumnDefinitions[o].Type;
            }
          }
          for (var i = 0; i < response.length; i++) {
            response[i].Value = JSON.parse(response[i].Value);
            response[i].Value.LookupDataID = response[i].LookupDataID;
            self.rows.push(response[i].Value);
          }
          self.rows = [].concat(self.rows || []).sort(this.getSortOrder(this.sortColumn));
          self.rowsMasterSet = self.rows;
          self.cols = self.processLookupDefinition.ColumnDefinitions;
          self.column = self.processLookupDefinition.ListColumn;
        });
      }
      else if (self.availableoffline.toLowerCase() === 'false') {
        this.pageNumber = 0;
        this.sort = 'asc';
        this.searchQuery = '';
        this.noMore = false;
        this.showLoading = true;

        this.processLookupDefinition = JSON.parse(this.clientDbProcessLookupObjectsProvider.getProcessLookupObject(parseInt(this.lookupid), parseInt(this.processId)).Value);
        this.columnOptions = {};
        for (var o = 0; o < this.processLookupDefinition.ColumnDefinitions.length; o++) {
          if (this.processLookupDefinition.ColumnDefinitions[o].Options.visible) {
            this.columnOptions[this.processLookupDefinition.ColumnDefinitions[o].ShortName] = this.processLookupDefinition.ColumnDefinitions[o].Type;
          }
        }
        
        this.fetchLookupValuesFromServer('');
      }
    });
  }

  fetchLookupValuesFromServer(infiniteScroll) {
    let self = this;
    self.storageServiceProvider.getUser().then((user) => {
      var socketParameters = {
        userToken: user.AuthenticationToken,
        lookupId: self.lookupid,
        processId: self.processId,

        startIndex: self.pageNumber.toString(),
        pageLength: '20',
        searchValue: self.searchQuery,
        sorting: self.sort,

        diagnosticLogging: self.globalservice.processDiagnosticLog.toString(),
        operationType: 'PROCESS'
      };

      if (this.showLoading) {
        self.loading.presentLoading("Loading lookup data...", 20000);
      }
      

      self.socket.callWebSocketService('retrieveProcessLookupData', socketParameters)
        .then((response) => {
          this.loadingPage = false;
          //hide loading
          if (this.showLoading) {
            this.loading.hideLoading();
            this.showLoading = false;
          }
          else if (typeof infiniteScroll != 'string') {
            infiniteScroll.complete();
          }
          if(self.pageNumber == 0){
            self.rows = [];
          }

          if(response.length>0){
            for (let i = 0; i < response.length; i++) {
              if ((response[i].ApprovalStatus.toLowerCase() == 'approved' || response[i].ApprovalStatus.toLowerCase() == 'delete pending approval') && response[i].DateDeleted == '') {
                response[i].Value.LookupDataID = response[i].LookupDataID;
                self.rows.push(response[i].Value)
              }
            }
            self.rowsMasterSet = self.rows;
            self.pageNumber += 20;
            self.virtualScroll.refresh();
          }
          else{
            self.noMore = true;
          }
          
          self.cols = self.processLookupDefinition.ColumnDefinitions;
          self.column = self.processLookupDefinition.ListColumn;
        }).catch((error) => {
          self.loading.hideLoading();
          if (error != 'NoConnection') {
            this.storageServiceProvider.getUser().then((user) => {
              this.errorReportingProvider.logErrorOnAppServer('Lookups Error',
                'Error while loading lookup data',
                user.AuthenticationToken.toString(),
                '0',
                'SubmissionsPage.fetchLookupValuesFromServer(socket.retrieveProcessLookupData)',
                error.message ? error.message : '',
                error.stack ? error.stack : '',
                new Date().toTimeString(),
                'open',
                'Platform',
                '');
            });
          }
        });
    });
  }

  getLookupColumnValue(item, coloption, colshortname) {
    try {
      if (coloption[colshortname] != undefined) {
        if (coloption[colshortname].toLowerCase() == 'text') {
          return item[colshortname];
        }
        else if (coloption[colshortname].toLowerCase() == 'number') {
          return item[colshortname];
        }
        else if (coloption[colshortname].toLowerCase() == 'date') {
          return moment(item[colshortname]).format('DD-MMM-YYYY').toUpperCase();;
        }
        else if (coloption[colshortname].toLowerCase() == 'datetime') {
          return moment(item[colshortname]).format('DD-MMM-YYYY hh:mm A').toUpperCase();
        }
        else if (coloption[colshortname].toLowerCase() == 'time') {
          return moment(item[colshortname]).format('hh:mm A').toUpperCase();
        }
        else if (coloption[colshortname].toLowerCase() == 'peoplepicker') {
          return item[colshortname][0].DisplayName;
        }
        else if (coloption[colshortname].toLowerCase() == 'url') {
          return item[colshortname][0].title;
        }
        else {
          return item[colshortname];
        }

      }
    }
    catch (e) {
      if (!this.errorShown) {
        this.errorReportingProvider.logErrorOnAppServer('Error in getLookupColumnValue tasks',
          'Error while rendering lookupdata in getLookupColumnValue',
          this.globalservice.user.AuthenticationToken.toString(),
          this.globalservice.processId,
          'getLookupColumnValue',
          e.message ? e.message : '',
          e.stack ? e.stack : '',
          new Date().toTimeString(),
          'Open',
          'Platform',
          '');
      }
      this.errorShown = true;
    }
  }


  goBack() {
    this.navCtrl.pop();
  }

}
