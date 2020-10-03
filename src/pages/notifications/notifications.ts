
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { ErrorReportingProvider } from './../../providers/error-reporting/error-reporting';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subscription } from 'rxjs/Subscription';
import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { NotificationpopupPage } from './../notificationpopup/notificationpopup';
import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { ClientDbNotificationsProvider } from './../../providers/client-db-notifications/client-db-notifications';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController, Content } from 'ionic-angular';
import { ApplicationTabsPage } from '../tabs-application/ApplicationTabs';
import { App } from 'ionic-angular/components/app/app';
import { FormControl } from '@angular/forms';

/*
ModuleID: page-notifications
Description: Renders notification tab. Retrieve notifications from local database and synchronize on other devices.
Location: ./pages/page-notifications
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage implements OnInit {

  Notifications: Array<any>; // Array of notifications 
  showOnSortApplied; // checks for key on sort
  subscription: Subscription; // subscription for search.
  notificationsUpdate: Subscription; // subscription for notification
  mysearch; // search input string
  @ViewChild(Content) content: Content;

  searchControl: FormControl; // used to get debounce value on search field

  descending: boolean = false; // sort order
  order: number = -1; // controls the order of sort
  column: string = 'DateCreated'; // column on which the sort is applied in this view

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public ClientDBNotifications: ClientDbNotificationsProvider,
    private platform: Platform,
    private errorReportingProvider: ErrorReportingProvider,
    public modalCtrl: ModalController,
    private _backNav: BacknavigationProvider,
    public Synchronization: SynchronizationProvider,
    public globalservice: ProcessDataProvider,
    private app: App) {
    this.Notifications = [];
    this.searchControl = new FormControl();
    this.showOnSortApplied = '';
  }

  /**
  * go back to previous screen
  */
  gotomyprocess() {
    this.globalservice.processId = 0;

    if(this.globalservice.processToast){
      this.globalservice.processToast.dismiss();
    }
    
    this.app.getRootNav().pop().catch((error) => {
      this.app.getRootNav().setRoot(ApplicationTabsPage, { tabIndex: 0 });
    });
  }

  /**
  * change the sort order
  */
  toggleSortAndPublish(toggleSort) {
    this.descending = !this.descending;
    this.order = this.descending ? 1 : -1;
  }

  /**
  * subscribe to listen to listen if anything added in search field.
  */
  ionViewDidLoad() {
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this._backNav.changeNav(search);
    })
  }

  /**
  * reset the navigation data is if the user hass left the screen and came from a push notification.
  */

  ionViewDidLeave() {
    this.globalservice.navidata = null;
  }

  /**
  * reset the navigation data is if the user hass left the screen and came from a push notification.
  */
  ionViewWillEnter(){
   this.mysearch = '';
   this.globalservice.toggleSearch = false;
   this.globalservice.sort = false;
   this.globalservice.toggleSort = false;

   this.notificationsUpdate = this.ClientDBNotifications.notificationsUpdater$.subscribe(item => {
      this.updateNotificationsView();
    })
  }

  /**
  * Refresh any styling when ever screen resizes.
  */
  ngDoCheck() {
    this.content.resize();
  }

  /**
  * unsubscribe the notification listener. Also gets destroyed when a user leaves.
  */
  ionViewWillLeave(){
    this.notificationsUpdate.unsubscribe();
  }

  /**
  * update list view when ever a new notification came.
  */
  updateNotificationsView()
  {
    try{
      this.Notifications = [];
      this.Notifications = this.ClientDBNotifications.getNotificationsList();
      for(var i = 0; i < this.Notifications.length; i++)
      {
          if(this.globalservice.navidata){//push notification redirect to the notification
            if(this.Notifications[i].NotificationID.toString() === this.globalservice.navidata.additionalData.NotificationId.toString()){
              this.openModal(this.Notifications[i]);
              this.globalservice.navidata = null;
            }
          }
        
      }
    }
    catch(e)
    {
      this.Notifications = [];

      this.errorReportingProvider.logErrorOnAppServer('Error in notifications tasks',
        'Error in notifications on notification tab',
        this.globalservice.user.AuthenticationToken.toString(),
        '0',
        'updateNotificationsView',
        e.message ? e.message : '',
        e.stack ? e.stack : '',
        new Date().toTimeString(),
        'Open',
        'Platform',
        '');

    }
  }

  /**
  * decode text in notification to be rendered on html
  */
  decodeText(encodedText) {
    return decodeURI(encodedText);
  };

  /**
  * Initialize the Component. Retrieve notifications from local DB and register search listner
  */
  ngOnInit() {
    this.subscription = this._backNav.navItem$.subscribe(item => {
      this.mysearch = item;
    })
    // this.sortsubscription = this._sort.navItem$.subscribe(sort => {
    //   alert('here');
    //   this.showOnSortApplied = sort;
    // })
    this.platform.ready().then(() => {
      setTimeout(() => {
        this.ClientDBNotifications.getAllNotifications().then(() => {
          this.Notifications = this.ClientDBNotifications.getNotificationsList();
        });
      }, 200);

    });
  }

  /**
  * Marks a notification as read. Uses Synchronization service to synch devices
  */
  readnotification(notification, slidingItem) {
    if (notification.NotificationAction === 'Pending') {
      this.ClientDBNotifications.readNotification(parseInt(notification.NotificationID), 'Notification').then((response) => {
        if (response === 'true') {
          //add an upSync Task for the Server
          var taskQuery = {
            methodName: 'updateNotification',
            notificationId: notification.NotificationID,
            action: 'Read',
            value: 'true'
          };

          this.Synchronization.addNewSyncTask('Server', 'App', 0, 'Update', JSON.stringify(taskQuery), 'Notifications', 0, '').then(() => {
            if (slidingItem) {
              slidingItem.close();
            }
            this.Synchronization.startUpSync();
            //notification.NotificationAction = 'Read';
          });
        }

      });
    }
  }

  /**
  * Marks a notification as unread. Uses Synchronization service to synch devices
  */
  unreadnotification(notification, slidingItem) {
    this.ClientDBNotifications.unReadNotification(parseInt(notification.NotificationID), 'Notification').then((response) => {
      if (response === 'true') {
        //add an upSync Task for the Server
        var taskQuery = {
          methodName: 'updateNotification',
          notificationId: notification.NotificationID,
          action: 'UnRead',
          value: 'true'
        };

        this.Synchronization.addNewSyncTask('Server', 'App', 0, 'Update', JSON.stringify(taskQuery), 'Notifications', 0, '').then(() => {
          slidingItem.close();
          this.Synchronization.startUpSync();
          notification.NotificationAction = 'Read';
        });
      }

    });
  }

  /**
  * Deletes a notification. Uses Synchronization service to synch devices
  */
  deletenotification(notification) {
    this.ClientDBNotifications.removeNotification(notification.NotificationID, 'Notification').then(() => {
      //add an upSync Task for the Server
      var taskQuery = {
        methodName: 'updateNotification',
        notificationId: notification.NotificationID,
        action: 'Delete',
        value: 'true'
      };

      this.Synchronization.addNewSyncTask('Server', 'App', 0, 'Delete', JSON.stringify(taskQuery), 'Notifications', 0, '').then(() => {
        this.Synchronization.startUpSync();
      });
    });
  }


  /**
  * Open the notification popup
  */
  openModal(notification) {
    let directoryModal = this.modalCtrl.create(NotificationpopupPage, { params: notification }, { enableBackdropDismiss: true });
    directoryModal.onDidDismiss(data => {
      if (data != null) {
        if (data.isSubscribed) {
          this.deletenotification(notification);
        }
        else {
          this.readnotification(notification, null);
        }
      }
    });
    directoryModal.present();

  }

  /**
  * Destroy any subscriptions. 
  */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
