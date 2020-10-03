import { SocketProvider } from './../../providers/socket/socket';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-report
Description: Renders report html and report logic.
Location: ./pages/page-report
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { ErrorReportingProvider } from './../../providers/error-reporting/error-reporting';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { LoadingProvider } from './../../providers/loading/loading';
import { Component, ViewChild, ViewContainerRef, NgModule, Compiler } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Content, ModalController } from 'ionic-angular';
import { FormsModule } from '@angular/forms';
import * as ts from "typescript";
import { AppModule } from '../../app/app.module';

declare var $; // Global variable of class to store JQuery variable from jquery.min.js
import 'datatables.net/js/jquery.dataTables.js';
import { FormPage } from '../form/form';
import { App } from 'ionic-angular/components/app/app';
let reportObject: Report; // Global variable of class to store current report object

/**
 * Generated class for the ReportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
})
export class ReportPage {
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef; // Global variable of class to store the current container view
  reportId: any; // Global variable of class to store the current rport Id
  reportTitle: any; // Global variable of class to store the current rport title
  processId: any; // Global variable of class to store the current process id
  dataFilter: Boolean = true; // Global flag to check data filter in the reports

  descending: boolean = false; 

  /**
  * Class constructor
  */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private storageServiceProvider: StorageServiceProvider,
    private loading: LoadingProvider,
    private socket: SocketProvider,
    private alertCtrl: AlertController,
    private compiler: Compiler,
    private modal: ModalController,
    private errorReportingProvider: ErrorReportingProvider,
    private processDataProvider: ProcessDataProvider,
    private app: App) {
    this.reportId = navParams.get('reportId');
    this.reportTitle = navParams.get('reportTitle');
    this.processId = navParams.get('processId');
  }

  /**
  * Navigate the user back from the reports tab
  */
  goBack() {
    this.navCtrl.pop();
  }

  /**
  * Return a message if the data shown is security trimmed
  */
  showDataFilterMessage() {
    this.alertCtrl.create({
      title: 'Data Filter in Effect',
      subTitle: 'Displayed data is security trimmed as per your authorizations.',
      buttons: [
        {
          text: 'Close',
          role: 'Close',
          handler: () => {
          }
        }
      ]
    }).present();
  }

  toggleSortAndPublish(toggleSort) {
    this.descending = !this.descending;
    if(reportObject.sorting == 'desc'){
      reportObject.sorting = 'asc';
    }
    else{
      reportObject.sorting = 'desc';
    }
    reportObject.dataTableObject.order( [ 0, 'asc' ] ).draw();
  }

  ngDoCheck(){
    $(".dtr-data").each(function () {
      if ($(this).html().trim().indexOf("[object Object]") != -1) {
        $(this).html("<a style='cursor:pointer;'>View</a>")
      }
    })
  }

  /**
  * The initialize function for report component
  */
  ngOnInit() {
    this.storageServiceProvider.getUser().then((user) => {
      var socketParameters = {
        userToken: user.AuthenticationToken,
        processId: this.processId,
        processReportId: this.reportId.toString(),
        queryString: '',
        diagnosticLogging: this.processDataProvider.processDiagnosticLog.toString(),
        startIndex: "0",
        pageLength: "0",
        searchValue: '',
        sorting: 'asc',
        operationType: 'PROCESS'
      };
      this.loading.presentLoading("Retrieving report data...", 30000);
      //Called when the process report data is retrieved
      this.socket.callWebSocketService('retrieveProcessReportData', socketParameters)
        .then((result) => {
          this.loading.hideLoading();
          try {
            if ((result !== '' || result !== 'NoConnection') && typeof result === 'object') {

              if (result.AllDataAccess === 1) {//data not trimmed
                this.dataFilter = false;
              }

              if (result.Definition !== 'NoPermission') {

                let reportObjectJSON = result;
                reportObject = new Report(reportObjectJSON, this.modal, this.processDataProvider, this.app, this.errorReportingProvider, this.storageServiceProvider, this.loading, this.socket, this.processDataProvider, this.processId, this.reportId);
                let template: string = `
                  <table id="headerTable" width="100%">
                    <tr>
                      <td align="center" width="33%">`+ reportObject.reportHeader.Header_Line1_Left + `</td>
                      <td align="center" width="33%">`+ reportObject.reportHeader.Header_Line1_Center + `</td>
                      <td align="center" width="33%">`+ reportObject.reportHeader.Header_Line1_Right + `</td>
                    </tr>
                    <tr>
                      <td align="center" width="33%">`+ reportObject.reportHeader.Header_Line2_Left + `</td>
                      <td align="center" width="33%">`+ reportObject.reportHeader.Header_Line2_Center + `</td>
                      <td align="center" width="33%">`+ reportObject.reportHeader.Header_Line2_Right + `</td>
                    </tr>
                    <tr>
                      <td align="center" width="33%">`+ reportObject.reportHeader.Header_Line3_Left + `</td>
                      <td align="center" width="33%">`+ reportObject.reportHeader.Header_Line3_Center + `</td>
                      <td align="center" width="33%">`+ reportObject.reportHeader.Header_Line3_Right + `</td>
                    </tr>
                      </table >
                      <br/>
                      <br/>
                      <table id="mainTable" class="display nowrap" cellspacing="0" width="100%">
                      <tfoot></tfoot>
                  </table>
                  <tfoot></tfoot>
  
                  <table id="headerTable" width="100%">
                    <tr>
                      <td align="center" width="33%">`+ reportObject.reportFooter.Footer_Line1_Left + `</td>
                      <td align="center" width="33%">`+ reportObject.reportFooter.Footer_Line1_Center + `</td>
                      <td align="center" width="33%">`+ reportObject.reportFooter.Footer_Line1_Right + `</td>
                    </tr>
                    <tr>
                      <td align="center" width="33%">`+ reportObject.reportFooter.Footer_Line2_Left + `</td>
                      <td align="center" width="33%">`+ reportObject.reportFooter.Footer_Line2_Center + `</td>
                      <td align="center" width="33%">`+ reportObject.reportFooter.Footer_Line2_Right + `</td>
                    </tr>
                    </table >
                    `
                let component: string = `comp={}`;

                this.addComponent(
                  template,
                  component
                );

              }
              else {
                this.alertCtrl.create({
                  title: 'Report',
                  subTitle: 'No Permission',
                  buttons: [
                    {
                      text: 'OK',
                      role: 'ok',
                      handler: () => {
                        this.navCtrl.pop();
                      }
                    }
                  ]
                }).present();
              }
            }
            else {
              this.alertCtrl.create({
                title: 'Report',
                subTitle: 'Error in fetching report data',
                buttons: [
                  {
                    text: 'OK',
                    role: 'ok',
                    handler: () => {
                      this.navCtrl.pop();
                    }
                  }
                ]
              }).present();
            }
          }
          catch (error) {
            this.errorReportingProvider.logErrorOnAppServer('Report Error',
              'Error in rendering report',
              user.AuthenticationToken.toString(),
              this.processId,
              'ReportPage',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          }
        }).catch(error => {
          this.loading.hideLoading();
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('Report Error',
              'Error in fetching report data',
              user.AuthenticationToken.toString(),
              this.processId,
              'ReportPage(socket.retrieveProcessReportData)',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          }
        });

    });

  }

  /**
  * Adding a dynamic component to render the report data
  */
  private addComponent(templateCurrent: string, component1: string) {
    @Component({
      template: templateCurrent
    })
    class TemplateComponent {
      reportGenerated: boolean = false; // Gloabal flag to check if report has been generated or not
      reportObject: Report; // Global variable for the report object

      /**
      * Class constructor
      */
      constructor() {
      }

      /**
      * The initiatlize function for the sub class for Template component
      */
      ngOnInit() {
        this.reportObject = reportObject;
      }

      /**
      * Called after the current view is rendered
      */
      ngAfterViewInit() {
        reportObject.generateReport();
        this.reportGenerated = true;
      }
    }

    @NgModule({ declarations: [TemplateComponent], imports: [AppModule, FormsModule] })
    class TemplateModule { }

    const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
    const factory = mod.componentFactories.find((comp) =>
      comp.componentType === TemplateComponent
    );
    let comp = '';
    let result = ts.transpile(component1);
    eval(result)
    const component = this.container.createComponent(factory);
    Object.assign(component.instance, comp);
  }
}


export class Report {
  @ViewChild(Content) content: Content; // Global variable for the view child for this view

  reportData: any[]; // Global variable for to store the report data
  columnProperties: object; // Global variable to store the column properties
  columns: string[]; // Global variable to store the columsn for the report
  parametersHTML = ""; // Global variable to store HTML parameters for the report
  reportHeader: any; // Global variable to store report header
  reportFooter: any; // Global variable to store report footer
  dataTableObject: any; // Global variable to store data table object for the report
  reportTableStyle: string = ""; // Global variable to store report data style
  globalcolumns: any; // Global variable to store report global columns
  dataIsFiltered: boolean = false;
  recordsCount: number = 0;
  footerValues: any;
  debounceTimeout: any;
  sorting: string = 'desc';

  /**
  * Class constructor
  */
  constructor(public reportObjectJSON: any,
    private modal: ModalController,
    public globalservice: ProcessDataProvider,
    private app: App,
    private errorReportingProvider: ErrorReportingProvider,
    private storageServiceProvider: StorageServiceProvider,
    private loading: LoadingProvider,
    private socket: SocketProvider,
    private processDataProvider: ProcessDataProvider,
    private processID: any,
    private reportID: any) {
    this.reportData = reportObjectJSON.Data;
    this.columnProperties = reportObjectJSON.Definition.ColumnProperties;
    this.columns = reportObjectJSON.Definition.Columns;
    this.parametersHTML = reportObjectJSON.Definition.ParametersHTML;
    this.reportHeader = reportObjectJSON.Definition.ReportHeader;
    this.reportFooter = reportObjectJSON.Definition.ReportFooter;
    this.globalcolumns = reportObjectJSON.Definition.Columns;
    this.reportTableStyle = reportObjectJSON.Definition.Settings.TableStyle;
    this.recordsCount = reportObjectJSON.RecordsCount;
    this.footerValues = reportObjectJSON.FooterValues;
  }

  /**
  * Generate report from the data provided
  */
  generateReport() {
    let colsDatatable = [];
    for (var i = 0; i < this.columns.length; i++) {
      colsDatatable[i] = {};
      colsDatatable[i].title = this.columns[i];
      colsDatatable[i].data = this.columns[i];
      colsDatatable[i].defaultContent = "";
    }

    let pageLength = 30;
    var _currClassRef = this;
    this.dataTableObject = reportObject.dataTableObject = $('#mainTable').DataTable({
      serverSide: true,
      "fnServerData": function (sSource, aoData, fnCallback, oSettings) {
        if(oSettings._drawHold){
          return;
        }

        let startIndex = 0;
        let pageLength = 0;
        let searchValue = "";
        for (let i = 0; i < aoData.length; i++) {
          if (aoData[i].name == "start") {
            startIndex = aoData[i].value;
          }
          else if (aoData[i].name == "length") {
            pageLength = aoData[i].value;
          }
          else if (aoData[i].name == "search") {
            searchValue = aoData[i].value.value;
          }

        }
        //Show Loading Here
        if (searchValue != "") {
          _currClassRef.dataIsFiltered = true;
        }
        else {
          _currClassRef.dataIsFiltered = false;
        }

        _currClassRef.storageServiceProvider.getUser().then((user) => {
          var socketParameters = {
            userToken: user.AuthenticationToken,
            processId: _currClassRef.processID.toString(),
            processReportId: _currClassRef.reportID.toString(),
            queryString: '',
            diagnosticLogging: _currClassRef.processDataProvider.processDiagnosticLog.toString(),
            startIndex: startIndex.toString(),
            pageLength: pageLength.toString(),
            searchValue: searchValue,
            sorting: reportObject.sorting,
            operationType: 'PROCESS'
          };
          _currClassRef.loading.presentLoading("Retrieving report data...", 30000);
          //Called when the process report data is retrieved
          _currClassRef.socket.callWebSocketService('retrieveProcessReportData', socketParameters)
            .then((response) => {
              _currClassRef.loading.hideLoading();

              let tempResponseJSON = response;
              let dataTablePaginationObject: any = {};
              dataTablePaginationObject.data = tempResponseJSON.Data;
              _currClassRef.reportData = reportObject.reportData = tempResponseJSON.Data;
              if (searchValue != "") {
                dataTablePaginationObject.recordsTotal=tempResponseJSON.RecordsCount;
                dataTablePaginationObject.recordsFiltered=tempResponseJSON.RecordsCount;
              }
              else{
                dataTablePaginationObject.recordsTotal=_currClassRef.recordsCount;
                dataTablePaginationObject.recordsFiltered=_currClassRef.recordsCount;
              }
              fnCallback(dataTablePaginationObject);
              $("#mainTable tbody tr td").each(function () {
                if ($(this).html().trim().indexOf("[object Object]") != -1) {
                  $(this).html("<a style='cursor:pointer;'>View</a>")
                }
              })

            });
        });

      },
      pagingType: "simple",
      "autoWidth": false,
      ordering: false,
      columns: colsDatatable,
      dom: 'Bfrtipl',
      "lengthMenu": [[10, 20, pageLength], [10, 20, pageLength]],
      buttons: [
        'excel', 'pdf'
      ],
      "initComplete": function () {
      },
      responsive: true,
      rowReorder: {
        selector: 'td:nth-child(2)'
      }
    });

    $('#mainTable_filter input').unbind();

    $('#mainTable_filter input').on('input', function () {
      clearTimeout(_currClassRef.debounceTimeout);
      _currClassRef.debounceTimeout = setTimeout(() => {
        reportObject.dataTableObject.search(this.value).draw();
      }, 1000);
    });

    var currentRef = this;
    $("#mainTable tbody").on('click', 'a', function (e) {
      e.preventDefault();

      let currentElement: any = this.parentElement;

      if (typeof (reportObject.reportData[reportObject.dataTableObject.row(currentElement).index()][reportObject.columns[reportObject.dataTableObject.column(currentElement).index()]]) == "object") {
        var detailsObjectName = "";
        if (reportObject.columnProperties[reportObject.columns[reportObject.dataTableObject.column(currentElement).index()]] != undefined && reportObject.columnProperties[reportObject.columns[reportObject.dataTableObject.column(currentElement).index()]].ColumnHeading != "") {
          detailsObjectName = reportObject.columnProperties[reportObject.columns[reportObject.dataTableObject.column(currentElement).index()]].ColumnHeading;
        }
        else {
          detailsObjectName = reportObject.columns[reportObject.dataTableObject.column(currentElement).index()];
        }
        reportObject.openDetailsReportDialog(reportObject.reportData[reportObject.dataTableObject.row(currentElement).index()][reportObject.columns[reportObject.dataTableObject.column(currentElement).index()]], detailsObjectName, reportObject.reportTableStyle);
      }
      else {
        if (reportObject.columns[reportObject.dataTableObject.column(currentElement).index()] == 'ReferenceNumber') {
          try {
            var referenceNumber = this.innerHTML.trim().toString();
            var workflowID = reportObject.reportData[currentElement._DT_CellIndex.row].WorkflowID.toString();
            var formID = reportObject.reportData[currentElement._DT_CellIndex.row].FormID.toString();

            currentRef.globalservice.reference = referenceNumber;
            currentRef.globalservice.workflowId = workflowID;
            currentRef.globalservice.actualFormId = formID;
            currentRef.app.getRootNav().push(FormPage);
          }
          catch (error) {
            currentRef.storageServiceProvider.getUser().then((user) => {
              currentRef.errorReportingProvider.logErrorOnAppServer('Report Error',
                'Error in linking to form',
                user.AuthenticationToken.toString(),
                currentRef.globalservice.processId.toString(),
                'Report.ReferenceClick',
                error.message ? error.message : '',
                error.stack ? error.stack : '',
                new Date().toTimeString(),
                'open',
                'Solution',
                '');
            });
          }
        }
      }

    });

    $('a').click(function (e) {
      e.preventDefault();
    })


    this.setColumnLabelsAndStyles();
    this.setFooterValues();
    this.setDefaultStylesForTable();
  }

  /**
  * Set default style of the report table
  */
  setDefaultStylesForTable() {
    $("#mainTable").attr("style", this.reportTableStyle)
    $("#tblPersons input").css("width", "100%");
    $("#tblPersons input").css("box-sizing", "border-box");
  }

  /**
  * Set column labels and styles for the current report
  */
  setColumnLabelsAndStyles() {
    for (var key in this.columnProperties) {
      $("#mainTable thead th:nth-child(" + (this.columns.indexOf(key) + 1) + ")").html(this.columnProperties[key].ColumnHeading)
    }
  }

  /**
  * Set report data footer column values
  */
  setFooterValues() {
    var footersArray = [];
    for (let i = 0; i < this.columns.length; i++) {
      if (typeof (this.columnProperties[this.columns[i]]) != "undefined") {
        if (typeof (this.columnProperties[this.columns[i]].FooterData) && (this.columnProperties[this.columns[i]].FooterData != "")) {
          //set aggregates for column
          if (this.columnProperties[this.columns[i]].FooterData == "SUM" || this.columnProperties[this.columns[i]].FooterData == "AVG") {
            footersArray[i] = {};
            let aggregate = 0;
            for (let j = 0; j < this.footerValues.length; j++) {
              if (this.footerValues[j].ColumnName == this.columns[i]) {
                aggregate = parseInt(this.footerValues[j].Aggregate)
              }
            }
            footersArray[i].Data = aggregate;
            footersArray[i].Label = this.columnProperties[this.columns[i]].FooterLabel;
          }
          else if (this.columnProperties[this.columns[i]].FooterData == "COUNT") {
            footersArray[i] = {};
            footersArray[i].Data = this.recordsCount;
            footersArray[i].Label = this.columnProperties[this.columns[i]].FooterLabel;
          }
        }
      }
    }
    for (let i = 0; i < this.columns.length; i++) {
      if (footersArray[i] != undefined) {
        $("#mainTable tfoot").append("<th align='right'>" + footersArray[i].Label + " " + footersArray[i].Data + "</th>");
      }
    }
  }

  /**
  * Open details of the report for sub report
  */
  openDetailsReportDialog(tableData, tableName, tableStyle): void {
    var LookupDetails = this.modal.create('LookupDetailsModalPage', { "tableData": tableData, "tableName": tableName, "tableStyle": tableStyle });
    LookupDetails.onDidDismiss(data => {
    });
    LookupDetails.present();
  }
}
