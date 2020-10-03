import { VirtualScroll } from 'ionic-angular/components/virtual-scroll/virtual-scroll';
import { LookupSearchPipe } from './../../pipes/lookup-search/lookup-search';
import { FormControl } from '@angular/forms';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-app-process-dblookup-popup
Description: Renders database lookup popup and logic. Uses socket call to retrieve database data.
Location: ./pages/page-app-process-dblookup-popup
Author: Hassan
Version: 1.0.0
Modification history: 
24-Nov-2017   Hassan    Updated to angular new version from AngularJS
16-Jan-2018   Hassan    Updated dblookup usage in form for new attribute support
*/

/**
 * Importing neccassary liberaries and modules for this class 
 */
import { ProcessFormProvider } from './../../providers/process-form/process-form';
import { ClientDbProcessLookupsDataProvider } from './../../providers/client-db-process-lookups-data/client-db-process-lookups-data';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { SocketProvider } from './../../providers/socket/socket';
import { LoadingProvider } from './../../providers/loading/loading';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Content } from 'ionic-angular';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';

/**
 * Generated class for the AppProcessDblookupPopupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

/**
 * 
 * Impolements Lookup dialog that takes columns to fetch local DB and if not available then fetch from Server API
 * @export
 * @class AppProcessDblookupPopupPage
 */
@IonicPage()
@Component({
  selector: 'page-app-process-dblookup-popup',
  templateUrl: 'app-process-dblookup-popup.html',
})
export class AppProcessDblookupPopupPage {

/**
 * Declaration of global variables to be used in this class
 * 
 * @memberof AppProcessDblookupPopupPage
 */
  public isselected; //To check if user has selected an item
  public data;  // To store selected items 
  public lookupData: any[]; // To store lookup items retrieved from server
  public rows: any[]; // To use for storing item rows
  public cols: any[]; // To use for storing columns in db lookup
  public columnHeadings: any[]; // Column headings of the db lookup
  public isAllSelected: boolean; // Check if user has selected all items in the lookup dialog
  public tempNgModel: any[]; // To store selected data in a temporary model
  public pageNumber: number; // To mention pageNumbers in the db lookup dialog
  public searchString: string; // Use to apply search on db lookup
  public sortKey: any;  // { "Title": "asc"}; To store what sort has been applied
  public sortObjectAscending: any; // { "ProcessObjectID": "asc" }; 
  public replacedFilterString: string; // To store filter string for local DB
  public replacedLookupColumns: string; // To store lookup columns to use in mobile
  public processId: string; // To mention processID from where data needs to be retrieved
  public workflowId: string; // To mention workflow id from where data will be retrieved
  public peoplePickerColumns: any; // To store if any people picker columns required to be retrieved
  public loadingRecords: boolean; // Flag to show progress if recrods are being loaded
  replacedFilterStringMobile: string; // To store filter string for mobile
  replacedLookupColumnsMobile: string; // To store lookup columns for mobile
  public reverse:boolean; // Flag to check if user has applied any sorting on the items visible in the DB lookup
  public sortcol; // to store sort columns of the lookup columns
  public sorttype; // to store sort type of the lookup columns
  public order; // order of the items in process lookup
  public displaycols; // List of columns will be dislays
  searchControl: FormControl;
  lookupsearchpipe: LookupSearchPipe
  rowsMasterSet: any[]; // for search queries 
  @ViewChild(VirtualScroll) vs: VirtualScroll;
  @ViewChild(Content) content: Content;


  /**
   * Creates an instance of AppProcessDblookupPopupPage.
   * @param {LoadingProvider} loading 
   * @param {ProcessDataProvider} globalservice 
   * @param {SocketProvider} socket 
   * @param {NavController} navCtrl 
   * @param {ProcessFormProvider} processFormService 
   * @param {ViewController} viewCtrl 
   * @param {NavParams} navParams 
   * @param {ClientDbProcessLookupsDataProvider} ClientDBProcessLookupsData 
   * @param {ErrorReportingProvider} errorReportingProvider 
   * @memberof AppProcessDblookupPopupPage
   */
  constructor(private loading: LoadingProvider, public globalservice: ProcessDataProvider, private socket: SocketProvider, public navCtrl: NavController, private processFormService: ProcessFormProvider, public viewCtrl: ViewController, public navParams: NavParams, public ClientDBProcessLookupsData: ClientDbProcessLookupsDataProvider, private errorReportingProvider: ErrorReportingProvider) {
    this.data = this.navParams.get("data");
    this.rows = [];
    this.cols = [];
    this.lookupsearchpipe = new LookupSearchPipe();
    this.columnHeadings = [];
    this.lookupData = [];
    this.tempNgModel = [];
    this.pageNumber = 1;
    this.searchString = "";
    this.sortKey = "";
    this.replacedFilterString = "";
    this.replacedLookupColumns = "";

    this.replacedFilterStringMobile = "";
    this.replacedLookupColumnsMobile = "";

    this.peoplePickerColumns = [];
    this.loadingRecords = true;

    this.sortcol = "";
    this.sorttype = "";
    this.reverse = false;
    this.order = 1;
    this.isselected = false;
    this.searchControl = new FormControl();
  }

/**
 * 
 * Default Ionic funtion call when view is loaded.
 * @memberof AppProcessDblookupPopupPage
 */

  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  toggleSort(col)
  {
    if(col.type == 'peoplePicker'  && col.columnHeading != undefined )
    {
      this.sorttype = 'peoplePicker';
    }
    else
    {
      this.sorttype = "";
    }
    this.sortcol = col.columnName;
    this.reverse = !this.reverse;
    this.order = this.reverse ? 1 : -1;
    this.applyLocalSortOnItems();
  }
  ngOnInit() {
    var self = this;
    this.data = this.navParams.get("data");
    this.validateLookupDetails();
    var params = {
      userToken: this.globalservice.user.AuthenticationToken,
      processId: this.processId,
      workflowId: this.workflowId,
      conditionalStatement: this.data.lookupDetails.query,
      diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
      operationType : 'PROCESS'
    }
    this.loading.presentLoading('Loading lookup data ...',20000)
    this.socket.callWebSocketService('retrieveDbLookupFormData', params).then((result) => {
      try
      {
        this.loading.hideLoading()
        if (result.length > 0) // local DB call to check if any items are returned
        {
          for (var i = 0; i < result.length; i++) {
            for (var key in result[i]) {
              if (self.isJson(result[i][key])) {
                result[i][key] = JSON.parse(result[i][key])
              }
            }
            if ((this.data.lookupDetails.ngModel.indexOf((<any>Object).values(result[i])[0])) != -1) {
              result[i]["isChecked"] = true;
            }
            else {
              result[i]["isChecked"] = false;
            }
          }
          self.rows = result;
          self.rowsMasterSet = result;
        }
      }
      catch(e)
      {
        
      }
      }).catch(error => {
        this.loading.hideLoading()
        if (error != 'NoConnection') {
          this.errorReportingProvider.logErrorOnAppServer('retrieveDbLookupFormData',
            'Error in retrieveDbLookupFormData',
            this.globalservice.user.AuthenticationToken,
            this.processId,
            'retrieveDbLookupFormData',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        }
    });
  }
  /**
   * 
   * Populate Lookup item values after retrieval
   * @param {any} row 
   * @memberof AppProcessDblookupPopupPage
   */
  setLookupValues(row) {
    if (this.data.lookupDetails.selectionType == 'single') {
      this.data.lookupDetails.ngModel = [];
      this.data.lookupDetails.ngModel.push(row[this.cols[0].columnName]);
      this.setFormFields(row);
      let response = {};
      response["modelValue"] = this.data.lookupDetails.ngModel;
      response["modelRow"] = row;
      this.viewCtrl.dismiss(response);
    }
    else {
      row.isChecked = !row.isChecked;
      if (row.isChecked) {
        this.tempNgModel.push(row[this.cols[0].columnName]);
      }
      else {
        this.tempNgModel.splice(this.tempNgModel.indexOf(row[this.cols[0].columnName]), 1);
      }

      if (this.isAllSelected && row.isChecked) { }
      else {
        this.isAllSelected = false;
      }
    }

  }
  toggleselected() {
    if (this.isselected) {
      this.isselected = false;
    }
    else {
      this.isselected = true;
    }

  }
  selectAll(evt) {
    this.isAllSelected = evt;
    let toggleStatus = this.isAllSelected;
    if (this.isAllSelected) {
      for (let i: number = 0; i < this.rows.length; i++) {
        this.rows[i].isChecked = toggleStatus;
        this.tempNgModel.push(this.rows[i][this.cols[0].columnName]);
      }
    }
    else {
      for (let i: number = 0; i < this.rows.length; i++) {
        this.rows[i].isChecked = toggleStatus;
        this.tempNgModel.splice(this.tempNgModel.indexOf(this.rows[i][this.cols[0].columnName]), 1);
      }
    }
  }
  confirmSelection() {
    this.data.lookupDetails.ngModel = [];
    let modelValues = [];
    let modelRows = [];
    for (let i: number = 0; i < this.rows.length; i++) {
      if (this.rows[i].isChecked) {
        modelRows.push(this.rows[i]);
        modelValues.push(this.rows[i][this.cols[0].columnName]);
      }
    }
    let response = {};
    response["modelValue"] = modelValues;
    response["modelRow"] = modelRows;
    this.viewCtrl.dismiss(response);
  }

  clearSelection() {
    this.data.lookupDetails.ngModel = "";
    for (let i: number = 0; i < this.rows.length; i++) {
      if (this.rows[i].isChecked) {
        this.rows[i].isChecked = false;
      }
    }
    this.viewCtrl.dismiss(this.data.lookupDetails.ngModel);
  }
  setFormFields(row) {
    if (this.data.lookupDetails.formDataJSON != undefined) {
      if (this.data.lookupDetails.formFields != undefined) {
        if (this.data.lookupDetails.formFields.length > 0) {
          let tempFormFields = this.data.lookupDetails.formFields;
          for (let i: number = 0; i < tempFormFields.length; i++) {
            this.data.lookupDetails.formDataJSON[tempFormFields[i]] = row[this.cols[i].columnName];
          }
        }
      }
    }
    this.processFormService.setFormData(this.data.lookupDetails.formDataJSON);
  }
  
/**
 * 
 * Validate Lookup column names and heading before displaying them
 * @memberof AppProcessDblookupPopupPage
 */
validateLookupDetails() {
    try {
      this.cols = this.data.lookupDetails.columnNames;
      this.columnHeadings = this.data.lookupDetails.columnHeadings;

      let tempColumns = this.cols;
      this.cols = [];
      for (var i = 0; i < tempColumns.length; i++) {
        let obj = {};
        obj["columnHeading"] = this.columnHeadings[i];
        obj["columnName"] = tempColumns[i];
        obj["sortString"] = "";
        obj["sortArrow"] = "";
        obj["type"] = this.data.lookupDetails.columnTypes[i].toLowerCase();
        this.cols.push(obj);
      }

      //check if filter string needs data from FormData
      this.replacedFilterString = this.data.lookupDetails.query;
      if (this.data.lookupDetails.query.indexOf('#') != -1) {
        if (typeof this.data.lookupDetails.formDataJSON != "undefined") {
          for (let key in this.data.lookupDetails.formDataJSON) {
            let value = this.data.lookupDetails.formDataJSON[key];
            if (key != "" && this.data.lookupDetails.query.indexOf("#" + key) != -1) {
              this.replacedFilterString = this.replacedFilterString.replace("#" + key, value);
            }
          }
        }
      }

      if (typeof this.data.lookupDetails.formDataJSON != "undefined") {
        this.processId = this.data.lookupDetails.formDataJSON["ProcessID"];
        this.workflowId = this.data.lookupDetails.formDataJSON["WorkflowID"];
      }
    }
    catch (err) {
    }
  }
  // virtual scroll setups
  applyLocalSortOnItems() {
    let tempRows = this.rows;
    this.rows = [];
    tempRows = [].concat(tempRows || []).sort(this.getSortOrder(tempRows,{property: this.sortcol, order: this.order, type: this.sorttype}));
    this.rows = tempRows;
  }
  applyLocalSearchOnItems(query) {
    
    if (query != '') {
      // for (let i = 0; i < this.rowsMasterSet.length; i++) {
      //   if (JSON.stringify(this.rowsMasterSet[i]).toLowerCase().includes(query.toLowerCase())) {
      //     this.rows.push(this.rowsMasterSet[i]);
      //   }
      // }
      var temp = this.rowsMasterSet;
      temp = this.lookupsearchpipe.transform(temp,query,this.cols)
      this.rows = temp.length > 0 ? temp : []

      console.log(this.rows)
      this.content.scrollTo(0,0,0);
      this.vs.scrollUpdate({scrollTop:0} as any)
    }
    else {
      this.rows = this.rowsMasterSet;
    }
  }
  getSortOrder(array,args)
  {
    if(array){
      if(args.type)
      {
        //for people picker 
        if(args.type.toLowerCase() == 'peoplepicker')
        {
          return function(a, b){
            //filter based on display name
          if(a[args.property][0]["DisplayName"] < b[args.property][0]["DisplayName"]){
              return -1 * args.order;
            }
            else if( a[args.property][0]["DisplayName"] > b[args.property][0]["DisplayName"]){
                return 1 * args.order;
            }
            else{
                return 0;
            }
          };
        }
        else
        {
          //sort based on type if not people picker
          return function(a, b){
          if(a[args.property] < b[args.property]){
              return -1 * args.order;
          }
          else if( a[args.property] > b[args.property]){
              return 1 * args.order;
          }
          else{
              return 0;
          }
        };
        }
      }
      else
      {
        //sort based on type
        return function(a, b){
          if(a[args.property] < b[args.property]){
              return -1 * args.order;
          }
          else if( a[args.property] > b[args.property]){
              return 1 * args.order;
          }
          else{
              return 0;
          }
        };
      }
    }
  }
  ionViewDidLoad() {
    this.searchControl.valueChanges.debounceTime(1200).subscribe(search => {

      this.rows = [];
        this.applyLocalSearchOnItems(search);
        this.sortcol = "";
      })

  }
}
