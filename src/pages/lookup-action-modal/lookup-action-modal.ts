import { ProcessDataProvider } from './../../providers/process-data/process-data';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-lookup-action-modal
Description: Renders lookup action popup to take action on lookup change tasks.
Location: ./pages/page-lookup-action-modal
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { LoadingProvider } from './../../providers/loading/loading';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { HelperProvider } from '../../providers/helper/helper';
import { SocketProvider } from '../../providers/socket/socket';
import { ClientDbNotificationsProvider } from '../../providers/client-db-notifications/client-db-notifications';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';

/**
 * Generated class for the LookupActionModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-lookup-action-modal',
  templateUrl: 'lookup-action-modal.html',
})
export class LookupActionModalPage {

  task: any;//lookup action task
  previousItem: any[] = [];//array of previous items in case of modifiction
  newItem: any[];//array of items

  /**
  * Class constructor
  */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private Helper: HelperProvider,
    private loading: LoadingProvider,
    private storage: StorageServiceProvider,
    private Socket: SocketProvider,
    public globalservice: ProcessDataProvider,
    private ClientDBNotifications: ClientDbNotificationsProvider,
    private alertCtrl: AlertController,
    private errorReportingProvider: ErrorReportingProvider) {
    this.task = navParams.get('Task');

    if (this.task.ItemStatus === 'modified'){
      this.task.PreviousDataItem = Helper.parseJSONifString(this.task.PreviousItem);
      let index = 0;
      this.previousItem = [];
      for (let key in this.task.PreviousDataItem) {
        this.previousItem[index] = {};
        this.previousItem[index].key = key;
        this.previousItem[index].val = this.task.PreviousDataItem[key];
        index++;
      }
    }
    this.newItem = [];
    let index = 0;
    for (let key in this.task.LookupItem) {
      this.newItem[index] = {};
      this.newItem[index].key = key;
      this.newItem[index].val = this.task.LookupItem[key];
      index++;
    }
  }

  /**
  * dismiss hte popup
  */
  dismiss() {
    this.viewCtrl.dismiss();
  }

  /**
  * Retrieve the lolumn values from helper
  */
  getLookupColumnValue(column) {
    return this.Helper.getLookupColumnValue(column);
  };

  /**
  * Check if undefined
  */
  isUndefined(val) { return typeof val === 'undefined'; }

  /**
  * Perforn action on lookup task
  */
  action(value) {
    var title = '';
    var msg = '';
    var actionTaken = '';
    switch (value) {
      case 'yes':
        title = 'Approved';
        actionTaken = 'Approved';
        msg = 'lookup request approved';
        break;
      case 'no':
        title = 'Rejected';
        actionTaken = 'Rejected';
        msg = 'lookup request rejected';
        break;
    }

    this.storage.getUser().then((user) => {
      this.loading.presentLoading("Responding to lookup request...", 10000);

      //create payload for server
      var lookupApprovalTask = {
        userToken: user.AuthenticationToken,
        fromUserEmail: this.task.ToUserEmail,
        fromUserName: this.task.ToDisplayName,
        toUserEmail: user.Email,
        toUserName: user.DisplayName,
        action: actionTaken,
        lookupDataId: this.task.LookupDataID,
        notificationId: this.task.NotificationID.toString(),
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'WORKFLOW'
      };

      this.Socket.callWebSocketService('completeProcessLookupApprovalRequest', lookupApprovalTask).then((result) => {
        //hide loading
        this.loading.hideLoading();

        if (result.message) {
          this.ClientDBNotifications.removeNotification(this.task.NotificationID, 'Task').then(() => {
          });
          this.alertCtrl.create({
            title: 'Lookup Action',
            subTitle: msg,
            buttons: [
              {
                text: 'OK',
                role: 'OK',
                handler: () => {
                  this.viewCtrl.dismiss();
                }
              }
            ]
          }).present();
        }
      }).catch(error => {
        this.loading.hideLoading();
        if (error != 'NoConnection') {
          this.errorReportingProvider.logErrorOnAppServer('Lookup Action Error',
            'Error occured while performing action',
            user.AuthenticationToken.toString(),
            '0',
            'LookupActionModalPage(socket.completeProcessLookupApprovalRequest)',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        }
      });

    });
  };

}
