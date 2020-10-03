import { VirtualScroll } from 'ionic-angular/components/virtual-scroll/virtual-scroll';
import { LookupSearchPipe } from './../../pipes/lookup-search/lookup-search';
import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { LookupSortFilterPipe } from './../../pipes/search-filter/search-filter';
import { FormControl } from '@angular/forms';
import { ChangeEvent } from 'angular2-virtual-scroll';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-app-process-lookup-popup
Description: Renders process lookup popup and logic. Uses local databse call to retrieve lookup data or socket call if lookup data is not available locally .
Location: ./pages/page-app-process-lookup-popup
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
 * Importing neccassary liberaries and modules for this class 
 */
import { LoadingProvider } from './../../providers/loading/loading';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { SocketProvider } from './../../providers/socket/socket';
import { ProcessFormProvider } from './../../providers/process-form/process-form';
import { ClientDbProcessLookupsDataProvider } from './../../providers/client-db-process-lookups-data/client-db-process-lookups-data';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Content } from 'ionic-angular';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';

/**
 * Generated class for the AppProcessLookupPopupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
/**
 * 
 * Implements Process lookup class to render process lookup on form
 * Fetches data of process lookup from local DB and if not found then calls API to fetch data from Server API
 * @export
 * @class AppProcessLookupPopupPage
 */
@IonicPage()
@Component({
  selector: 'page-app-process-lookup-popup',
  templateUrl: 'app-process-lookup-popup.html',
})
export class AppProcessLookupPopupPage {
  
  public isselected; // To check if process lookup is selected on the form
  public data; // To return 
  public lookupData: any[]; //  To store lookup data
  public rows: any[]; // To mention rows needs to be fetched by process lookup
  public cols: any[]; // To store cols needs to be fetched by process lookup
  public columnHeadings: any[]; // Column headings of the retireved data in process lookup
  public isAllSelected: boolean; // Flag to check if user has selected all items in the lookup dialog
  public tempNgModel: any[]; // Model to bind selected data with
  public pageNumber: number; // To set page number in the processlookup dialog
  public searchString: string; // String to mention if any specific items are required to be fetched form the lookup
  public sortKey: any;  // { "Title": "asc"}; mention sort string to sort the data that it fetches
  public sortObjectAscending: any; // { "ProcessObjectID": "asc" }; To sort the returned object 
  public replacedFilterString: string; // To store updated filter string to use 
  public replacedLookupColumns: string; // To store lookup colunms to fetch from local DB
  public processId: string; // To store which processid will be used to fetch lookup items
  public workflowId: string; // To store from which workflowid lookup needs to be fetched
  public peoplePickerColumns: any; // If lookup dialog needs to be display any people picker columns then list them here
  public loadingRecords: boolean; // Flag to check if records are still being loaded
  public reverse:boolean; // To reverse the selection of the user
  public sortcol; // to store sort columns of the lookup columns
  public sorttype; // to store sort type of the lookup columns
  public order;  // order of the items in process lookup
  public displaycols; // List of columns will be dislays
  replacedFilterStringMobile: string; // To store filter string for mobile
  replacedLookupColumnsMobile: string; // To store lookup columns for mobile
  private lookupFetchControl = new FormControl();
  rowsMasterSet: any[]; // for search queries 
  searchControl: FormControl;
  lookupsearchpipe: LookupSearchPipe;
  replacedSortString;
  @ViewChild(VirtualScroll) vs: VirtualScroll;
  @ViewChild(Content) content: Content;
  /**
   * Creates an instance of AppProcessLookupPopupPage.
   * @param {LoadingProvider} loading 
   * @param {ProcessDataProvider} globalservice 
   * @param {SocketProvider} socket 
   * @param {NavController} navCtrl 
   * @param {ProcessFormProvider} processFormService 
   * @param {ViewController} viewCtrl 
   * @param {NavParams} navParams 
   * @param {ClientDbProcessLookupsDataProvider} ClientDBProcessLookupsData 
   * @param {ErrorReportingProvider} errorReportingProvider 
   * @memberof AppProcessLookupPopupPage
   */
  constructor(private _backNav: BacknavigationProvider, private loading: LoadingProvider,public globalservice: ProcessDataProvider, private socket: SocketProvider, public navCtrl: NavController, private processFormService: ProcessFormProvider, public viewCtrl: ViewController, public navParams: NavParams, public ClientDBProcessLookupsData: ClientDbProcessLookupsDataProvider, private errorReportingProvider: ErrorReportingProvider) {
    this.data = this.navParams.get("data");
    this.lookupsearchpipe = new LookupSearchPipe();
    this.rows = [];
    this.cols = [];
    this.columnHeadings = [];
    this.lookupData = [];
    this.tempNgModel = [];
    this.pageNumber = 1;
    this.searchString = "";
    this.sortKey = "";
    this.replacedFilterString = "";
    this.replacedLookupColumns = "";
    this.sortcol = "";
    this.sorttype = "";
    this.reverse = false;
    this.order = 1;
    this.replacedSortString = "";

    this.replacedFilterStringMobile = "";
    this.replacedLookupColumnsMobile = "";

    this.peoplePickerColumns = [];
    this.loadingRecords = true;
    this.displaycols = [];
    
    this.isselected = false;
    this.searchControl = new FormControl();
  }

/**
 * 
 * Default method to check if view is rendered
 * @memberof AppProcessLookupPopupPage
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
    if(col.type.toLowerCase() == 'peoplepicker'  && col.columnHeading != undefined )
    {
      this.sorttype = 'peoplepicker';
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
    var i;
    self.data = self.navParams.get("data");
    self.validateLookupDetails();
    let sortStringMobile = self.replacedSortString;
    self.ClientDBProcessLookupsData.getProcessLookupFormData(self.data.lookupDetails.lookupName, parseInt(self.processId), self.replacedLookupColumnsMobile, self.replacedFilterStringMobile, sortStringMobile)
      .then((result: any) => {
        if (result.length>0) // local DB call 
        {
          self.rows = []
          for (i = 0; i < result.length; i++) {
            for (var key in result[i]) {
              if (self.isJson(result[i][key])) {
                result[i][key] = JSON.parse(result[i][key])
              }
            }
            if ((self.data.lookupDetails.ngModel.indexOf((<any>Object).values(result[i])[0])) != -1) {
              result[i]["isChecked"] = true;
              self.tempNgModel.push(result[i][self.cols[0].columnName]);
            }
            else {
              result[i]["isChecked"] = false;
            }
          }
          self.rows = result;
          self.rowsMasterSet = result;
          
        }
        else { // server call 
          var params = {
            userToken: self.globalservice.user.AuthenticationToken,
            processId: self.processId,
            workflowId: self.workflowId,
            lookupTitle: self.data.lookupDetails.lookupName,
            lookupColumns: self.replacedLookupColumns,
            conditionalStatement: self.replacedFilterString,
            sortQuery: "",
            diagnosticLogging: self.globalservice.processDiagnosticLog.toString(),
            operationType : 'PROCESS'
          }
          self.loading.presentLoading('Loading lookup data ...',20000)
          var DirectoryResult = self.socket.callWebSocketService('retrieveProcessLookupFormData', params);
          DirectoryResult.then((result) => {
            self.rows = []
            self.loading.hideLoading()
            try {
              for ( i = 0; i < result.LookupValues.length; i++) {
                if ((self.data.lookupDetails.ngModel.indexOf((<any>Object).values(result.LookupValues[i])[0])) != -1) {
                  result.LookupValues[i]["isChecked"] = true;
                   self.tempNgModel.push(result.LookupValues[i][self.cols[0].columnName]);
                }
                else {
                  result.LookupValues[i]["isChecked"] = false;
                }
              }
              self.rows = result.LookupValues;
              self.rowsMasterSet = result.LookupValues;
            }
            catch(e)
            {
              alert('Error while processing lookup data')
            }
          }).catch(error => {
            self.loading.hideLoading();
            if (error != 'NoConnection') {
              self.errorReportingProvider.logErrorOnAppServer('error in process lookup',
                'Error in retrieving process lookup',
                self.globalservice.user.AuthenticationToken,
                self.processId,
                'retrieveProcessLookupFormData',
                error.message ? error.message : '',
                error.stack ? error.stack : '',
                new Date().toTimeString(),
                'open',
                'Platform',
                '');
            }
          });

        }
      })
  }
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
      if (this.cols[0].type.toLowerCase() == 'peoplepicker') {
        if (row.isChecked) {
          this.tempNgModel.push(row[this.cols[0].columnName].DisplayName);
        }
        else {
          this.tempNgModel.splice(this.tempNgModel.indexOf(row[this.cols[0].columnName].DisplayName), 1);
        }
      }
      else {
        if (row.isChecked) {
          this.tempNgModel.push(row[this.cols[0].columnName]);
        }
        else {
          this.tempNgModel.splice(this.tempNgModel.indexOf(row[this.cols[0].columnName]), 1);
        }
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

  validateLookupDetails() {
    try {
      this.cols = this.data.lookupDetails.lookupColumns;
      var i;
      this.replacedLookupColumns = "";
      for (let i: number = 0; i < this.data.lookupDetails.lookupColumns.length; i++) {
        if (this.data.lookupDetails.columnTypes[i].toLowerCase() == "peoplepicker") {
          this.replacedLookupColumns += "(SELECT * FROM OPENJSON(PLD.Value) WITH( [" + this.data.lookupDetails.lookupColumns[i] + "]  nvarchar(MAX)  AS JSON )) as " + this.data.lookupDetails.lookupColumns[i] + ",";
        }
        else {
          this.replacedLookupColumns += "JSON_VALUE(PLD.Value,'$." + this.data.lookupDetails.lookupColumns[i] + "') as " + this.data.lookupDetails.lookupColumns[i] + ",";
        }
      }
      this.replacedLookupColumns = this.replacedLookupColumns.substr(0, this.replacedLookupColumns.length - 1);

      this.replacedLookupColumnsMobile = "";
      for (let i: number = 0; i < this.data.lookupDetails.lookupColumns.length; i++) {

        this.replacedLookupColumnsMobile += "JSON_EXTRACT(PLD.Value,'$." + this.data.lookupDetails.lookupColumns[i] + "') as " + this.data.lookupDetails.lookupColumns[i] + ",";
      }
      this.replacedLookupColumnsMobile = this.replacedLookupColumnsMobile.substr(0, this.replacedLookupColumnsMobile.length - 1);

      this.columnHeadings = this.data.lookupDetails.columnHeadings;

      let tempColumns = this.cols;
      this.cols = [];
      for ( i = 0; i < tempColumns.length; i++) {
        let obj = {};
        obj["columnHeading"] = this.columnHeadings[i];
        obj["columnName"] = tempColumns[i];
        obj["sortString"] = "";
        obj["sortArrow"] = "";
        obj["type"] = this.data.lookupDetails.columnTypes[i].toLowerCase();
        this.cols.push(obj);
      }
      for (i = 0; i < tempColumns.length && i < this.columnHeadings.length; i++) {
        let obj = {};
        obj["columnHeading"] = this.columnHeadings[i];
        obj["columnName"] = tempColumns[i];
        obj["sortString"] = "";
        obj["sortArrow"] = "";
        obj["type"] = this.data.lookupDetails.columnTypes[i].toLowerCase();
        this.displaycols.push(obj);
      }

      //check if filter string needs data from FormData
      this.replacedFilterString = this.data.lookupDetails.filterString;
      if (this.data.lookupDetails.filterString.indexOf('#') != -1) {
        if (typeof this.data.lookupDetails.formDataJSON != "undefined") {
          for (let key in this.data.lookupDetails.formDataJSON) {
            let value = this.data.lookupDetails.formDataJSON[key];
            if (this.data.lookupDetails.filterString.indexOf("#" + key) != -1) {
              this.replacedFilterString = this.data.lookupDetails.filterString.replace("#" + key, value);
            }
          }
        }
      }
      this.replacedFilterStringMobile = this.replacedFilterString.replace(/JSON_VALUE/g, "JSON_EXTRACT")

      this.replacedSortString = "";
      for(let i:number= 0;i<this.data.lookupDetails.sortString.length;i++){
      let tempSortString = this.data.lookupDetails.sortString[i].trim();
      if(tempSortString != ""){
      let tempSortStringArray = tempSortString.split(":");
      this.replacedSortString = " order by "; 
      this.replacedSortString += "JSON_EXTRACT(PLD.Value,'$."+tempSortStringArray[0]+"') "+ tempSortStringArray[1] + ",";
      }
      }
      this.replacedSortString = this.replacedSortString.substr(0, this.replacedSortString.length-1);
      

      if(typeof this.data.lookupDetails.processId != "undefined"){
        this.processId = this.data.lookupDetails.processId;
        }
        else{
        this.processId = "2";
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
  ionViewDidLoad() {
    this.searchControl.valueChanges.debounceTime(1200).subscribe(search => {

      this.rows = [];
        this.applyLocalSearchOnItems(search);
        this.sortcol = "";
      })

  }
  applyLocalSearchOnItems(query) {
    
    if (query != '') {
      // for (let i = 0; i < this.rowsMasterSet.length; i++) {
      //   if (JSON.stringify(this.rowsMasterSet[i]).toLowerCase().includes(query.toLowerCase())) {
      //     this.rows.push(this.rowsMasterSet[i]);
      //   }
      // }
      var temp = this.rowsMasterSet;
      temp = this.lookupsearchpipe.transform(temp,query,this.displaycols)
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
}
