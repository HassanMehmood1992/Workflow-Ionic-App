import { LoadingProvider } from './../../providers/loading/loading';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-app-settings
Description: Renders app settings. Uses local databse call to retrieve settings and synchronization service to create up sync tasks.
Location: ./pages/page-app-settings
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
 * Importing neccassary liberaries and modules for this class 
 */
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Content } from 'ionic-angular';
import { ClientDbAppResourcesProvider } from '../../providers/client-db-app-resources/client-db-app-resources';
import { ENV } from './../../config/environment.prod';
import { Subscription } from 'rxjs/Subscription';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import { SocketProvider } from '../../providers/socket/socket';

/**
 * Generated class for the AppSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
/**
 * 
 * Implements App settings page
 * @export
 * @class AppSettingsPage
 */
@IonicPage()
@Component({
  selector: 'page-app-settings',
  templateUrl: 'app-settings.html',
})

export class AppSettingsPage {
  @ViewChild(Content) content: Content;

  user: any = ''; // To store which current user name to be displayed in settings
  userSetting: any; // To store user OOO, app notifications, email notifications and proxy settings
  settings; // To store updated settings if user modifies
  allowOutOfOffice: any = {}; // to store out of office date and user
  proxyApprover: any = {}; // To store aproxy approver assignee
  emailNotifications: Boolean = false; // To store value of email notifications
  pushNotifications: Boolean = false; // To store value of push notifications
  rapidFlowPlatform: String; // To store rapidflow platform value
  applicationVersion: String; // To store application version
  environment: String; // To store environment details of the current view

  appSettingsUpdate: Subscription; // subscription for app settings updates


  /**
   * Creates an instance of AppSettingsPage.
   * @param {NavController} navCtrl 
   * @param {NavParams} navParams 
   * @param {SynchronizationProvider} Synchronization 
   * @param {ModalController} modal 
   * @param {StorageServiceProvider} storageServiceProvider 
   * @param {ClientDbAppResourcesProvider} clientDbAppResourcesProvider 
   * @param {App} app 
   * @param {AlertController} alertCtrl 
   * @memberof AppSettingsPage
   */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private Synchronization: SynchronizationProvider,
    private modal: ModalController,
    private storageServiceProvider: StorageServiceProvider,
    private clientDbAppResourcesProvider: ClientDbAppResourcesProvider,
    private alertCtrl: AlertController,
    private errorReportingProvider: ErrorReportingProvider,
    private socket: SocketProvider,
    private loading: LoadingProvider) {
    this.rapidFlowPlatform = ENV.RAPIDFLOW_VERSION;
    this.applicationVersion = ENV.APPLICATION_VERSION;
    this.environment = ENV.ENVIRONMENT;
  }

  /**
   * View inititalization listener
   */
  ngOnInit() {
    this.storageServiceProvider.getUser().then((user) => {
      this.user = user;
    });

    this.clientDbAppResourcesProvider.getAllAppResources();
  }

  /**
  * View entering listener
  */
  ionViewWillEnter() {
    //observe app settings updates
    this.appSettingsUpdate = this.clientDbAppResourcesProvider.settingsUpdater$.subscribe(item => {
      this.updateUserSetting();
    })
  }

  /**
  * View leaving listener
  */
  ionViewWillLeave() {
    this.appSettingsUpdate.unsubscribe();
  }

  /**
   * resize view periodically
   */
  ngDoCheck() {
    this.content.resize();
  }

  /**
   * Update the user setting from the local db
   */
  updateUserSetting() {
    try {
      this.settings = this.clientDbAppResourcesProvider.getPlatformSettings();
      this.userSetting = this.clientDbAppResourcesProvider.getAppSettings();

      //Cater for user Setting Completely Empty.. During flush on full data load..
      if (this.isEmpty(this.userSetting)) {
        this.userSetting = { Email_Notification: { Allow: "False" }, HelpLink: "", Out_of_Office: {}, Proxy_Approver: {}, Push_Notification: { Allow: "False" } };
      }

      if (typeof this.userSetting.Email_Notification !== 'undefined') {
        this.emailNotifications = false;
        if (typeof this.userSetting.Email_Notification.Allow != 'undefined') {
          if (this.userSetting.Email_Notification.Allow === 'True') {
            this.emailNotifications = true;
          }
        }

      }
      else {
        this.emailNotifications = false;
        this.userSetting.Email_Notification = { Allow: "False" };
      }

      if (typeof this.userSetting.Push_Notification != 'undefined') {
        this.pushNotifications = false;
        if (typeof this.userSetting.Push_Notification.Allow != 'undefined') {
          if (this.userSetting.Push_Notification.Allow === 'True') {
            this.pushNotifications = true;
          }
        }
      }
      else {
        this.pushNotifications = false;
        this.userSetting.Push_Notification = { Allow: "False" };
      }

      if (typeof this.userSetting.Out_of_Office != 'undefined') {
        this.allowOutOfOffice.Allow = false;
        if (typeof this.userSetting.Out_of_Office.Delegated_To != 'undefined') {
          this.allowOutOfOffice.Allow = true;
        }
      }
      else {
        this.allowOutOfOffice.Allow = false;
        this.userSetting.Out_of_Office = {};
      }

      if (typeof this.userSetting.Proxy_Approver != 'undefined') {
        this.proxyApprover.Allow = false;
        if (typeof this.userSetting.Proxy_Approver.DisplayName != 'undefined') {
          this.proxyApprover.Allow = true;
        }
      }
      else {
        this.proxyApprover.Allow = false;
        this.userSetting.Proxy_Approver = {};
      }
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('App Settings Error',
          'Error while loading application settings',
          user.AuthenticationToken,
          '',
          'AppSettingsPage.updateUserSetting',
          error.message ? error.message : '',
          error.stack ? error.stack : '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');
      });
    }
  }

  isEmpty(map) {
    for (var key in map) {
      return !map.hasOwnProperty(key);
    }
    return true;
  }

  /**
   * 
   * Fetch latest data from server by calling API
   * @memberof AppSettingsPage
   */
  restoreDataFromServer() {
    //show loading
    this.loading.presentLoading("Restoring local database ...", 32000);

    var socketParameters = {
      operationType : 'APPLICATION'
    };
    this.socket.callWebSocketService('pingAppServer', socketParameters).then((result) => {
      this.Synchronization.restoreDataFromServer();
      
    }).catch(error => {
      this.loading.hideLoading();
      if (error != 'NoConnection') {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('App Server Error',
          'Error while pinging app server',
          user.AuthenticationToken,
          '',
          'AppSettingsPage.restoreDataFromServer',
          error.message ? error.message : '',
          error.stack ? error.stack : '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');
      });
      }
      else{
        alert('You need to be connected to RapidFlow Server to perform this operation');
      }
    });
  }

  toggleDebounce(context, event) {
    var debounce = require('debounce');
    debounce(this.toggle(context, event), 2000, false);
  }

  /**
   * 
   * @param context 
   * @param  event (to handle toggle revert for incomplete OOO and Proxy.. not being achieved through ngModel(11/29/2017)
   */
  toggle(context, event) {
    try {
      //prevent commiting the changes during full data load..
      //if (this.Synchronization.getFullDataLoad() === false) 
      {

        if (context === 'email') {
          if (this.emailNotifications === false && this.userSetting.Email_Notification.Allow != 'False') {
            this.commitApplicationSetting(context, { Allow: 'False' });
          }
          else if (this.emailNotifications === true && this.userSetting.Email_Notification.Allow != 'True') {
            this.commitApplicationSetting(context, { Allow: 'True' });
          }
        }

        else if (context === 'push') {
          if (this.pushNotifications === false && this.userSetting.Push_Notification.Allow != 'False') {
            this.commitApplicationSetting(context, { Allow: 'False' });
          }
          if (this.pushNotifications === true && this.userSetting.Push_Notification.Allow != 'True') {
            this.commitApplicationSetting(context, { Allow: 'True' });
          }

        }

        else if (context === 'outofoffice') {
          if (this.allowOutOfOffice.Allow === false && typeof this.userSetting.Out_of_Office.Delegated_To != 'undefined')//turned off..
          {
            this.commitApplicationSetting(context, {});//commit application settings in local db..
          }
          else if (this.allowOutOfOffice.Allow === true && typeof this.userSetting.Out_of_Office.Delegated_To == 'undefined') {
            const outOfOfficeModal = this.modal.create('OutOfOfficeModalPage');
            outOfOfficeModal.onDidDismiss(data => {
              if (data != null) {
                this.commitApplicationSetting(context, data);
              }
              else {
                event._value = false;
                this.allowOutOfOffice.Allow = false;
              }
            });
            outOfOfficeModal.present();
          }
        }
        else if (context === 'proxy') {
          if (this.proxyApprover.Allow === false && typeof this.userSetting.Proxy_Approver.DisplayName != 'undefined')//turned off..
          {
            this.commitApplicationSetting(context, {});//commit application settings in local db..
          }
          else if (this.proxyApprover.Allow === true && typeof this.userSetting.Proxy_Approver.DisplayName == 'undefined') {
            const proxyModal = this.modal.create('ProxyApproverModalPage');
            proxyModal.onDidDismiss(data => {
              if (data != null) {
                this.commitApplicationSetting(context, data);
              }
              else {
                event._value = false;
                this.proxyApprover.Allow = false;
              }
            });
            proxyModal.present();
          }
        }
      }
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('App Settings Error',
          'Error while updating application settings',
          user.AuthenticationToken,
          '',
          'AppSettingsPage.toggle',
          error.message ? error.message : '',
          error.stack ? error.stack : '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');
      });
    }
  }


  /**
  * Commit App Settings in SQLite
  */
  commitApplicationSetting(identity, value) {
    let promise = new Promise((resolve, reject) => {
      try{
        var taskQuery = {
          methodName: 'updateUserSettings',
          context: 'ApplicationSettings',//ProcessSettings || ApplicationSettings
          processId: '0',
          settingName: '',
          value: ''
        };
        var resource = this.clientDbAppResourcesProvider.getAppSettings();
        if (identity === 'email') {
          if (this.userSetting.Email_Notification) {
            resource.Email_Notification = value;
            //commit in the sqlite..
            this.clientDbAppResourcesProvider.updateAppResource('AppSettings', JSON.stringify(resource)).then(() => {
              //add up-sync task for the server..
              taskQuery.settingName = 'Email_Notification';
              taskQuery.value = JSON.stringify(value);
              this.Synchronization.addNewSyncTask('Server', 'App', 0, 'Update', JSON.stringify(taskQuery), 'AppResources', 0, 'AppSettings').then(() => {
                this.Synchronization.startUpSync();
                resolve();
              });
            });
          }
        }
        else if (identity === 'push') {
          if (this.userSetting.Push_Notification) {
            resource.Push_Notification = value;
            //commit in the sqlite..
            this.clientDbAppResourcesProvider.updateAppResource('AppSettings', JSON.stringify(resource)).then(() => {
              //add up-sync task for the server..
              taskQuery.settingName = 'Push_Notification';
              taskQuery.value = JSON.stringify(value);
              this.Synchronization.addNewSyncTask('Server', 'App', 0, 'Update', JSON.stringify(taskQuery), 'AppResources', 0, 'AppSettings').then(() => {
                this.Synchronization.startUpSync();
                resolve();
              });
  
              resolve();
            });
          }
        }
        else if (identity === 'outofoffice') {
          if (this.userSetting.Out_of_Office) {
            resource.Out_of_Office = value;
            //commit in the sqlite..
            this.clientDbAppResourcesProvider.updateAppResource('AppSettings', JSON.stringify(resource)).then(() => {
              //add up-sync task for the server..
              taskQuery.settingName = 'Out_Of_Office';
              taskQuery.value = JSON.stringify(value);
              this.Synchronization.addNewSyncTask('Server', 'App', 0, 'Update', JSON.stringify(taskQuery), 'AppResources', 0, 'AppSettings').then(() => {
                this.Synchronization.startUpSync();
                resolve();
              });
  
              resolve();
            });
          }
        }
        else if (identity === 'proxy') {
          if (this.userSetting.Proxy_Approver) {
            var proxyApproverSetting = {};
            if (value.Email) {
              proxyApproverSetting = { 'Email': value.Email, 'DisplayName': value.DisplayName };
            }
            resource.Proxy_Approver = proxyApproverSetting;
            //commit in the sqlite..
            this.clientDbAppResourcesProvider.updateAppResource('AppSettings', JSON.stringify(resource)).then(() => {
              //add up-sync task for the server..
              taskQuery.settingName = 'Proxy_Approver';
              taskQuery.value = JSON.stringify(proxyApproverSetting);
              this.Synchronization.addNewSyncTask('Server', 'App', 0, 'Update', JSON.stringify(taskQuery), 'AppResources', 0, 'AppSettings').then(() => {
                this.Synchronization.startUpSync();
                resolve();
              });
  
              resolve();
            });
          }
        }
      }
      catch (error) {
        this.storageServiceProvider.getUser().then((user) => {
          this.errorReportingProvider.logErrorOnAppServer('App Settings Error',
            'Error while committing application settings',
            user.AuthenticationToken,
            '',
            'AppSettingsPage.commitApplicationSetting',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        });
      }
    });
    return promise;
  };

  /**
   * 
   * Logout user and take back to login page
   * @memberof AppSettingsPage
   */
  logout() {
    let confirm = this.alertCtrl.create({
      title: 'Logging Out',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'No',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.Synchronization.setLogout(true);
          }
        }
      ]
    });
    confirm.present();
  }

}
