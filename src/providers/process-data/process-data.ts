import { ClientDbAppResourcesProvider } from './../client-db-app-resources/client-db-app-resources';
import { BehaviorSubject } from 'rxjs';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessDataProvider
Description: A sharable data service to provide process initialization parameters.
Location: ./providers/ProcessDataProvider
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { Injectable } from '@angular/core';

/*
  Generated class for the ProcessDataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ProcessDataProvider {

  public name;// process name
  public processId;// process id
  public processOrganization;// prcess organization
  public processImg// process image
  public navidata;// global process/form/task or notification redirect metadata
  public sort; // global sort flag for list items on pages
  public user; //current logged in user
  public hideshowsearch; // toggle for hiding/showing search
  public hideAllFilters; // toggle to hide all filters
  public hidesort; // toggle to hide sort
  public showfiltericon; // toggle to show or hide the filter/search icon
  public workflowId; // current context workflow id
  public actualFormId; // form id of the workflow opened in this context
  public processpermissions; // permissions of the current opened process
  public reference; // reference number of a form in case of redirect
  public toggleSearch; // toggle for seach in the header
  public toggleSort; // toggle for sort in the header
  public hasheader = false; // flag for indicating if theres a header in case of no network
  public platformsettings = []; // global platform settings
  public localForm = {}; // flag indicating local form
  public notificationID; // notificaiton id of the global redirected task or notification
  public returnScreenOrientation: string;//return screen orientation on form
  public processDiagnosticLog: string = "false"; // keeps value for diagnostic log of process
  public appDiagnosticLog: string = "false"; // keeps value for diagnostic log of app

  public shownGroup: any;//lookup date view show group toggle
  public processToastShown: boolean = false;//process alert toast shown flag
  public processToast;//Process toast flag
  public localSavedFlag;//local saved form flag
  public isConnected;
  appsettings;
  /**
   * Class constructor
   */
  constructor(private clientDbAppResourcesProvider: ClientDbAppResourcesProvider) {
    //no initializations since all variales are populated by other relevant components and classes
    this.updateDiagnosticsVar();
    setInterval(()=> this.updateDiagnosticsVar(),2*60*1000);
  }
  getDiagnosticLoggingFlag(diagnosticLoggingObject) {
    try {
      if (diagnosticLoggingObject != undefined && JSON.stringify(diagnosticLoggingObject) != "{}") {
        let diagnosticLoggingStartDate = new Date(diagnosticLoggingObject.StartDate);
        let diagnosticLoggingEndDate = new Date(diagnosticLoggingObject.StartDate);
        if (diagnosticLoggingStartDate.toString() != "Invalid Date" && !isNaN(parseInt(diagnosticLoggingObject.Duration))) {

          diagnosticLoggingEndDate.setMinutes(diagnosticLoggingEndDate.getMinutes() + diagnosticLoggingObject.Duration)
          let currentDate = new Date();
          if (currentDate >= diagnosticLoggingStartDate && currentDate <= diagnosticLoggingEndDate) {
            return true;
          }

        }

      }
      return false;
    } catch (ex) {

    }

  }
  //
  
  updateDiagnosticsVar()
  {
    try {
      
      var temp = this.clientDbAppResourcesProvider.getAllPlatformSettings();
      this.appsettings;
      for(var i = 0; i < temp.length; i++)
      {
        if (temp[i].SettingName == 'DIAGNOSTIC_LOGGING') {
          this.appsettings = temp[i]
          break;
        }
      }
      if(this.appsettings.Value)
      {
        this.appDiagnosticLog = this.getDiagnosticLoggingFlag(this.appsettings.Value).toString()
      }
      //alert(this.appDiagnosticLog)
      if(this.processId)
      {
        if(this.processId != "" && this.processId != "0")
        {
          this.processDiagnosticLog = this.getDiagnosticLoggingFlag(this.processpermissions.processGlobalSettings.Process_Settings.DIAGNOSTIC_LOGGING).toString();
        }
      }
      //this.processDiagnosticLog = this.getDiagnosticLoggingFlag(this.processpermissions.processGlobalSettings.Process_Settings.DIAGNOSTIC_LOGGING).toString();
      //this.userSetting = this.clientDbAppResourcesProvider.getAppSettings();

      //Cater for user Setting Completely Empty.. During flush on full data load..
    }
    catch (error) {
      
    }
  }
}
