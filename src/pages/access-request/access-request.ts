import { ViewChild } from '@angular/core';

/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-access-request
Description: Handles access request html and Access request submissions.
Location: ./pages/page-access-request
Author: Hassan
Version: 1.0.0
Modification history: 
20-Nov-2017   Hassan    Updated to angular new version
15-Jan-2018   Hassan    Updated CMDBID verification instead of processID
*/


/**
 * Importing neccassary liberaries and modules for this class 
 */
import { SocketProvider } from './../../providers/socket/socket';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { LoadingProvider } from './../../providers/loading/loading';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

/**
 * Generated class for the AccessRequestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 
/**
 * 
 * Main Page component for the access request page 
 * @export
 * @class AccessRequestPage
 */
@IonicPage()
@Component({
  selector: 'page-access-request',
  templateUrl: 'access-request.html',
})
export class AccessRequestPage {
  @ViewChild(Content) content: Content;

  public user;       //User who submits the access request
  accessForm: FormGroup; // Form controls group of access request form controls
  processid: AbstractControl;//form validator for processid holding ID of the process that user is going to subscribe
  reason: AbstractControl;//form validator for processid to store text given by user as reason

  /**
   * Creates an instance of AccessRequestPage.
   * @param {NavController} navCtrl 
   * @param {StorageServiceProvider} storageServiceProvider 
   * @param {LoadingProvider} loading 
   * @param {ProcessDataProvider} globalservice 
   * @param {SocketProvider} socket 
   * @param {NavParams} navParams 
   * @param {ErrorReportingProvider} errorReportingProvider 
   * @memberof AccessRequestPage
   */
  constructor(public navCtrl: NavController,
    private storageServiceProvider: StorageServiceProvider,
    private loading: LoadingProvider,
    public globalservice: ProcessDataProvider,
    private socket: SocketProvider,
    public navParams: NavParams,
    private errorReportingProvider: ErrorReportingProvider,
    private formBuilder: FormBuilder) {
      this.accessForm = this.formBuilder.group({
        'processid': ['', Validators.compose([Validators.required])],
        'reason': ['', [Validators.required]]
      });
      this.processid = this.accessForm.controls['processid'];
      this.reason = this.accessForm.controls['reason'];

      this.accessForm.controls['processid'].setValue(this.navParams.get('processId'));
  }

  /**
   * 
   * Go to previous page from navigation controller
   * @memberof AccessRequestPage
   */
  gotoDirectory() {
    this.navCtrl.pop();
  }

  /**
   * resize view periodically
   */
  ngDoCheck() {
    this.content.resize();
  }

  /**
   * 
   * 
   * @memberof AccessRequestPage
   */
  ionViewWillEnter() {
    if (this.globalservice.navidata) {
      this.globalservice.navidata = null;
    }
  }

/**
 * 
 * Submit access request using AccessRequest obejct in createNotification Service.
 * Also provide user with error details if there is an error on request submission.
 * @memberof AccessRequestPage
 */
submitRequest() {
    this.storageServiceProvider.getUser().then((user) => {
      this.user = user;
      var validateCMDBID = {
        userToken: this.user.AuthenticationToken,
        processIdentifier: this.processid.value.toString(),
        diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
        operationType : 'APPLICATION'
      };
      
      this.loading.presentLoading("Submitting request...", 20000);
      //validate the process id
      var validateCMDBIDData = this.socket.callWebSocketService('validateCMDBID', validateCMDBID);
      validateCMDBIDData.then((response) => {
        if (response[0].ProcessResolved.toLowerCase() === 'true') {
      
          var accessform = {
            ProcessID: response[0].ProcessID.toString(),
            RoleID: "",
            RoleName: "",
            MessageBody: "",
            Reason: this.reason.value.toString()
          }
          var AccessRequestObject = {
            fromUserEmail: this.user.Email,
            initiatorEmail: this.user.Email,
            processId: response[0].ProcessID.toString(),
            workflowId: '',
            formId: '',
            toUserEmail: '',
            ccUserEmails: '',
            typeId: '3',
            notificationTemplate: '',
            attachmentMode: 'NONE',
            message: '',
            dataPayload: JSON.stringify(accessform),
            processUrl: '',
            showcaseUrl: '',
            diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
            operationType : 'WORKFLOW'
          }
           //submit the access request if process is valid
          var accessFormData = this.socket.callWebSocketService('createNotification', AccessRequestObject);
          accessFormData.then((result) => {
            this.loading.hideLoading();
            this.navCtrl.pop();
          }).catch(error => {
            this.loading.hideLoading();
            if (error != 'NoConnection') {
              this.errorReportingProvider.logErrorOnAppServer('Access Request Error',
                'Error while submitting access request',
                this.globalservice.user.AuthenticationToken.toString(),
                this.globalservice.processId.toString(),
                'AccessRequestPage(socket.createNotification)',
                error.message ? error.message : '',
                error.stack ? error.stack : '',
                new Date().toTimeString(),
                'open',
                'Platform',
                '');
            }
          });
        }
        else {
          this.loading.hideLoading();
          alert('Invalid process identifier')
          this.navCtrl.pop();
        }
      }).catch(error => {
        this.loading.hideLoading();
        if (error != 'NoConnection') {
          this.errorReportingProvider.logErrorOnAppServer('Access Request Error',
            'Error while resolving process CMDBID',
            this.globalservice.user.AuthenticationToken.toString(),
            this.globalservice.processId.toString(),
            'AccessRequestPage(socket.validateCMDBID)',
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

}
