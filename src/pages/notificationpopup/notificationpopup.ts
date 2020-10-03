/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { FormPage } from './../form/form';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { Mydata } from './../directory-popup/directory-popup';
import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { ClientDbNotificationsProvider } from './../../providers/client-db-notifications/client-db-notifications';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, App } from 'ionic-angular';

/*
ModuleID: page-notificationpopup
Description: Popup to show notifications in notification tab.
Location: ./pages/page-notificationpopup
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@IonicPage()
@Component({
  selector: 'page-notificationpopup',
  templateUrl: 'notificationpopup.html',
})
export class NotificationpopupPage {

  notification; // current notification being opened
  data: Mydata; // data to send back to caller component
  constructor(public navCtrl: NavController,private app: App,public globalservice: ProcessDataProvider,public viewCtrl: ViewController, public navParams: NavParams, public ClientDBNotifications: ClientDbNotificationsProvider,public Synchronization: SynchronizationProvider) {
    this.notification = this.navParams.get('params');
    this.data = new Mydata();
  }

  /**
  * Initialize the Component. called after constructor.
  */
  ngOnInit()
  {
    this.notification = this.navParams.get('params');
  }

  /**
  * called whenever notification is opened.
  */
  ionViewDidEnter(){
   this.notification = this.navParams.get('params');
  }

  /**
  * decode text in notification to be rendered on html
  */
  decodeText(encodedText) {
    return decodeURI(encodedText);
  };


  /**
  * Deletes a notification. Uses Synchronization service to synch devices
  */
  deletenotification(notification)
  {
    this.ClientDBNotifications.removeNotification(notification.NotificationID, 'Notification').then(() => {

      var taskQuery = {
        methodName: 'updateNotification',
        notificationId: notification.NotificationID,
        action: 'Delete',
        value: 'true'
      };

      this.data.isSubscribed = true;
      this.viewCtrl.dismiss(this.data);

      this.Synchronization.addNewSyncTask('Server', 'App', 0, 'Delete', JSON.stringify(taskQuery), 'Notifications', 0, '').then(() => {
        this.Synchronization.startUpSync();
      });
    });
  }

  /**
  * Opens up a form from notification
  */
  openForm()
  {
      this.globalservice.reference =  this.notification.Reference;
      this.globalservice.workflowId =  this.notification.WorkflowID.toString();
      this.globalservice.actualFormId =  this.notification.FormID;
      this.data.isSubscribed = false;
      this.viewCtrl.dismiss(this.data).catch( ()=>{});
      this.app.getRootNav().push(FormPage);
  }

  /**
  * calls when the view is about to be destroyed. sends data back to caller Component.
  */
  ionViewWillUnload(){
   this.data.isSubscribed = false;
    this.viewCtrl.dismiss(this.data).catch( ()=>{});
  }

}
