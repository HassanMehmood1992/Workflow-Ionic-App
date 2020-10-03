import { EncryptionProvider } from './../encryption/encryption';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessFormProvider
Description: Service which contains methods regarding form logic. To render form and use workflow routing engine to create/run a workflow form.
Location: ./providers/ProcessFormProvider
Author: Sheharyar, Hassan
Version: 1.0.0
Modification history: none
*/


/**
* Importing neccassary libraries and modules for this class 
*/
import { ProcessOffsetPipe } from './../../pipes/process-offset/process-offset';
import { HelperProvider } from './../helper/helper';
import { ErrorReportingProvider } from './../error-reporting/error-reporting';
import { SynchronizationProvider } from './../synchronization/synchronization';
import { ClientDbWorkflowSubmissionsProvider } from './../client-db-workflow-submissions/client-db-workflow-submissions';
import { ProcessDataProvider } from './../process-data/process-data';
import { ClientDbProcessResourcesProvider } from './../client-db-process-resources/client-db-process-resources';
import { SocketProvider } from './../socket/socket';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import * as moment from 'moment';
import { ENV } from './../../config/environment.prod';
import * as $ from 'jquery';
(window as any).jQuery = $;


/*
  Generated class for the ProcessFormProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ProcessFormProvider {
  private FormDataJSON: object; // Global variable for Process data JSON from workflows list
  private WorkflowSettingJSON: object; // Global variable for Process data JSON from workflows list
  private WorkflowTasksJSON: any[]; //Container for storing workflow tasks as JSON
  private RepeatingTableJSON: any[]; //Container for storing workflow tasks as JSON
  public CurrentLoggedInUser: any;// Global variable for setting curent logged in user
  private UserPermissions: any[];// Global variable for holding user permissions
  private PlatFormSettings: any;// Global variable for platform settings
  private ArchivePath: any;// Global variable for archive path
  private AndriodRedirect: any;// Global variable for android redirect url
  private IosRedirect: any;// Global variable for ios redirect url
  private isFormDeleted: boolean;// Global flag for checkingif current form is deleted
  private AllowedActionButtons: any[];// Global variable for holding allowed action buttons for the user
  private isSavedFormOpen = false;// Global flag to check if a saved form is opene
  private isDelegateAny: boolean;// Global flag to check if user has delegate any permission


  /**
   * Class constructor
   */
  constructor(
    public http: Http,
    private encryptionProvider: EncryptionProvider,
    private helper: HelperProvider,
    private errorReportingProvider: ErrorReportingProvider,
    public Synchronization: SynchronizationProvider,
    public ClientDBWorkflowSubmissions: ClientDbWorkflowSubmissionsProvider,
    private socket: SocketProvider,
    public ClientDBProcessResources: ClientDbProcessResourcesProvider,
    public globalservice: ProcessDataProvider

  ) {
    this.socket.start();
    this.CurrentLoggedInUser = this.globalservice.user;
    this.getUserPermissions();
    this.AllowedActionButtons = [];
    this.PlatFormSettings = [];
    this.isFormDeleted = false;
    this.isDelegateAny = false;
    this.setPlatformSettings();
  }

  /**
   * get user permissions for the workflow
   */
  getUserPermissions(): any {
    this.UserPermissions = this.globalservice.processpermissions.processUserSettings.Process_User_Permissions;
  }


  /**
   * set isFormDeleted flag if the form is deleted
   */
  setIsFormDeleted(deletedOn) {
    if (deletedOn != null || deletedOn != undefined) {
      if (deletedOn == "") {
        this.isFormDeleted = false;
      }
      else {
        this.isFormDeleted = true;
      }
    }
  }

  /**
   * Retrieve data for a selected process lookup in the form
   */
  retrieveProcessLookupData(processId, lookupName, replacedLookupColumns, replacedFilterString) {
    let promise = new Promise((resolve, reject) => {
      var rows = []
      try {
        var params = {
          userToken: this.globalservice.user.AuthenticationToken,
          processId: processId,
          lookupTitle: lookupName,
          lookupColumns: replacedLookupColumns,
          conditionalStatement: replacedFilterString,
          sortQuery: "",
          diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
          operationType : 'PROCESS'
        }
        var DirectoryResult = this.socket.callWebSocketService('retrieveProcessLookupFormData', params);
        DirectoryResult.then((result) => {
          try {
            var lookupData = this.helper.parseJSONifString(result).LookupValues;
            for (var i = 0; i < lookupData.length; i++) {
              var obj = lookupData[i];
              rows.push(obj);
            }
            resolve(rows);
          }
          catch (er) {

          }
        }).catch(error => {
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('retrieveProcessLookupData',
              'retrieveProcessLookupFormData data malformed',
              this.globalservice.user.AuthenticationToken,
              this.globalservice.processId.toString(),
              'retrieveProcessLookupFormData',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          }
        });
      } catch (error) {
        if (error != 'NoConnection') {
          this.errorReportingProvider.logErrorOnAppServer('retrieveProcessLookupData',
            'retrieveProcessLookupFormData Lookup  dialog  component',
            this.globalservice.user.AuthenticationToken,
            this.globalservice.processId.toString(),
            'retrieveProcessLookupFormData',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        }
      };
    });
    return promise;
  }

  /**
   * Retrieve data from server for already submitted workflows
   */
  retrieveProcessFormData(processId, workflowId, conditionalStatement) {
    let promise = new Promise((resolve, reject) => {
      var rows = []
      try {
        var params = {
          userToken: this.globalservice.user.AuthenticationToken,
          processId: processId,
          workflowId: workflowId,
          conditionalStatement: conditionalStatement,
          diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
          operationType : 'PROCESS'
        }
        var DirectoryResult = this.socket.callWebSocketService('retrieveDbLookupFormData', params);
        DirectoryResult.then((result) => {
          try {
            var dbData = this.helper.parseJSONifString(result);
            rows = dbData
            resolve(rows);
          }
          catch (er) {

          }
        }).catch(error => {
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('retrieveProcessFormData',
              'retrieveProcessFormData data malformed',
              this.globalservice.user.AuthenticationToken,
              this.globalservice.processId.toString(),
              'retrieveProcessFormData',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          }
        });
      } catch (error) {
        if (error != 'NoConnection') {
          this.errorReportingProvider.logErrorOnAppServer('retrieveProcessFormData',
            'retrieveProcessFormData Lookup  dialog  component',
            this.globalservice.user.AuthenticationToken,
            this.globalservice.processId.toString(),
            'retrieveProcessFormData',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        }
      };
    });
    return promise;
  }


  /**
   * Return the template form html for the workflow
   */
  getFormHtml(html): string {
    let formHtml: string = `<div class="content"  style="overflow:hidden;background:#f5f5f5;">
    <ion-card><ion-card-content style="padding: 5px 5px 5px 5px;">
    <form #processForm="ngForm" ngNativeValidate>
       <div id="formHtml" class="content" 
       >`; formHtml += decodeURI(html);
    formHtml += `</div></form>
    <ion-list>
		<div class="" *ngIf="showRouting">
			<div  #workflow (click)="toggleroutuing(workflow)">
				<h2 style="margin: 5px 5px 0px 8px;;overflow: hidden;white-space: nowrap;font-size: 1.4rem;font-weight: bold; color: #6f6f6f; ">Workflow Routing
        <span style="float:right;">
        <img [src]="iswfroutingShownmethod(workflow) ? 'assets/icon/arrow_up.png' : 'assets/icon/arrow_down.png'"
              style="max-height: 20px;max-width: 20px;height: 20px;width: 20px;">
        </span>
        </h2>
			</div>
      <div [hidden]="!iswfroutingShownmethod(workflow)">
        <div style="position:relative; padding-right:30px; padding-left:8px;" *ngFor="let item of WorkflowTasksJSON; let lst = last;">

          <div [ngClass]="
                    {'mytask': item.Result == 'Pending' ,
                      'firstTask': !lst
                    }"  [hidden]="item.Required == 'Yes' ? false : true">
            <div>

              <div class="sub_item">
                <span style="display: inline;"> {{item.TaskName}}</span>
                <img style="display: inline; width:12px; height:12px; " height="12px" width="12px" src="assets/icon/webtop_user.png">
                <span style="display: inline;">{{item.AssignedToName}}</span>
                <img style="display: inline;width:12px; height:12px;" *ngIf="item.Result" height="12px" width="12px" src="assets/icon/Arrow.png">
                <span style="display: inline;"  [hidden]="item.Result != 'Pending'"> 
                {{item.PendingText}}
                </span>
                <span style="display: inline;"  [hidden]="item.Result == 'Pending'"> 
                {{item.Result}}
                </span>
                <img style="display: inline;width:12px; height:12px;" *ngIf="item.DateCompleted" height="12px" width="12px" src="assets/icon/task_completed.png">
                <span style="display: inline;" *ngIf="item.DateCompleted">{{item.DateCompleted | processOffset : globalservice.processpermissions.processGlobalSettings.Process_Settings.PROCESS_TIMEZONE }} </span>
                <div style="display: inline;" *ngIf="isRouteShownmethod(item)">
                  <p style="margin: 0px 0px 0px 0px;white-space: normal;font-size: 1.4rem;font-weight: normal; color: #6f6f6f;">
                    {{item.Comments}}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div style="position:absolute;right:5px; top: 50%; margin-top:-10px;z-index:1;" *ngIf="item.Comments">
            <img (click)="toggleRoute(item)" [src]="isRouteShownmethod(item) ? 'assets/icon/arrow_up.png' : 'assets/icon/arrow_down.png'"
              style="max-height: 20px;max-width: 20px;height: 20px;width: 20px;">
          </div>
        </div>
      </div>
		</div>
	</ion-list>
  <hr style="padding: 0.5px 15px 0px 15px;    background-color: #6f6f6f;    margin-left: 8px;    margin-right: 8px;">
    </ion-card-content>
</ion-card>


<ion-card *ngIf="(FormDataJSON.Status == 'INITIATING' || FormDataJSON.Status == 'SAVED' || FormDataJSON.Status == 'PENDING') && (actionPanelVisible || showDelegateButton)" style="padding: 5px 5px 5px 5px;">
  <ion-list  #inst (click)="toggleins(inst)">
		<div class="">
            <h2 style="margin: 5px 5px 0px 8px;;overflow: hidden;white-space: nowrap;font-size: 1.4rem;font-weight: bold; color: #6f6f6f; ">{{currentPendingTask}}
            <span style="float:right;">
        <img [src]="isinsShownmethod(inst) ? 'assets/icon/arrow_up.png' : 'assets/icon/arrow_down.png'"
              style="max-height: 20px;max-width: 20px;height: 20px;width: 20px;">
        </span></h2>
              <div style="position:relative; padding-right:30px; padding-left:8px;" >
                    <div>
                     <div class="sub_item" *ngIf="isinsShownmethod(inst)">
                      <span style="display: inline;" > {{taskInstructions}}</span> 
                    </div>
                    </div>
                  </div>
          </div>
        </ion-list>
        <hr style="padding: 0.5px 15px 0px 15px;    background-color: #6f6f6f;    margin-left: 8px;    margin-right: 8px;">
  <ion-list  >
    <div  *ngIf="CurrentPendingTasksJSON.length>0"style="margin: 5px 0px 0px 5px;">
       
        <table style="width: 98%" *ngIf="CurrentPendingTasksJSON[0].CommentsFlag">
          <tbody>
          <tr style="vertical-align: top">
            <td><h2 style="margin: 3px 0px 0px 3px;overflow: hidden;white-space: nowrap;font-size: 1.4rem;font-weight: bold; color: #6f6f6f; ">Comments</h2></td>
            <td style="width:90%"><textarea class="form-control" id="RFUserComments" name="RFUserComments" rows="3" maxlength="255"></textarea> </td>
            </tr>
          </tbody>
          </table>
    </div>
    <div *ngIf="FormDataJSON.Status == 'INITIATING' || FormDataJSON.Status == 'SAVED'" style="display: block">
      <div style="margin: 5px 0px 0px 5px; text-align: right;">
          <div  style="padding: 5px 15px 0px 0px;">
            <input [(ngModel)]="FormDataJSON.CopyInitiatorOnTaskNotification" type="checkbox" id="chkboxTaskInitiatorNotification" />
              <span>Notify me on each task assignment</span><br><br>
          </div>
      </div>
    </div>
    <div id="DelegateActionButton" fxLayout="row"
                    fxLayout.xs="column"
                    fxLayout.md="column"
                    fxLayout.sm="column">
                      <h3 style="margin: 5px 5px 0px 8px;;overflow: hidden;white-space: nowrap;font-size: 1.4rem;font-weight: bold; color: #6f6f6f; " *ngIf="showDelegateSection">Delegate
                        <span style="float:right">
                            <img (click)="showDelegateButton=!showDelegateButton" [src]="showDelegateButton ? 'assets/icon/arrow_up.png' : 'assets/icon/arrow_down.png'"
                                style="max-height: 20px;max-width: 20px;height: 20px;width: 20px;">
                        </span>
                      </h3>
                    </div>
                    <div id="AssigneeSection" fxLayout="row"
                    fxLayout.xs="column"
                    fxLayout.md="column"
                    fxLayout.sm="column"
                    style="width:100%; margin: 5px 5px 0px 5px;" *ngIf="showDelegateButton">
                      <span style="text-align:left;font-size: 1.4rem;font-weight: normal; color: #6f6f6f;width:100%;" *ngIf="showDelegateSection && multipleAssignee && isDelegateAny">
                        Assignee
                      </span>
                      <ion-select *ngIf="showDelegateSection && multipleAssignee && isDelegateAny" style="font-weight: bold;color: #6f6f6f;max-width: 98%;" [(ngModel)]="delegateFrom" placeholder="Select assignee">
                        <ion-option *ngFor="let person of CurrentPendingTasksJSON" [value]="person.AssignedToEmail">{{person.AssignedToName}}</ion-option>
                      </ion-select>
                      <app-people-picker [(ngModel)]="DelegateDetails" ngDefaultControl [selfSelection]="'false'" [selectionType]="'single'" [selectorHeading]="'Select Delegate'"
                      [controlOptions]="DelegateOptions" [fieldName]="'DelegateDetails'"></app-people-picker> 
                      <div fxFlex style="padding: 0px 15px 0px 0px; text-align: right;">
                      <button data-tap-disabled="true" style="color: #007aff;background-color:#dadada;border-radius:8px;min-width:100px;"   [attr.disabled]="DelegateDetails.length == 0 ? '':null" *ngFor="let button of DelegateActionButton | keys" class="button button-ios" (click)="userAction(button.key,button.value)" >{{button.value.label}}</button>
                      </div>
                    </div>
    <div style="display: block" *ngIf="!showDelegateButton">`
    if (parseInt(ENV.MINIMUM_SUPPORTED_DEVICE_LONGEDGE_REPORTS_IOS) > screen.width) {
      formHtml += `
          <div style="margin: 0px 0px 0px 5px; text-align: center;">`
    }
    else {
      formHtml += `
             <div style="margin: 0px 0px 0px 5px; text-align: right;">`
    }

    formHtml += `
        <div fxFlex style="padding: 0px 15px 0px 0px;">
          <button [disabled]="(!processForm.valid || !validRepeatingTables)  && (button.key != 'DELETE' && button.key != 'RESTORE' && button.key != 'TERMINATE' && button.key != 'SAVE' && button.key != 'RESET')" [style.color]="(processForm.valid && validRepeatingTables) || (button.key == 'SAVE' || button.key == 'RESET' || button.key == 'TERMINATE' || button.key == 'DELETE' || button.key == 'RESTORE') ? '#007aff':'#6d6d6d'"  data-tap-disabled="true" style="color: #007aff;background-color:#dadada;border-radius:8px;min-width:100px;" *ngFor="let button of ActionButtons | keys" class="button button-ios" (click)="userAction(button.key,button.value)" >{{button.value.label}}</button>
        </div>
    </div>  
    </div>      
  </ion-list>

</ion-card>

`;
    return formHtml;
  }

  /**
   * Return workflow routing from workflow tasks
   */
  getWorkflowRouting(): any[] {
    if (this.WorkflowTasksJSON != undefined) {
      return this.WorkflowTasksJSON;
    }
    return null;
  }

  /**
   * Return workflow settings
   */
  getWorkflowSettings(): any {
    if (this.WorkflowSettingJSON != undefined) {
      return this.WorkflowSettingJSON;
    }
    return null;
  }

  /**
   * Return process tasks
   */
  getProcessTasks(): any[] {
    if (this.WorkflowTasksJSON != undefined) {
      return this.WorkflowTasksJSON;
    }
    return null;
  }

  /**
   * Return repeating tables for the form
   */
  getRepeatingTableJson(): any[] {
    if (this.RepeatingTableJSON != undefined) {
      return this.RepeatingTableJSON;
    }
    return null;
  }

  /**
   * Return the form logic 
   */
  getFormLogicComponent(formLogic): any {
    if (decodeURIComponent(formLogic) != undefined) {
      return decodeURIComponent(formLogic);
    }
    else {
      let formComponent: string = `comp={
    performFormLoadOperations:function(){},
    performPreWorkflowTaskOperations:function(){},
    performPostWorkflowTaskOperations:function(){}
    }`;
      return formComponent;
    }
  }

  /**
   * Set the platform settings in the class variables 
   */
  setPlatformSettings() {
    this.isFormDeleted = false;
    try {

      this.PlatFormSettings = this.globalservice.platformsettings;
      for (var i = 0; i < this.PlatFormSettings.length; i++) {
        if (this.PlatFormSettings[i].SettingName == "RAPIDFLOW_ARCHIVE_PATH") {
          this.ArchivePath = this.PlatFormSettings[i].Value;
        }
        else if (this.PlatFormSettings[i].SettingName == "APPLE_APP_STORE") {
          this.IosRedirect = this.PlatFormSettings[i].Value;
        }
        else if (this.PlatFormSettings[i].SettingName == "ANDROID_APP_STORE") {
          this.AndriodRedirect = this.PlatFormSettings[i].Value;
        }
      }
    } catch (error) {
      this.errorReportingProvider.logErrorOnAppServer('retrieveAndSetProcess-retrievePlatformSetting Error',
        'An error occured while extracting platform settings',
        this.globalservice.user.AuthenticationToken.toString(),
        this.globalservice.processId.toString(),
        'FormPage(socket.RetrieveFormDataWithFreshTemplate)',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
    }
  }

  /**
   * Return isFormDeleted flag
   */
  getIsFormDeleted() {
    return this.isFormDeleted
  }

  /**
   * Return the internal form data used in the workflow
   */
  getFormData(processId, workflowId, processSettings, workflowSettings, formOptions, workflowVersion): any {
    try {
      let processOffset = new ProcessOffsetPipe();
      let processOffsetDate = processOffset.transform(moment.utc(new Date()), processSettings["PROCESS_TIMEZONE"]);
      processOffsetDate = moment(processOffsetDate).format('DD-MMM-YYYY')
      this.FormDataJSON = {
        "ProcessTitle": processSettings.PROCESS_NAME,
        "FormTitle": workflowSettings[0].Form_Header.FormTitle,
        "Reference": "Not Assigned",
        "Status": "INITIATING",
        "DisplayStatus": workflowSettings[0].Workflow_Status_Labels["INITIATING"],
        "WorkflowName": workflowSettings[0].Form_Header.FormName,
        "DateInitiated": processOffsetDate,
        "DateCompleted": "",
        "ProcessID": processId.toString(),
        "WorkflowID": workflowId.toString(),
        "FormID": this.generateGUID(),
        "SavedFormID": "",
        "SavedDateTime":"",
        "CopySavedFormAttachments": false,
        "InitiatedByUserID": this.CurrentLoggedInUser.UserID,
        "InitiatedByName": this.CurrentLoggedInUser.DisplayName,
        "InitiatedByLoginID": this.CurrentLoggedInUser.LoginID.toLowerCase(),
        "InitiatedByEmail": this.CurrentLoggedInUser.Email,
        "CurrentLoggedInUserID": this.CurrentLoggedInUser.UserID,
        "CurrentLoggedInLoginID": this.CurrentLoggedInUser.LoginID.toLowerCase(),
        "CurrentLoggedInName": this.CurrentLoggedInUser.DisplayName,
        "CurrentLoggedInEmail": this.CurrentLoggedInUser.Email,
        "CopyInitiatorOnTaskNotification": workflowSettings[0].Form_Settings.COPY_INITIATOR_ON_TASK_NOTIFICATION,
        "SubmissionEmail": workflowSettings[0].Form_Settings.SUBMISSION_EMAIL,
        "AssignmentEmail": workflowSettings[0].Form_Settings.ASSIGNMENT_EMAIL,
        "NotRequiredEmail": workflowSettings[0].Form_Settings.NOT_REQUIRED_EMAIL,
        "CompletionEmail": workflowSettings[0].Form_Settings.COMPLETION_EMAIL,
        "AllJobReaders": "",
        "AdditionalReaders": "",
        "ManagerID": this.CurrentLoggedInUser.ManagerID,
        "ManagerName": this.CurrentLoggedInUser.ManagerDisplayName,
        "ManagerEmail": this.CurrentLoggedInUser.ManagerEmail,
        "FormUrl": "",
        "ArchivePath": this.ArchivePath,
        "AndriodRedirect": this.AndriodRedirect,
        "IOSRedirect": this.IosRedirect,
        "CCUsersForSubmitNotification": "",
        "CCUsersForAssignmentNotification": "",
        "CCUsersForCompletionnotification": "",
        "WorkflowVersion": workflowVersion,
        "FormOptions": {},
 
        "InvalidRepeatingTables": [],
        "StartingReferenceNumber": workflowSettings[0].Form_Settings.STARTING_REFERENCE_NUMBER,
        "ReferencePrefix": workflowSettings[0].Form_Settings.REFERENCE_PREFIX,
        "ReferenceSuffix": workflowSettings[0].Form_Settings.REFERENCE_SUFFIX,
        "CompletionAttachments": workflowSettings[0].Form_Settings.COMPLETION_ATTACHMENTS,
        "AdditionalWatermarkAttachmentControls": workflowSettings[0].Form_Settings.ADDITIONAL_WATERMARK_ATTACHMENT_CONTROLS,
        "AdditionalWatermarkAttachmentText": workflowSettings[0].Form_Settings.ADDITIONAL_WATERMARK_ATTACHMENTS_TEXT
      };

      for (let key in formOptions) {
        let obj = formOptions[key];
        this.FormDataJSON["FormOptions"][key] = obj;
        if (typeof obj["defaultValue"] != "undefined" && obj["defaultValue"] != "") {
          this.FormDataJSON[key] = obj["defaultValue"];
        }
      }
      return this.FormDataJSON;
    }
    catch (error) {
      if (error != 'NoConnection') {
        this.errorReportingProvider.logErrorOnAppServer('getFormData Error',
          'An error occured while generating form data',
          this.globalservice.user.AuthenticationToken.toString(),
          this.globalservice.processId.toString(),
          'FormPage(socket.RetrieveFormDataWithFreshTemplate)',
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
   * Update and return form data after updating status of invalid repeaing tables
   */
  updateInvalidRepeatingTables(formDataJson, formOptions, repeatingTablesJson) {
    var subObj;
    var obj;
    var found;
    for (let key in formOptions) {
      for (let j: number = 0; j < repeatingTablesJson.length; j++) {
        if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == key.toLowerCase()) {
          for (let subKey in formOptions[key]) {
            if (typeof formOptions[key][subKey] == "object") {
              subObj = formOptions[key][subKey];
              if (subObj["required"]) {
                obj = {};
                obj["tableName"] = repeatingTablesJson[j]["TableSettings"]["name"];
                obj["valid"] = false;
                if (formDataJson["InvalidRepeatingTables"].length == 0) {
                  formDataJson["InvalidRepeatingTables"].push(obj);
                }
                else {
                  found = false;
                  for (let k: number = 0; k < formDataJson["InvalidRepeatingTables"].length; k++) {
                    if (formDataJson["InvalidRepeatingTables"][k]["tableName"].toLowerCase() == repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase()) {
                      found = true;
                    }
                  }
                  if (!found) {
                    formDataJson["InvalidRepeatingTables"].push(obj);
                  }
                }
                break;
              }
            }
          }
        }
      }
    }
    return formDataJson;
  }

  /**
   * Set value of formData in class variable
   */
  setFormData(formData) {
    this.FormDataJSON = formData;
  }

  /**
   * Generate and return a GUID for the form
   */
  generateGUID(): any {
    return (this.generateRandomNumberforGUID() + this.generateRandomNumberforGUID() + "-" + this.generateRandomNumberforGUID() + "-4" + this.generateRandomNumberforGUID().substr(0, 3) + "-" + this.generateRandomNumberforGUID() + "-" + this.generateRandomNumberforGUID() + this.generateRandomNumberforGUID() + this.generateRandomNumberforGUID()).toLowerCase();
  }

  /**
   * Generate and return random number for form GUID
   */
  generateRandomNumberforGUID() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  /**
   * Return action buttons available to the user on the form
   */
  generateActionButtons(processId, workflowId, workflowSettings, ActionButtons, ActionButtonList): any {
    try {
      this.AllowedActionButtons = [];
      let DefaultAvailableButtons = ["CLAIM", "PROCEED_WITH_YES", "PROCEED_WITH_NO", "SUBMIT", "SAVE", "RESUBMIT", "REJECT", "DELEGATE", "RESTART", "TERMINATE", "DELETE", "RESTORE", "CLOSE"];
      if (typeof ActionButtons == "undefined") {
        ActionButtons = workflowSettings[0].DefaultButtons;
      }
      for (let key in ActionButtons) {
        let obj = ActionButtons[key];
        if (DefaultAvailableButtons.indexOf(key) > -1) {
          if (ActionButtonList.indexOf(key) > -1) {
            if (key.toLowerCase() == "close") {
              this.AllowedActionButtons[key] = obj;
              this.AllowedActionButtons[key].disabled = false;
            }
            else if (key.toLowerCase() == "reset") {
              this.AllowedActionButtons[key] = obj;
              this.AllowedActionButtons[key].disabled = false;
            }
            else {
              this.AllowedActionButtons[key] = obj;
              this.AllowedActionButtons[key].disabled = true;
              if (typeof this.UserPermissions != "undefined") {
                for (let index = 0; index < this.UserPermissions.length; index++) {
                  if (this.UserPermissions[index].ID == parseInt(workflowId) && this.UserPermissions[index].ItemType.toLowerCase() == "processworkflow") {
                    switch (this.UserPermissions[index].PermissionName.toLowerCase()) {
                      case "approve":
                        if (key.toLowerCase() == "proceed_with_yes" || key.toLowerCase() == "proceed_with_no" || key.toLowerCase() == "claim") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "add":
                        if (key.toLowerCase() == "submit" || key.toLowerCase() == "save" || key.toLowerCase() == "resubmit") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delete":
                        if (key.toLowerCase() == "delete" || key.toLowerCase() == "restore") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "reject":
                        if (key.toLowerCase() == "reject") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "restart":
                        if (key.toLowerCase() == "restart") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "terminate":
                        if (key.toLowerCase() == "terminate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "restart any":
                        if (key.toLowerCase() == "restart") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "terminate any":
                        if (key.toLowerCase() == "terminate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delete any":
                        if (key.toLowerCase() == "delete" || key.toLowerCase() == "restore") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delegate":
                        if (key.toLowerCase() == "delegate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delegate any":
                        this.isDelegateAny = true;
                        if (key.toLowerCase() == "delegate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                    }
                  }
                }
                if (typeof this.AllowedActionButtons[key].disabled == "undefined") {
                  this.AllowedActionButtons[key].disabled = false;
                }
              }
            }
          }
        } else
          alert("error in key mentioned in process tasks: " + key);
      }
      this.AllowedActionButtons = this.removeDisabledButtons(this.AllowedActionButtons);
      return this.AllowedActionButtons;
    }
    catch (error) {
      var user = this.CurrentLoggedInUser;
      this.errorReportingProvider.logErrorOnAppServer('generateActionButtons Error',
        'An error occured while generating action buttons ',
        user["AuthenticationToken"],
        this.globalservice.processId.toString(),
        'generateActionButtons Assesment',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
    }
  }

  /**
   * Remove and return disabled buttons from the available buttons list
   */
  removeDisabledButtons(availableButtons) {
    for (let key in availableButtons) {
      let obj = availableButtons[key];
      if (obj["disabled"]) {
        delete availableButtons[key];
      }
    }
    return availableButtons;
  }

  /**
   * Update and return a description template as subject of the form
   */
  updateDescriptionTemplate(formDataJson, WorkflowSettingsJson) {
    let descriptionTemplate: string = "";
    if (typeof WorkflowSettingsJson.SubmissionsDefinition.DescriptionTemplate != "undefined") {
      descriptionTemplate = WorkflowSettingsJson.SubmissionsDefinition.DescriptionTemplate;
      var keys = this.getFormDataKeys(descriptionTemplate);
      for (var index = 0; index < keys.length; index++) {
        if (keys[index].indexOf("].") != -1) {
          var peoplePickerFieldValues = keys[index].split(".");
          var fieldName = peoplePickerFieldValues[0].replace("[0]", "");
          var fieldValue = peoplePickerFieldValues[1];
          descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[fieldName][0][fieldValue]);
        }
        else if (keys[index].indexOf(".") != -1) {
          var rtFooterValues = keys[index].split(".");
          var rtName = rtFooterValues[0];
          var rtFooter = rtFooterValues[1];
          descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[rtName][rtFooter]);
        }
        else {
          descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[keys[index]]);
        }
      }
      return descriptionTemplate;
    }
  }

  /**
   * Update and return task instructions template
   */
  updateTaskInstructionTemplate(formDataJson, instruction) {
    let descriptionTemplate: string = "";
    if (typeof instruction != "undefined") {
      descriptionTemplate = instruction;
      var keys = this.getFormDataKeys(descriptionTemplate);
      for (var index = 0; index < keys.length; index++) {
        if (keys[index].indexOf("].") != -1) {
          var peoplePickerFieldValues = keys[index].split(".");
          var fieldName = peoplePickerFieldValues[0].replace("[0]", "");
          var fieldValue = peoplePickerFieldValues[1];
          descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[fieldName][0][fieldValue]);
        }
        else if (keys[index].indexOf(".") != -1) {
          var rtFooterValues = keys[index].split(".");
          var rtName = rtFooterValues[0];
          var rtFooter = rtFooterValues[1];
          descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[rtName][rtFooter]);
        }
        else {
          descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[keys[index]]);
        }
      }
      return descriptionTemplate;
    }
  }

  /**
   * Update and return form html classes
   */
  updateFormHtml(html) {
    html = html.replace(/mobclass/g, '');
    html = html.replace(/classrow/g, "row");
    html = html.replace(/classcolsm1/g, "col-sm-1");
    html = html.replace(/classcolsm2/g, "col-sm-2");
    html = html.replace(/classcolsm3/g, "col-sm-3");
    html = html.replace(/classcolsm4/g, "col-sm-4");
    html = html.replace(/classcolsm5/g, "col-sm-5");
    html = html.replace(/classcolsm6/g, "col-sm-6");
    html = html.replace(/classcolsm7/g, "col-sm-7");;
    html = html.replace(/classcolsm8/g, "col-sm-8");
    html = html.replace(/classcolsm9/g, "col-sm-9");
    html = html.replace(/classcolsm10/g, "col-sm-10");
    html = html.replace(/classcolsm11/g, "col-sm-11");
    html = html.replace(/classcolsm12/g, "col-sm-12");
    return html;
  }

  /**
   * Return form data keys used in description temmplate
   */
  getFormDataKeys(descriptionTemplate) {
    var keys = [];
    var tempKeys = descriptionTemplate.split("<tag>");
    for (var index = 0; index < tempKeys.length; index++) {
      if (tempKeys[index].indexOf("</tag>") != -1) {
        keys.push(tempKeys[index].substring(0, tempKeys[index].indexOf("</tag>")));
      }
    }
    return keys;
  }

  /**
   * Assess the workflow tasks after action taken by the user
   */
  performWorkflowAssesment(ButtonID, formComponent) {
    try {
      if (ButtonID == "RESET") {
      } else if (ButtonID == "CLOSE") {
      } else if (ButtonID == "DELETE") {
        formComponent = this.deleteSavedForm(ButtonID, formComponent);
      } else if (ButtonID == "RESTORE") {
        formComponent = this.restoreDeletedForm(ButtonID, formComponent);
      } else {
        formComponent.FormDataJSON["DescriptionValue"] = this.updateDescriptionTemplate(formComponent.FormDataJSON, formComponent.WorkflowSettingJSON[0]);
        switch (ButtonID) {
          case "SUBMIT":
            if (formComponent.FormDataJSON["CopyInitiatorOnTaskNotification"]) {
              if (formComponent.FormDataJSON["CCUsersForAssignmentNotification"] != "") {
                formComponent.FormDataJSON["CCUsersForAssignmentNotification"] += "," + this.CurrentLoggedInUser.Email.toLowerCase();
              }
              else {
                formComponent.FormDataJSON["CCUsersForAssignmentNotification"] += this.CurrentLoggedInUser.Email.toLowerCase();
              }
            }
            if (formComponent.FormDataJSON.Status == "SAVED") {
              formComponent.FormDataJSON.SavedFormID = formComponent.FormDataJSON.FormID;
              formComponent.FormDataJSON.FormID = this.generateGUID();
              let processOffset = new ProcessOffsetPipe();
              let processOffsetDate = processOffset.transform(moment.utc(new Date()), formComponent.ProcessSettingsJSON["PROCESS_TIMEZONE"]);
              processOffsetDate = moment(processOffsetDate).format('DD-MMM-YYYY');
              formComponent.FormDataJSON.DateInitiated = processOffsetDate;
              formComponent.FormDataJSON.FormUrl = window.location.origin + window.location.pathname + '#/sharedurl?route=form&processID=' + formComponent.FormDataJSON.ProcessID + '&workflowID=' + formComponent.FormDataJSON.WorkflowID + '&formID=' + formComponent.FormDataJSON.FormID + '&reference=' + formComponent.FormDataJSON.Reference
              formComponent.FormDataJSON = this.updateAttachmentPathForSavedForm(formComponent.FormDataJSON);
            }
            formComponent = this.generateReferenceNumber(ButtonID, formComponent);
            break;
          case "SAVE":
            formComponent = this.saveFormData(ButtonID, formComponent);
            break;

          case "CLAIM":
            formComponent = this.claimCurrentTask(ButtonID, formComponent);
            break;

          case "PROCEED_WITH_YES":
          case "PROCEED_WITH_NO":
          case "RESUBMIT":
            formComponent = this.reviewCurrentTask(ButtonID, formComponent);
            break;

          case "REJECT":
            formComponent = this.rejectCurrentTask(ButtonID, formComponent);
            break;

          case "DELEGATE":
            formComponent = this.delegateCurrentTask(ButtonID, formComponent);
            break;

          case "TERMINATE":
            formComponent = this.terminateCurrentTask(ButtonID, formComponent);
            break;

          case "RESTART":
            formComponent = this.restartCurrentTask(ButtonID, formComponent);
            break;
        }
      }
      return formComponent;
    }
    catch (error) {
      var user = this.CurrentLoggedInUser;
      this.errorReportingProvider.logErrorOnAppServer('Workflow Error',
        'An error occured while performing action ',
        user["AuthenticationToken"],
        this.globalservice.processId.toString(),
        'PerformWorkflow Assesment',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
    }

  }

  /**
   * Format and return the provided date
   */
  formatDate(inputDate) {
    var utcDate = new Date(Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), inputDate.getHours(), inputDate.getMinutes()))
    return utcDate;
  }

  /**
   * Delate a saved form
   */
  deleteSavedForm(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        action: "delete",
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'PROCESS'
      };
      this.socket.callWebSocketService('deleteSavedForm', paramsAssesment)
        .then((result) => {
          if (result != null) {
            resolve(formComponent);
          }
        });
    });
    return promise;
  }

  /**
   * Restore a deleted saved form
   */
  restoreDeletedForm(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        action: "restore",
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'PROCESS'
      };
      this.socket.callWebSocketService('deleteSavedForm', paramsAssesment)
        .then((result) => {
          if (result != null) {
            resolve(formComponent);
          }
        });
    });
    return promise;
  }


  /**
   * Generate and return a reference number for the new submitted workflow
   */
  generateReferenceNumber(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: formComponent.FormDataJSON.StartingReferenceNumber,
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'WORKFLOW'
      };
      this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              if( result["ReferenceNumber"]  == "-1" || result["ReferenceNumber"]  == -1 ){
                formComponent = this.saveFormData("SAVE",formComponent);
                resolve(formComponent);
              }
              else{
                formComponent.FormDataJSON.Status = result["Status"];
                formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
                formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
                formComponent.FormDataJSON.Reference = formComponent.FormDataJSON.ReferencePrefix + '-' + result["ReferenceNumber"] + '-' + formComponent.FormDataJSON.ReferenceSuffix;
                formComponent.FormDataJSON.FormUrl = ENV.WEB_SERVER_URL + 'sharedurl?route=form&processID=' + formComponent.FormDataJSON.ProcessID + '&workflowID=' + formComponent.FormDataJSON.WorkflowID + '&formID=' + formComponent.FormDataJSON.FormID + '&reference=' + formComponent.FormDataJSON.Reference
                resolve(formComponent);
              }
            }
            else {
              formComponent = this.saveFormData("SAVE",formComponent);
              resolve(formComponent);
            }
          }
        }).catch(error => {
          if (error == 'NoConnection') {
            this.saveFormLocally(formComponent, userComments, "SAVE").then(() => {
              resolve(formComponent);
            })
          }
        });
    });
    return promise;
    //Will be used for Saving form not submission
  }

  /**
   * Save the current workflow
   */
  saveFormData(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'WORKFLOW'
      };
      this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }

          }
        }).catch(error => {
          if (error == 'NoConnection') {
            this.saveFormLocally(formComponent, userComments, "SAVE").then(() => {
              resolve(formComponent);
            })
          }
        });;
    });
    return promise;
  }

  /**
   * Claim current pending task to take action
   */
  claimCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var outcome = "";
      outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'WORKFLOW'
      };
      this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }

          }
        }).catch(error => {
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('claimCurrentTask Error',
              'claimCurrentTask',
              this.globalservice.user.AuthenticationToken,
              this.globalservice.processId.toString(),
              'claimCurrentTask',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          }
        });
    });
    return promise;
  }

  /**
   * Delegate current pending task
   */
  delegateCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: formComponent.delegateFrom,
        delegatedToEmail: formComponent.DelegateDetails[0].Email,
        delegatedToName: formComponent.DelegateDetails[0].DisplayName,
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'WORKFLOW'
      };
      this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else
            {
              resolve(result);
            }
          }
        }).catch(error => {
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('delegateCurrentTask Error',
              'Error while delegating current task',
              this.globalservice.user.AuthenticationToken,
              this.globalservice.processId.toString(),
              'delegateCurrentTask',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          }
        });
    });
    return promise;
  }

  /**
   * Agree/disagree with the current pending task
   */
  reviewCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'WORKFLOW'
      };
      this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }
          }
        }).catch(error => {
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('reviewCurrentTask Error',
              'reviewCurrentTask',
              this.globalservice.user.AuthenticationToken,
              this.globalservice.processId.toString(),
              'reviewCurrentTask',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          }
        });
    });
    return promise;
  }

  /**
   * Perform reject action on the curent pending task
   */
  rejectCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'WORKFLOW'
      };
      this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }

          }
        }).catch(error => {
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('rejectCurrentTask Error',
              'rejectCurrentTask',
              this.globalservice.user.AuthenticationToken,
              this.globalservice.processId.toString(),
              'rejectCurrentTask',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          }
        });
    });
    return promise;
  }

  /**
   * Perform terminate action on the curent pending task
   */
  terminateCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var userComments = $("#RFUserComments").val();
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'WORKFLOW'
      };
      this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }

          }
        }).catch(error => {
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('terminateCurrentTask Error',
              'terminateCurrentTask',
              this.globalservice.user.AuthenticationToken,
              this.globalservice.processId.toString(),
              'terminateCurrentTask',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          }
        });
    });
    return promise;
  }

  /**
   * Perform restart action on the curent pending task
   */
  restartCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var userComments = $("#RFUserComments").val();
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'WORKFLOW'
      };
      this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }

          }
        }).catch(error => {
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('restartCurrentTask Error',
              'restartCurrentTask',
              this.globalservice.user.AuthenticationToken,
              this.globalservice.processId.toString(),
              'restartCurrentTask',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          }
        });
    });
    return promise;
  }

  /**
   * Complete the current pending task and send relevant notifications
   */
  performWorkflowProgress(buttonId, formComponent) {
    if(formComponent.FormDataJSON["Status"] == "SAVED"){
      buttonId = "SAVE";
    }
    var params = {
      attachmentMode: formComponent.FormDataJSON.CompletionAttachments,
      processId: formComponent.FormDataJSON.ProcessID,
      workflowId: formComponent.FormDataJSON.WorkflowID,
      formId: formComponent.FormDataJSON.FormID,
      currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
      buttonId: buttonId,
      formData: JSON.stringify(formComponent.FormDataJSON),
      formTasks: JSON.stringify(formComponent.WorkflowTasksJSON),
      formHtml: this.updateFormHtml(encodeURI($("#formHtml").html())),
      formRepeatingTables: JSON.stringify(formComponent.RepeatingTableJSON),
      diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
      dataPayloadSubmission: '{"ProcessID":"' + formComponent.FormDataJSON.ProcessID + '","WorkflowID":"' + formComponent.FormDataJSON.WorkflowID + '","FormID":"' + formComponent.FormDataJSON.FormID + '","Subject":"Test","MessageBody":"Form Submitted","TaskName":"Initiation"}',
      dataPayloadAssignment: '{"ProcessID":"' + formComponent.FormDataJSON.ProcessID + '","WorkflowID":"' + formComponent.FormDataJSON.WorkflowID + '","FormID":"' + formComponent.FormDataJSON.FormID + '","Subject":"Test","MessageBody":"Task Assigned","TaskName":"Initiation"}',
      operationType : 'WORKFLOW'
    };
    this.socket.callWebSocketService('workflowProgress', params).then().catch(error => {
      if (error != 'NoConnection') {
        this.errorReportingProvider.logErrorOnAppServer('performWorkflowProgress Error',
          'performWorkflowProgress',
          this.globalservice.user.AuthenticationToken,
          this.globalservice.processId.toString(),
          'performWorkflowProgress',
          error.message ? error.message : '',
          error.stack ? error.stack : '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');
      }
    });;
  }


  /**
   * Determine what actions a user can perform on the current assigned task
   */
  determineUserActions(WorkflowTasksJSON, CurrentPendingTasksJSON, CurrentUserTaskJSON, formData, DefaultButtonsJSON, FormSettings) {
    try {
      var buttonslist = [];
      var NewActionButtons = {};
      //claim
      if ((CurrentPendingTasksJSON.length > 1 && CurrentPendingTasksJSON[0].MultipleAssigneeRestriction.toLowerCase() == "anyone") && (this.CurrentLoggedInUser.Email.toLowerCase() == CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
        // claim button always come from default
        NewActionButtons = DefaultButtonsJSON;
        buttonslist = ["CLAIM"];
      }
      else {
        //Initiator Review check if the current task is initiator review and current logged in user is assignee
        if ((this.CurrentLoggedInUser.Email.toLowerCase() == CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (CurrentUserTaskJSON[0].TaskName.toLowerCase() == WorkflowTasksJSON[0].TaskName.toLowerCase())) { //($scope.CurrentLoggedInUser.UserID.toLowerCase() != ProcessSettingsJSON.PROCESS_ADMINISTRATOR.toLowerCase())
          if (CurrentUserTaskJSON[0].TaskName == "") {
            if (WorkflowTasksJSON[0].ActionButtons) {
              NewActionButtons = JSON.parse(WorkflowTasksJSON[0].ActionButtons);
            }
            else {
              NewActionButtons = DefaultButtonsJSON
            }
          }
          if (formData.Status == "SAVED" && !this.isFormDeleted) {
            buttonslist = ["SUBMIT", "SAVE", "DELETE"]
            this.isSavedFormOpen = true;
          }
          else if (formData.Status == "SAVED" && this.isFormDeleted) {
            buttonslist = ["RESTORE"]
            NewActionButtons = DefaultButtonsJSON;
            this.isSavedFormOpen = true;
          }
          else {
            buttonslist = ["RESUBMIT", "TERMINATE"]
          }
        }
        else {
          //Initiator
          if ((this.CurrentLoggedInUser.Email.toLowerCase() == formData.InitiatedByEmail.toLowerCase()) && (this.CurrentLoggedInUser.Email.toLowerCase() != CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
            if (formData.Status == "PENDING") {
              buttonslist = ["RESTART", "TERMINATE"]
            }
          }
          //Approver
          else if ((this.CurrentLoggedInUser.Email.toLowerCase() == CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (this.CurrentLoggedInUser.Email.toLowerCase() != formData.InitiatedByEmail.toLowerCase())) {
            buttonslist = ["PROCEED_WITH_YES", "PROCEED_WITH_NO", "REJECT", "DELEGATE", "RESTART"]
          }

          //Assignedto and Initiator
          else if ((this.CurrentLoggedInUser.Email.toLowerCase() == formData.InitiatedByEmail.toLowerCase()) && (this.CurrentLoggedInUser.Email.toLowerCase() == CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
            buttonslist = ["TERMINATE", "RESTART", "REJECT", "DELEGATE", "PROCEED_WITH_NO", "PROCEED_WITH_YES"]
          }
          //Other all users
          else {
            buttonslist = [];
          }
        }
      }

      let specialPermissions = this.getSpecialPermissions(formData.WorkflowID);
      if (formData.Status == "PENDING") {
        if (specialPermissions.indexOf("terminate any") != -1 && buttonslist.indexOf("TERMINATE") == -1) {
          buttonslist.push("TERMINATE");
        }
        if (specialPermissions.indexOf("restart any") != -1 && buttonslist.indexOf("RESTART") == -1) {
          if (CurrentUserTaskJSON[0].TaskName.toLowerCase() != WorkflowTasksJSON[0].TaskName.toLowerCase()) {
            if (CurrentPendingTasksJSON[0].TaskName.toLowerCase() != WorkflowTasksJSON[0].TaskName.toLowerCase()) {
              buttonslist.push("RESTART");
            }
          }
        }
        if (specialPermissions.indexOf("delegate any") != -1 && buttonslist.indexOf("DELEGATE") == -1) {
          if (CurrentUserTaskJSON[0].TaskName.toLowerCase() != WorkflowTasksJSON[0].TaskName.toLowerCase()) {
            this.isDelegateAny = true;
            buttonslist.push("DELEGATE");
          }
        }
      }
      else if (formData.Status == "SAVED" && !this.isFormDeleted) {
        if (specialPermissions.indexOf("delete any") != -1 && buttonslist.indexOf("DELETE") == -1) {
          buttonslist.push("DELETE");
        }
        this.isSavedFormOpen = true;
      }
      else if (formData.Status == "SAVED" && this.isFormDeleted) {
        if (specialPermissions.indexOf("delete any") != -1 && buttonslist.indexOf("RESTORE") == -1) {
          buttonslist.push("RESTORE");
        }
        NewActionButtons = DefaultButtonsJSON;
        this.isSavedFormOpen = true;
      }

      if (CurrentUserTaskJSON[0].ActionButtons && buttonslist.indexOf('CLAIM') == -1) {
        NewActionButtons = CurrentUserTaskJSON[0].ActionButtons
      }
      else {
        NewActionButtons = DefaultButtonsJSON;
      }
      return this.generateActionButtons(formData.ProcessID, formData.WorkflowID, FormSettings, NewActionButtons, buttonslist);
    } catch (error) {
      var user = this.CurrentLoggedInUser;
      this.errorReportingProvider.logErrorOnAppServer('determineUserActions Error',
        'An error occured while determining user actions ',
        user["AuthenticationToken"],
        this.globalservice.processId.toString(),
        'determineUserActions Assesment',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
    }
  }


  /**
   * Update and return form data for pdf
   */
  updateFormForPdf(formDataJson, repeatingTablesJson) {
    try {
      var subObj;
      var obj;
      let formOptions = formDataJson["FormOptions"];
      for (let key in formOptions) {
        obj = formOptions[key];
        obj["readonly"] = true;
        obj["disabled"] = true;
        formOptions[key] = obj;
      }
      for (let key in formOptions) {
        for (let j: number = 0; j < repeatingTablesJson.length; j++) {
          if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == key.toLowerCase()) {
            for (let subKey in formOptions[key]) {
              if (typeof formOptions[key][subKey] == "object") {
                subObj = formOptions[key][subKey];
                subObj["readonly"] = true;
                subObj["disabled"] = true;
                formOptions[key][subKey] = subObj;
              }
            }
          }
        }
      }
      formDataJson["FormOptions"] = formOptions;
      return formDataJson;
    } catch (error) {
      var user = this.CurrentLoggedInUser;
      this.errorReportingProvider.logErrorOnAppServer('Process form Error',
        'An error occured while updating form for pdf',
        user["AuthenticationToken"],
        this.globalservice.processId.toString(),
        'updateFormForPdf',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
    }
  }


  /**
   * Set and return user value stored in form data
   */
  setPeoplePickerOnFormLoad(FieldModel, SelectionType, DisplayName, Email, formDataJson) {
    if (DisplayName == "" || Email == "") {
      DisplayName = this.CurrentLoggedInUser.ManagerDisplayName;
      Email = this.CurrentLoggedInUser.ManagerEmail;
    }

    if (FieldModel != "" && DisplayName != "" && Email != "") {
      if (typeof formDataJson[FieldModel] == "undefined") {
        formDataJson[FieldModel] = []
      }
      if (SelectionType.toLowerCase() == "single") {
        if (formDataJson[FieldModel].length == 0) {
          var item = { DisplayName: DisplayName, Email: Email };
          formDataJson[FieldModel].push(item);
        }
        else {
          formDataJson[FieldModel][0].DisplayName = DisplayName;
          formDataJson[FieldModel][0].Email = Email;
        }
      }
      else {

      }

    }
    return formDataJson;
  }

  /**
   * Generate and return action buttons provided by the user
   */
  generateDynamicActionButtonJSON(ButtonIDs, ButtonLabels, ButtonOutcomes, ButtonConfirmations, ButtonHelptexts, ButtonClasses, ButtonAppClasses, ButtonWarningText) {
    if (ButtonIDs) {
      var ButtonJSON = {}
      ButtonIDs = ButtonIDs.split(',');
      ButtonLabels = ButtonLabels.split(',');
      ButtonOutcomes = ButtonOutcomes.split(',');
      ButtonConfirmations = ButtonConfirmations.split(',');
      ButtonHelptexts = ButtonHelptexts.split(',');
      ButtonClasses = ButtonClasses.split(',');
      ButtonAppClasses = ButtonAppClasses.split(',');
      ButtonWarningText = ButtonWarningText.split(',');
      try {
        for (var i = 0; i < ButtonIDs.length; i++) {
          var singleButton = {}
          singleButton['label'] = ButtonLabels[i];
          singleButton['outcome'] = ButtonOutcomes[i];
          singleButton['confirmation'] = ButtonConfirmations[i];
          singleButton['tooltip'] = ButtonHelptexts[i];
          singleButton['webclass'] = ButtonClasses[i];
          singleButton['appclass'] = ButtonAppClasses[i];
          singleButton['warningtext'] = ButtonWarningText[i];
          ButtonJSON[ButtonIDs[i]] = singleButton
        };
      } catch (err) {
        alert("Error in generate dynamic buttons - Error: " + err)
      }

      return ButtonJSON
    } else {
      return null
    }
  }

  /**
   * Render a pending form by updating form options
   */
  renderPendingForm(formDataJson, currentUserTaskJson, repeatingTablesJson, workflowTaskJson, defaultOptions) {
    try {
      var obj;
      var subObj;
      let formOptions = formDataJson["FormOptions"];
      if ((!this.isSavedFormOpen && currentUserTaskJson[0]["TaskName"] != workflowTaskJson[0]["TaskName"]) || (this.isSavedFormOpen && currentUserTaskJson[0]["TaskName"] != workflowTaskJson[0]["TaskName"])) {
        for (let key in formOptions) {
          obj = formOptions[key];
          obj["readonly"] = true;
          obj["disabled"] = true;
          formOptions[key] = obj;
        }
        for (let key in formOptions) {
          for (let j: number = 0; j < repeatingTablesJson.length; j++) {
            if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == key.toLowerCase()) {
              for (let subKey in formOptions[key]) {
                if (typeof formOptions[key][subKey] == "object") {
                  subObj = formOptions[key][subKey];
                  subObj["readonly"] = true;
                  subObj["disabled"] = true;
                  formOptions[key][subKey] = subObj;
                }
              }
            }
          }
        }
      }
      else if (this.isSavedFormOpen && this.isFormDeleted) {
        for (let key in formOptions) {
          obj = formOptions[key];
          obj["readonly"] = true;
          obj["disabled"] = true;
          obj["required"] = false;
          formOptions[key] = obj;
        }
        for (let key in formOptions) {
          for (let j: number = 0; j < repeatingTablesJson.length; j++) {
            if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == key.toLowerCase()) {
              for (let subKey in formOptions[key]) {
                if (typeof formOptions[key][subKey] == "object") {
                  subObj = formOptions[key][subKey];
                  subObj["readonly"] = true;
                  subObj["disabled"] = true;
                  subObj["required"] = false;
                  formOptions[key][subKey] = subObj;
                }
              }
            }
          }
        }
      }
      else {
        formOptions = defaultOptions;
      }

      let editableFields: any;
      if (typeof currentUserTaskJson[0]["EditableFields"] != "undefined" && currentUserTaskJson[0]["EditableFields"] != null) {
        editableFields = currentUserTaskJson[0]["EditableFields"].split(";");
        for (let i: number = 0; i < editableFields.length; i++) {
          if (editableFields[i].indexOf(":") != -1) { //repeating table fields
            let repeatingTablesArray = editableFields[i].split(":");
            let repeatingTableName = repeatingTablesArray[0];
            let repeatingTableFields = repeatingTablesArray[1].split("#");
            if (repeatingTableFields[0].toLowerCase() == "all") {
              for (let key in formOptions[repeatingTableName]) {
                if (typeof formOptions[repeatingTableName][key] == "object") {
                  subObj = formOptions[repeatingTableName][key]
                  subObj["readonly"] = false;
                  subObj["disabled"] = false;
                  formOptions[repeatingTableName][key] = subObj;
                }
                else {
                  switch (key) {
                    case "readonly":
                      formOptions[repeatingTableName][key] = true;
                      break;
                    case "disabled":
                      formOptions[repeatingTableName][key] = true;
                      break;
                    case "visible":
                      formOptions[repeatingTableName][key] = true;
                      break;
                    case "required":
                      formOptions[repeatingTableName][key] = false;
                      break;
                  }
                }
              }
            }
            else {
              for (let j: number = 0; j < repeatingTablesJson.length; j++) {
                if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == repeatingTableName.toLowerCase()) {
                  for (let k: number = 0; k < repeatingTableFields.length; k++) {
                    formOptions[repeatingTableName][repeatingTableFields[k]]["readonly"] = false;
                    formOptions[repeatingTableName][repeatingTableFields[k]]["disabled"] = false;
                  }
                }
              }
            }
          }
          else {
            if (editableFields[i] != "" && editableFields[i] != "null") {
              formOptions[editableFields[i]]["readonly"] = false;
              formOptions[editableFields[i]]["disabled"] = false;
            }
          }
        }
      }
      if (formDataJson["Status"] == "COMPLETED" || formDataJson["Status"] == "REJECTED" || formDataJson["Status"] == "TERMINATED") {
        for (let key in formOptions) {
          obj = formOptions[key];
          obj["readonly"] = true;
          obj["disabled"] = true;
          obj["required"] = false;
          formOptions[key] = obj;
        }
        for (let key in formOptions) {
          for (let j: number = 0; j < repeatingTablesJson.length; j++) {
            if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == key.toLowerCase()) {
              for (let subKey in formOptions[key]) {
                if (typeof formOptions[key][subKey] == "object") {
                  subObj = formOptions[key][subKey];
                  subObj["readonly"] = true;
                  subObj["disabled"] = true;
                  subObj["required"] = false;
                  formOptions[key][subKey] = subObj;
                }
              }
            }
          }
        }
      }
      formDataJson["FormOptions"] = formOptions;
      return formDataJson;
    } catch (error) {
      var user = this.CurrentLoggedInUser;
      this.errorReportingProvider.logErrorOnAppServer('renderPendingForm Error',
        'An error occured while rendering pending/saved ',
        user["AuthenticationToken"],
        this.globalservice.processId.toString(),
        'renderPendingForm Assesment',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
    }
  }

  /**
   * Save a form in sqlite in case of the form was not
   * saved on the server due to interner inavailability
   */
  saveFormLocally(formComponent, userComments, buttonId) {
    this.globalservice.localSavedFlag = true;
    let promise = new Promise((resolve, reject) => {
      formComponent.FormDataJSON.Status = "SAVED";
      let processOffset = new ProcessOffsetPipe();
      let processOffsetDate = processOffset.transform(moment.utc(new Date()), formComponent.ProcessSettingsJSON["PROCESS_TIMEZONE"]);
      //processOffsetDate = moment(processOffsetDate).format('DD-MMM-YYYY HH:MM:A');
      formComponent.FormDataJSON["SavedDateTime"] = processOffsetDate; 
      formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
      formComponent.FormDataJSON.isSavedLocal = "true";
      formComponent.FormDataJSON.SavedFormID = formComponent.FormDataJSON.FormID;
      formComponent.FormDataJSON["DescriptionValue"] = this.updateDescriptionTemplate(formComponent.FormDataJSON, formComponent.WorkflowSettingJSON[0]);
      //save the form on localDB...
      var savedFormData = {
        formpackage: JSON.stringify(formComponent.a.formObjects),
        formData: JSON.stringify(formComponent.FormDataJSON),
        oldworkflowtasks: JSON.stringify(formComponent.WorkflowTasksJSON),
        localsaved: true,
        InitiatedByEmail: formComponent.FormDataJSON["InitiatedByEmail"],
        DescriptionValue: formComponent.FormDataJSON["DescriptionValue"],
        SavedDateTime: processOffsetDate
      }

      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: "SAVE",
        outcome: formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        attachmentMode: formComponent.FormDataJSON.CompletionAttachments,
        formData: JSON.stringify(formComponent.FormDataJSON),
        formTasks: JSON.stringify(formComponent.WorkflowTasksJSON),
        formHtml: this.updateFormHtml(encodeURI($("#formHtml").html())),
        formRepeatingTables: JSON.stringify(formComponent.RepeatingTableJSON),
        dataPayloadSubmission: '{"ProcessID":"' + formComponent.FormDataJSON.ProcessID + '","WorkflowID":"' + formComponent.FormDataJSON.WorkflowID + '","FormID":"' + formComponent.FormDataJSON.FormID + '","Subject":"Test","MessageBody":"Form Submitted","TaskName":"Initiation"}',
        dataPayloadAssignment: '{"ProcessID":"' + formComponent.FormDataJSON.ProcessID + '","WorkflowID":"' + formComponent.FormDataJSON.WorkflowID + '","FormID":"' + formComponent.FormDataJSON.FormID + '","Subject":"Test","MessageBody":"Task Assigned","TaskName":"Initiation"}',
      };

      this.ClientDBWorkflowSubmissions.deleteWorkFlowsByProcessAndWorkFlow(parseInt(formComponent.FormDataJSON.ProcessID), parseInt(formComponent.FormDataJSON.WorkflowID)).then(() => {//delete all previous forms of this workflows..
        this.ClientDBWorkflowSubmissions.insertElseUpdateWorkflowSubmission(parseInt(formComponent.FormDataJSON.ProcessID), parseInt(formComponent.FormDataJSON.WorkflowID), formComponent.FormDataJSON.FormID, JSON.stringify(savedFormData)).then(() => {

          //add upsync task to save the form...
          var taskQuery = {
            methodName: 'saveFormData',
            value: JSON.stringify(paramsAssesment)
          };

          this.Synchronization.addNewSyncTask('Server', 'Process', parseInt(formComponent.FormDataJSON.ProcessID), 'Insert', JSON.stringify(taskQuery), 'WorkflowSubmissions', 0, '').then(() => {
            this.Synchronization.startUpSync();
            resolve(formComponent);
          });
        });
      })
    });
    return promise;


  };


  /**
   * Check and return true/false if the current user is authorized to oprn the form
   */
  checkFormAuthorization(allJobReaders, managerEmail, initiatorEmail, userPermissions, workflowId, formStatus) {
    //check if user in initiator
    if (initiatorEmail.toLowerCase() == this.CurrentLoggedInUser.Email.toLowerCase()) {
      return true;
    }
    //check if user in manager
    if (managerEmail.toLowerCase() == this.CurrentLoggedInUser.Email.toLowerCase()) {
      return true;
    }

    //if not saved request check current user in all job readers
    if (formStatus != "SAVED") {
      if (allJobReaders.indexOf(this.CurrentLoggedInUser.Email.toLowerCase()) != -1) {
        return true;
      }
    }

    //check if user has view permission on process or workflow
    for (let i = 0; i < userPermissions.length; i++) {
      if (((userPermissions[i]["ItemType"] == "ProcessWorkflow" && userPermissions[i]["ID"] == workflowId) || userPermissions[i]["ItemType"] == "Process")) {
        if (userPermissions[i]["PermissionName"] == "View") {
          return true;
        }

      }
    }
    return false;
  }

  /**
   * Return special permission for the current workflow
   */
  getSpecialPermissions(workflowId) {
    let specialPermissions = [];
    if (typeof this.UserPermissions != "undefined") {
      for (let index = 0; index < this.UserPermissions.length; index++) {
        if (this.UserPermissions[index].ID == parseInt(workflowId) && this.UserPermissions[index].ItemType.toLowerCase() == "processworkflow") {
          switch (this.UserPermissions[index].PermissionName.toLowerCase()) {
            case "restart any":
              specialPermissions.push(this.UserPermissions[index].PermissionName.toLowerCase());
              break;
            case "terminate any":
              specialPermissions.push(this.UserPermissions[index].PermissionName.toLowerCase());
              break;
            case "delete any":
              specialPermissions.push(this.UserPermissions[index].PermissionName.toLowerCase());
              break;
            case "delegate any":
              this.isDelegateAny = true
              specialPermissions.push(this.UserPermissions[index].PermissionName.toLowerCase());
              break;
          }
        }
      }
    }
    return specialPermissions;
  }

  /**
   * Return isDelegatedAny
   */
  getIsDelegateAny() {
    return this.isDelegateAny;
  }

  /**
   * Update and return form data after updating attachment path for archive
   */
  updateAttachmentPath(status, formDataJson) {
    switch (status) {
      case "PENDING":
      case "SAVED":
        for (let key in formDataJson) {
          let obj = formDataJson[key];
          if (obj != null && obj != undefined) {
            if (typeof obj == "object") {
              if (obj.length > 0) {
                for (var i = 0; i < obj.length; i++) {
                  if (obj[i].type == "attachment") {
                    formDataJson["CopySavedFormAttachments"] = true;
                    obj[i].url = obj[i].tempArchievePath;
                  }
                }
              }
            }
          }
        }
        break;

      case "COMPLETED":
      case "TERMINATED":
      case "REJECTED":
        for (let key in formDataJson) {
          let obj = formDataJson[key];
          if (obj != null && obj != undefined) {
            if (typeof obj == "object") {
              if (obj.length > 0) {
                for (i = 0; i < obj.length; i++) {
                  if (obj[i].type == "attachment") {
                    formDataJson["CopySavedFormAttachments"] = true;
                    obj[i].url = obj[i].completeArchievePath;
                  }
                }
              }
            }
          }
        }
        break;
    }

    return formDataJson;
  }
  /**
   * Update tasks instructions in workflow tasks
   */
  updateTaskInstructions(formDataJson, workflowTasksJson) {
    let instruction = "";
    for (let i = 0; i < workflowTasksJson.length; i++) {
      instruction = "";
      instruction = workflowTasksJson[i]["TaskInstructions"];
      workflowTasksJson[i]["TaskInstructions"] = this.updateTaskInstructionTemplate(formDataJson, instruction);
    }
    return workflowTasksJson;
  }
  updateAttachmentPathForSavedForm(formDataJson) {
    for (let key in formDataJson) {
      let obj = formDataJson[key];
      if (typeof obj == "object" && obj != null && obj != undefined) {
        if (obj.length > 0) {
          for (var i = 0; i < obj.length; i++) {
            if (obj[i].type == "attachment") {
              obj[i] = this.replaceSavedFormIdInAttachments(obj[i], formDataJson);
            }
          }
        }
      }
    }
    return formDataJson;
  }

  replaceSavedFormIdInAttachments(attachment, formDataJson) {
    let pendingDownloadPath = "";
    let completedDoenloadPath = "";
    let tempDownloadPath = "";
    let tempPath = attachment.tempArchiveName;
    tempPath = tempPath.replace(formDataJson.SavedFormID, formDataJson.FormID);
    attachment.tempArchiveName = tempPath;
    //let encrypt = new EncryptionService();
    tempDownloadPath = this.encryptionProvider.decryptData(attachment.tempArchievePath.substr(attachment.tempArchievePath.indexOf('fPath=') + 6, attachment.tempArchievePath.length));
    tempDownloadPath = tempDownloadPath.replace(formDataJson.SavedFormID, formDataJson.FormID);
    attachment.tempArchievePath = ENV.DOWNLOAD_PDF_PATH + '//WCFFileAttachmentService.svc/downloadFile?fPath=' + this.encryptionProvider.encryptData(tempDownloadPath);
    attachment.url = attachment.tempArchievePath;
    tempDownloadPath = this.encryptionProvider.decryptData(attachment.completeArchievePath.substr(attachment.completeArchievePath.indexOf('fPath=') + 6, attachment.completeArchievePath.length));
    tempDownloadPath = tempDownloadPath.replace(formDataJson.SavedFormID, formDataJson.FormID);
    attachment.completeArchievePath = ENV.DOWNLOAD_PDF_PATH + '//WCFFileAttachmentService.svc/downloadFile?fPath=' + this.encryptionProvider.encryptData(tempDownloadPath);

    return attachment;
  }
}
