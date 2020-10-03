import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-processsettings
Description: Renders process settings. Uses local databse call to retrieve settings and synchronization service to create up sync tasks.
Location: ./pages/page-processsettings
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { ClientDbProcessResourcesProvider } from './../../providers/client-db-process-resources/client-db-process-resources';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { ApplicationTabsPage } from '../tabs-application/ApplicationTabs';
import { Subscription } from 'rxjs/Subscription';
import { App } from 'ionic-angular';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import { SocketProvider } from '../../providers/socket/socket';

/**
 * Generated class for the ProcesssettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-processsettings',
  templateUrl: 'processsettings.html',
})
export class ProcesssettingsPage {
  @ViewChild(Content) content: Content;

  processID: Number;//processid of current process
  processSetting: any;//process settings of the user
  processGlobalSetting: any;// global settings of process
  processGlobalSettingLive: any = null;// global settings of process fetched live from server
  allowOutOfOffice: any = {};//out of office setting
  proxyApprover: any = {};//proxy approver setting
  emailNotifications: Boolean = false;//email notifications settings
  processNotifications: Boolean = false;//process notifications setting

  processSettingsUpdate: Subscription; // subscription for app settings updates

  shownGroup: boolean = false; // Global flag to show the action buttons group


  /**
   * Class constructor
   */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public globalservice: ProcessDataProvider,
    private clientDbProcessResourcesProvider: ClientDbProcessResourcesProvider,
    private modal: ModalController,
    private Synchronization: SynchronizationProvider,
    private app: App,
    private storageServiceProvider: StorageServiceProvider,
    private errorReportingProvider: ErrorReportingProvider,
    private socket: SocketProvider) {
  }

  /**
   * Return to favorites screen
   */
  gotomyprocess() {
    this.globalservice.processId = 0;
    this.processSettingsUpdate.unsubscribe();

    if(this.globalservice.processToast){
      this.globalservice.processToast.dismiss();
    }
    
    this.app.getRootNav().pop().catch((error) => {
      this.app.getRootNav().setRoot(ApplicationTabsPage, { tabIndex: 0 });
    });
  }


  /**
   * Initialise the view
   */
  ngOnInit() {
    this.processGlobalSetting = {};
    this.clientDbProcessResourcesProvider.getAllProcessResources(this);
  }

  /**
   * Iterate the settings and update 
   * the view
   */
  ngDoCheck() {
    this.content.resize();
  }

  /**
  * View entering listener
  */
  ionViewWillEnter() {
    this.globalservice.toggleSearch = false;
    //observe app settings updates
    this.processSettingsUpdate = this.clientDbProcessResourcesProvider.processesUpdater$.subscribe(item => {
      this.updateProcessSetting();
    })
  }

  /**
  * View leaving listener
  */
  ionViewWillLeave() {
    this.globalservice.hideAllFilters = false;
    this.processSettingsUpdate.unsubscribe();
  }


  /**
   * Update the process setting from the local db
   */
  updateProcessSetting() {
    try{
      var newVal = this.clientDbProcessResourcesProvider.getProcessSetting(this.globalservice.processId);
      if(newVal){
        this.processSetting = newVal.processUserSettings;
        this.processGlobalSetting = newVal.processGlobalSettings;
    
        if (typeof this.processGlobalSetting.Process_Settings.PROCESS_ALERT == 'undefined') {
          this.processGlobalSetting.Process_Settings["PROCESS_ALERT"] = {};
        }
    
        if (typeof this.processSetting.Email_Notification !== 'undefined') {
          this.emailNotifications = false;
          if (typeof this.processSetting.Email_Notification.Allow != 'undefined') {
            if (this.processSetting.Email_Notification.Allow === 'True') {
              this.emailNotifications = true;
            }
          }
        }
        else {
          this.emailNotifications = false;
          this.processSetting.Email_Notification = { Allow: "False" };
        }
    
        if (typeof this.processSetting.Mute_Process != 'undefined') {
          this.processNotifications = true;
          if (typeof this.processSetting.Mute_Process.Allow != 'undefined') {
            if (this.processSetting.Mute_Process.Allow === 'True') {
              this.processNotifications = false;
            }
          }
        }
        else {
          this.processNotifications = true;
          this.processSetting.Mute_Process = { Allow: "False" };
        }
    
        if (typeof this.processSetting.Out_of_Office != 'undefined') {
          this.allowOutOfOffice.Allow = false;
          if (typeof this.processSetting.Out_of_Office.Delegated_To != 'undefined') {
            this.allowOutOfOffice.Allow = true;
          }
        }
        else {
          this.allowOutOfOffice.Allow = false;
          this.processSetting.Out_of_Office = {};
        }
    
        if (typeof this.processSetting.Proxy_Approver != 'undefined') {
          this.proxyApprover.Allow = false;
          if (typeof this.processSetting.Proxy_Approver.DisplayName != 'undefined') {
            this.proxyApprover.Allow = true;
          }
        }
        else {
          this.proxyApprover.Allow = false;
          this.processSetting.Proxy_Approver = {};
        }
      }
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Process Settings Error',
          'Error while loading process settings',
          user.AuthenticationToken,
          this.globalservice.processId?this.globalservice.processId:'',
          'ProcesssettingsPage.updateProcessSetting',
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
   * Toggle event handler for email, notifications, outofoffice and proxy settings
   */
  toggle(context, event) {
    try{
      if (context === 'email') {
        if (this.emailNotifications === false && this.processSetting.Email_Notification.Allow != 'False') {
          this.commitProcessSetting(context, { Allow: 'False' });
        }
        else if (this.emailNotifications === true && this.processSetting.Email_Notification.Allow != 'True') {
          this.commitProcessSetting(context, { Allow: 'True' });
        }
      }
  
      else if (context === 'notifications') {
        if (this.processNotifications === false && this.processSetting.Mute_Process.Allow != 'True') {
          this.commitProcessSetting('mute', { Allow: 'True' });
        }
        else if (this.processNotifications === true && this.processSetting.Mute_Process.Allow != 'False') {
          this.commitProcessSetting('mute', { Allow: 'False' });
        }
      }
  
      else if (context === 'outofoffice') {
        if (this.allowOutOfOffice.Allow === false && typeof this.processSetting.Out_of_Office.Delegated_To != 'undefined')//turned off..
        {
          this.commitProcessSetting(context, {});//commit application settings in local db..
        }
        else if (this.allowOutOfOffice.Allow === true && typeof this.processSetting.Out_of_Office.Delegated_To == 'undefined') {
          const outOfOfficeModal = this.modal.create('OutOfOfficeModalPage');
          outOfOfficeModal.onDidDismiss(data => {
            if (data != null) {
              this.commitProcessSetting(context, data);
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
        if (this.proxyApprover.Allow === false && typeof this.processSetting.Proxy_Approver.DisplayName != 'undefined')//turned off..
        {
          this.commitProcessSetting(context, {});//commit application settings in local db..
        }
        else if (this.proxyApprover.Allow === true && typeof this.processSetting.Proxy_Approver.DisplayName == 'undefined') {
          const proxyModal = this.modal.create('ProxyApproverModalPage');
          proxyModal.onDidDismiss(data => {
            if (data != null) {
              this.commitProcessSetting(context, data);
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
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Process Settings Error',
          'Error while updating process settings',
          user.AuthenticationToken,
          this.globalservice.processId?this.globalservice.processId:'',
          'ProcesssettingsPage.toggle',
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
 * Commit changes in ProcessSettings in localDB and add UpSync Tasks
 */
  commitProcessSetting(identity, value) {
    let promise = new Promise((resolve, reject) => {
      try{
        var taskQuery = {
          methodName: 'updateUserSettings',
          context: 'ProcessSettings',//ProcessSettings || ApplicationSettings
          processId: this.globalservice.processId,
          settingName: '',
          value: ''
        };
  
        var resource = this.clientDbProcessResourcesProvider.getProcessSetting(this.globalservice.processId);
  
        if (identity === 'outofoffice') {
          if (this.processSetting.Out_of_Office) {
            resource.processUserSettings.Out_of_Office = value;
            //commit in the sqlite..
            this.clientDbProcessResourcesProvider.updateProcessResource(this.globalservice.processId, 'ProcessSettings', JSON.stringify(resource), 0).then(() => {
              //add up-sync task for the server..
              taskQuery.settingName = 'Out_Of_Office';
              taskQuery.value = JSON.stringify(value);
              this.Synchronization.addNewSyncTask('Server', 'Process', this.globalservice.processId, 'Update', JSON.stringify(taskQuery), 'ProcessResources', 0, 'ProcessSettings').then(() => {
                this.Synchronization.startUpSync();
                resolve();
              });
              resolve();
            });
          }
        }
        else if (identity === 'proxy') {
          if (this.processSetting.Proxy_Approver) {
            var proxyApproverSetting: any = { 'Email': value.Email, 'DisplayName': value.DisplayName };
            if (!value.Email) {
              proxyApproverSetting = {};
            }
            resource.processUserSettings.Proxy_Approver = proxyApproverSetting;
            //commit in the sqlite..
            this.clientDbProcessResourcesProvider.updateProcessResource(this.globalservice.processId, 'ProcessSettings', JSON.stringify(resource), 0).then(() => {
              //add up-sync task for the server..
              taskQuery.settingName = 'Proxy_Approver';
              taskQuery.value = JSON.stringify(proxyApproverSetting);
              this.Synchronization.addNewSyncTask('Server', 'Process', this.globalservice.processId, 'Update', JSON.stringify(taskQuery), 'ProcessResources', 0, 'ProcessSettings').then(() => {
                this.Synchronization.startUpSync();
                resolve();
              });
              resolve();
            });
          }
        }
        else if (identity === 'mute') {
          resource.processUserSettings.Mute_Process = value;
          //commit in the sqlite..
          this.clientDbProcessResourcesProvider.updateProcessResource(this.globalservice.processId, 'ProcessSettings', JSON.stringify(resource), 0).then(() => {
            //add up-sync task for the server..
            taskQuery.settingName = 'Mute_Process';
            taskQuery.value = JSON.stringify(value);
            this.Synchronization.addNewSyncTask('Server', 'Process', this.globalservice.processId, 'Update', JSON.stringify(taskQuery), 'ProcessResources', 0, 'ProcessSettings').then(() => {
              this.Synchronization.startUpSync();
              resolve();
            });
            resolve();
          });
        }
        else if (identity === 'email') {
          resource.processUserSettings.Email_Notification = value;
          //commit in the sqlite..
          this.clientDbProcessResourcesProvider.updateProcessResource(this.globalservice.processId, 'ProcessSettings', JSON.stringify(resource), 0).then(() => {
            //add up-sync task for the server..
            taskQuery.settingName = 'Email_Notification';
            taskQuery.value = JSON.stringify(value);
            this.Synchronization.addNewSyncTask('Server', 'Process', this.globalservice.processId, 'Update', JSON.stringify(taskQuery), 'ProcessResources', 0, 'ProcessSettings').then(() => {
              this.Synchronization.startUpSync();
              resolve();
            });
            resolve();
          });
        }
      }
      catch (error) {
        this.storageServiceProvider.getUser().then((user) => {
          this.errorReportingProvider.logErrorOnAppServer('Process Settings Error',
            'Error while committing process settings',
            user.AuthenticationToken,
            this.globalservice.processId?this.globalservice.processId:'',
            'ProcesssettingsPage.commitProcessSetting',
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

  retrieveProcessGlobalSettings(){
    this.storageServiceProvider.getUser().then((user) => {
      var socketParameters = {
        userToken: user.AuthenticationToken,
        processId: this.globalservice.processId.toString(),
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType: 'PROCESS'
      };
      

      this.socket.callWebSocketService('retrieveProcessGlobalSettings', socketParameters)
        .then((response) => {
          this.processGlobalSettingLive = response;
        }).catch((error) => {
          if (error != 'NoConnection') {
            this.storageServiceProvider.getUser().then((user) => {
              this.errorReportingProvider.logErrorOnAppServer('Process Settings Error',
                'Error while loading process global settings from server',
                user.AuthenticationToken.toString(),
                '0',
                'SubmissionsPage.fetchLookupValuesFromServer(socket.retrieveProcessLookupData)',
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
  * Toggle workflow routing group
  */
  toggleGroup() {
    this.shownGroup = !this.shownGroup;
    if(this.shownGroup && this.processGlobalSettingLive== null){
      this.retrieveProcessGlobalSettings();
    }
  };

  /**
  * Check if the group is shown
  */
  isGroupShownmethod(group) {
    return this.shownGroup;
  };


  /**
   * On view entering
   */
  ionViewDidEnter() {
    this.globalservice.hideAllFilters = true;
  }

}
