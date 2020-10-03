import { ProcessDataProvider } from './../../providers/process-data/process-data';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AccessRequestActionModalPage
Description: Handles access request pop over html and logic.
Location: ./pages/AccessRequestActionModalPage
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
 * Importing neccassary liberaries and modules for this class 
 */
import { LoadingProvider } from './../../providers/loading/loading';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { SocketProvider } from './../../providers/socket/socket';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ClientDbNotificationsProvider } from '../../providers/client-db-notifications/client-db-notifications';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';

/**
 * Generated class for the AccessRequestActionModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

/**
 * 
 * Access Request approval or reject dialog that is used when access request is assigned.
 * @export
 * @class AccessRequestActionModalPage
 */
@IonicPage()
@Component({
  selector: 'page-access-request-action-modal',
  templateUrl: 'access-request-action-modal.html',
})
export class AccessRequestActionModalPage {

  task: any;    //To save current task value either approved or rejected
  selectedRole: any;   // Role that have been selected by the approver while approving the access request
  comments: String = '';  // Comments given by the approver while approving or rejecting access request
  processRoles: any[] = []; // Roles to be used for the access request

  accessRequestRoleForm: FormGroup = this.formBuilder.group({
    'roleSelector': ['', [Validators.required]]
  });

  accessRequestCommentsForm: FormGroup = this.formBuilder.group({
    'comments': ['', [Validators.required]]
  });

/**
 * Creates an instance of AccessRequestActionModalPage.
 * @param {NavController} navCtrl 
 * @param {NavParams} navParams 
 * @param {FormBuilder} formBuilder 
 * @param {SocketProvider} socket 
 * @param {StorageServiceProvider} storageServiceProvider 
 * @param {AlertController} alertCtrl 
 * @param {LoadingProvider} loading 
 * @param {ClientDbNotificationsProvider} ClientDBNotifications 
 * @param {ErrorReportingProvider} errorReportingProvider 
 * @param {ProcessDataProvider} globalservice 
 * @memberof AccessRequestActionModalPage
 */
constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private socket: SocketProvider,
    private storageServiceProvider: StorageServiceProvider,
    private alertCtrl: AlertController,
    private loading: LoadingProvider,
    private ClientDBNotifications: ClientDbNotificationsProvider,
    private errorReportingProvider: ErrorReportingProvider,
    public globalservice: ProcessDataProvider) {
    this.task = navParams.get('Task');
   
  }

/**
 * 
 * 
 * @memberof AccessRequestActionModalPage
 */
ionViewDidLoad() {
    console.log('ionViewDidLoad AccessRequestActionModalPage');
  }

/**
 * 
 *  Implements action performed by the approver
 * @param {any} value 
 * @memberof AccessRequestActionModalPage
 */
action(value) {
    this.storageServiceProvider.getUser().then((user) => {

      var title = '';
      var msg = '';
      var actionTaken = '';
      switch (value) {
        case 'yes':
          title = 'Approved';
          actionTaken = 'Approved';
          msg = 'Access request approved';
          break;
        case 'no':
          title = 'Rejected';
          actionTaken = 'Rejected';
          msg = 'Access request rejected';
          break;
      }


      var AccessRequestObject = {
        notificationId: this.task.NotificationID.toString(),
        userEmail: user.Email,
        actionTaken: actionTaken,
        comments: this.comments,
        diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
        operationType : 'WORKFLOW'
      };
      this.loading.presentLoading("Responding to access request...", 10000);
      this.socket.callWebSocketService('completeAccessRequest', AccessRequestObject)
        .then((data) => {
          this.loading.hideLoading();

          if (data.message.toLowerCase() === 'true') {
            this.alertCtrl.create({
              title: 'Access Request',
              subTitle: 'Successfully responded to the access request',
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

            this.ClientDBNotifications.removeNotification(parseInt(this.task.NotificationID), 'Task');
          }
          else {
            this.alertCtrl.create({
              title: 'Access Request',
              subTitle: 'Error in responding to access request',
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
        }).catch(error => {
          this.loading.hideLoading();
          if (error != 'NoConnection') {
            this.storageServiceProvider.getUser().then((user) => {
              this.errorReportingProvider.logErrorOnAppServer('Access Request Error',
                'Error in responding to access request',
                user.AuthenticationToken,
                '0',
                'AccessRequestActionModalPage(socket.completeAccessRequest)',
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
/**
 * 
 * Returns length of the object
 * @param {any} obj 
 * @returns Length in integer
 * @memberof AccessRequestActionModalPage
 */
getLength(obj) {
    if (typeof obj != 'undefined') {
      return obj.length;
    }
    return 0;
  }

}
