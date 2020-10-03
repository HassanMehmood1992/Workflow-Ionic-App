import { ProcessDataProvider } from './../../providers/process-data/process-data';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-pivot
Description: Renders pivot html and pivot logic.
Location: ./pages/page-pivot
Author: Hassan
Version: 1.0.0
Modification history: none
*/

//required imports
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LoadingProvider } from './../../providers/loading/loading';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SocketProvider } from '../../providers/socket/socket';

import * as $ from 'jquery';
import 'jquery-ui-dist/jquery-ui.js';
import 'pivottable/dist/pivot.min.js';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';

(window as any).jQuery = $;
require('jquery-ui-touch-punch');


@IonicPage()
@Component({
  selector: 'page-pivot',
  templateUrl: 'pivot.html',
})
export class PivotPage implements OnInit {

  reportId: any;//currnet pivot report id 
  reportTitle: any;//current report title
  processId: any;//current process id 

  pivotDefinition: any;//pivot definition json
  pivotData: any;//pivot data json
  dataFilter: Boolean = true;//data filter in effect flag

  
  /**
  * Default contructor of component.
  */  
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private storageServiceProvider: StorageServiceProvider,
    private loading: LoadingProvider,
    public globalservice: ProcessDataProvider,
    private socket: SocketProvider,
    private alertCtrl: AlertController,
    private errorReportingProvider: ErrorReportingProvider) {
    this.reportId = navParams.get('reportId');
    this.reportTitle = navParams.get('reportTitle');
    this.processId = navParams.get('processId');
  }

  /**
  * Ion view load hook.
  */
  ionViewDidLoad() {
    
  }

  /**
  * Component initiliaztion lifecycle hook
  */
  ngOnInit() {
    this.storageServiceProvider.getUser().then((user) => {
      var socketParameters = {
        userToken: user.AuthenticationToken,
        processId: this.processId,
        processReportId: this.reportId.toString(),
        queryString: '',
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'PROCESS',
        startIndex: "0",
        pageLength: "0",
        searchValue: '',
        sorting: 'asc',
      };
      this.loading.presentLoading("Retrieving pivot data...", 30000);

      //socket call retrieve pivot report data and definition
      this.socket.callWebSocketService('retrieveProcessReportData', socketParameters)
        .then((result) => {
          //hide loading
          this.loading.hideLoading();
          try {
            if ((result !== '' || result !== 'NoConnection') && typeof result === 'object') {
              if (result.Definition !== 'NoPermission') {

                if (result.AllDataAccess === 1) {//data not trimmed
                  this.dataFilter = false;
                }

                this.pivotData = result.Data;
                this.pivotDefinition = result.Definition.Settings;

                
                $.pivotUtilities.tipsData = this.pivotData;
                $(document).ready(() => {
                  //setting pivot params
                  //rendering pivot
                  $('#output').pivotUI($.pivotUtilities.tipsData, {
                    rows: this.pivotDefinition.Rows,
                    cols: this.pivotDefinition.Cols,
                    vals: this.pivotDefinition.Vals,
                    aggregatorName: this.pivotDefinition.AggregatorName,
                    rendererName: this.pivotDefinition.RendererName,
                    
                  });
                
                });
                
              }
              else {
                this.alertCtrl.create({
                  title: 'Pivot',
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
                title: 'Pivot',
                subTitle: 'Error in fetching pivot data',
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
            this.errorReportingProvider.logErrorOnAppServer('Pivot Error',
              'Error in rendering pivot',
              user.AuthenticationToken.toString(),
              this.processId,
              'PivotPage',
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
            this.errorReportingProvider.logErrorOnAppServer('Pivot Error',
              'Error in fetching pivot data',
              user.AuthenticationToken.toString(),
              this.processId,
              'PivotPage(socket.retrieveProcessReportData)',
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
  * Go back to previous state
  */
  goBack() {
    this.navCtrl.pop();
  }
/**
  * Show data filter in effect dialog
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

}
