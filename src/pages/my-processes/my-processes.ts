import { CountServiceProvider } from './../../providers/count-service/count-service';

/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


import { Subscription } from 'rxjs/Subscription';
import { ENV } from './../../config/environment.prod';
import { ClientDbAppResourcesProvider } from './../../providers/client-db-app-resources/client-db-app-resources';
import { MyProcessesPendingApprovalPopupPage } from './../my-processes-pending-approval-popup/my-processes-pending-approval-popup';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ClientDbProcessResourcesProvider } from './../../providers/client-db-process-resources/client-db-process-resources';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { SocketProvider } from './../../providers/socket/socket';
import { LoadingProvider } from './../../providers/loading/loading';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { ClientDbProvider } from './../../providers/client-db/client-db';
import { Platform } from 'ionic-angular/index';
import { ClientDbMyProcessesProvider } from './../../providers/client-db-my-processes/client-db-my-processes';
import { ProcessPage } from './../process/process';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController, Content, ToastController } from 'ionic-angular';
import { Nav } from 'ionic-angular'
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import * as moment from 'moment';


/*
ModuleID: page-my-processes
Description: Renders favorites page. Uses local data base table and synchronization service to synchronize this page on other devices.
Location: ./pages/page-my-processes
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@IonicPage()
@Component({
  selector: 'page-my-processes',
  templateUrl: 'my-processes.html'
})
export class MyProcessesPage implements OnInit {

  @ViewChild(Nav) nav: Nav; // use to get nav element reference from the html
  @ViewChild(Content) content: Content; // use to get content element reference from the html
  MyProcesses; // contains a list of my processes
  processSetting; // process settings of processes
  processCounts; // shows counts infront of a process
  user; // current loggedin user
  toggleSearch; // toggles search menu
  searchField; //search field value

  myProcessesUpdate: Subscription; // subscription for process updates
  processesResourcesUpdate: Subscription; // subscription for process resources
  processesCountsUpdate: Subscription; // subscription for process counts changes

  shownErrorDialogue: Boolean = false;


  constructor(
    public Synchronization: SynchronizationProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public toast: ToastController,
    private clientDbAppResourcesProvider: ClientDbAppResourcesProvider,
    public modalCtrl: ModalController,
    private ClientDBMyProcesses: ClientDbMyProcessesProvider,
    private ClientDBProcessResources: ClientDbProcessResourcesProvider,
    private platform: Platform,
    public clientDbProvider: ClientDbProvider,
    private storageServiceProvider: StorageServiceProvider,
    private loading: LoadingProvider,
    private socialsharing: SocialSharing,
    public globalservice: ProcessDataProvider,
    private socket: SocketProvider,
    private errorReportingProvider: ErrorReportingProvider,
    private countServiceProvider: CountServiceProvider) {
    this.MyProcesses = [];
  }

  /**
  * refreshes view for any styling issues
  */
  ngDoCheck() {
    this.content.resize();
  }

  /**
  * Updates my processes view if anything is updated in the local database.
  */
  updateMyProcesses() {
    try {
      this.MyProcesses = this.ClientDBMyProcesses.returnAllMyProcessData();
      this.processSetting = this.ClientDBProcessResources.getAllProcessesSettings();
      this.processCounts = this.storageServiceProvider.getProcessCounts();

      for (var i = 0; i < this.MyProcesses.length; i++) {
        if (this.Synchronization.lockProcesses) {
          if (!this.Synchronization.lockProcesses[this.MyProcesses[i].ProcessID]) {
            this.Synchronization.lockProcesses[this.MyProcesses[i].ProcessID] = 0;
          }
        }
      }
    }
    catch (error) {
      if (!this.shownErrorDialogue) {
        this.shownErrorDialogue = true;
        this.MyProcesses = [];
        this.processSetting = [];
        this.processCounts = [];

        this.storageServiceProvider.getUser().then((user) => {
          this.errorReportingProvider.logErrorOnAppServer('Favorites Error',
            'Error while loading processes',
            user.AuthenticationToken,
            '0',
            'MyProcessesPage.updateMyProcesses',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        });
      }
    }
  }

  /**
  * Reset search and sort upon view enter
  */
  ionViewWillEnter() {

    this.toggleSearch = false;
    this.searchField = '';

    //observe my processes updates
    this.myProcessesUpdate = this.ClientDBMyProcesses.processesUpdater$.subscribe(item => {
      this.updateMyProcesses();
    })
    //observe process reources updates
    this.processesResourcesUpdate = this.ClientDBProcessResources.processesUpdater$.subscribe(item => {
      this.updateMyProcesses();
    })
    //observe process counts updates
    this.processesCountsUpdate = this.countServiceProvider.navItem$.subscribe(item => {
      this.updateMyProcesses();
    })
  }

  /**
  * Reset search and sort upon view leave
  */
  ionViewWillLeave() {
    this.toggleSearch = false;
    this.searchField = '';

    this.myProcessesUpdate.unsubscribe();
  }

  /**
  * get the active tab
  */
  getState() {
    this.navCtrl.getActive();
  }

  /**
  * Initializes the Component. Called after constructor
  * Shows a toast if anything is present in app settings for app alert
  */
  ngOnInit() {
    try {
      this.platform.ready().then(() => {
        setTimeout(() => {
          this.ClientDBMyProcesses.getAllMyProcesses();
          this.clientDbAppResourcesProvider.getAllAppResources().then(() => {
            var settings = this.clientDbAppResourcesProvider.getPlatformSettings();
            if (settings.Value) {
              let expiryDate = moment.utc(settings.Value.ExpiryDate).format('DD-MMM-YYYY hh:mm A');
              let thisDate = moment.utc().format('DD-MMM-YYYY hh:mm A');

              if (Date.parse(expiryDate) > Date.parse(thisDate)) {
                this.toast.create({
                  message: settings.Value.AlertText,
                  position: 'bottom',
                  showCloseButton: true,
                  closeButtonText: 'X'
                }).present()
              }
            }
          });
          this.ClientDBProcessResources.getAllProcessResources(this);
          this.storageServiceProvider.getNotificationCounts();
        }, 200);
      });
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Favorites Error',
          'Error while initializing processes',
          user.AuthenticationToken,
          '0',
          'MyProcessesPage.ngOnInit',
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
  * Open ups a process screen.
  * sets all the required object on the process before opening. including permissions and settings
  */
  gotoProcess(process) {
    try{
      this.toggleSearch = false;
      this.searchField = '';
      var self = this;
      if (self.getProcessLock(process.ProcessID) === 0) {
        self.storageServiceProvider.getUser().then((user) => {
          self.ClientDBProcessResources.getAllProcessResources(self).then((scope: any) => {
            self.clientDbAppResourcesProvider.getAllAppResources().then(() => {
              self.globalservice.platformsettings = self.clientDbAppResourcesProvider.getAllPlatformSettings();
              self.globalservice.processpermissions = scope.ClientDBProcessResources.getProcessSetting(process.ProcessID);
              self.globalservice.processDiagnosticLog = self.globalservice.getDiagnosticLoggingFlag(self.globalservice.processpermissions.processGlobalSettings.Process_Settings.DIAGNOSTIC_LOGGING).toString();
              self.globalservice.user = user;
              self.globalservice.processId = process.ProcessID;
              self.globalservice.name = process.ProcessName;
              self.globalservice.processOrganization = process.OrganizationName;
              self.globalservice.processImg = process.ProcessImage;
              self.globalservice.processToastShown = false;
              self.app.getRootNav().push(ProcessPage);
            });
          });
        });
      }
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Favorites Error',
          'Error while retrieving process data',
          user.AuthenticationToken,
          process.ProcessID ? process.ProcessID:'',
          'MyProcessesPage.gotoProcess',
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
  * Locks a process if an update has arrived for the current process.
  */
  getProcessLock(processId) {
    if (this.Synchronization.lockProcesses) {
      return this.Synchronization.lockProcesses[processId];
    }
    else {
      return 1;
    }
  };

  /**
  * returns process lock type.
  */
  getProcessLockType() {
    return this.Synchronization.processLockType;
  };


  /**
  * return count of each process.
  */
  getProcessCount(procesID) {
    try{
      let myprocesID = parseInt(procesID);
      if (this.processCounts) {
        if (this.processCounts[procesID]) {
          if (this.processCounts.length !== 0 || this.processCounts[procesID]) {
            var inboxCount = 0;
            var taskCount = 0;
            if (typeof this.processCounts[myprocesID].InboxCount != undefined) {
              inboxCount = parseInt(this.processCounts[myprocesID].InboxCount) || 0;
            }
            if (this.processCounts[myprocesID].TaskCount) {
              taskCount = parseInt(this.processCounts[myprocesID].TaskCount) || 0;
            }
            return inboxCount + taskCount;
          }
        }
      }
      return 0;
    }
    catch (error) {
      return 0;
    }
  };


  isUndefined(obj) {
    var type = typeof obj;
    if (type === 'undefined')
      return true;
    else
      return false;
  }



  /**
  * Start synchronization
  */
  ionViewDidEnter() {
    this.toggleSearch = false;
    this.searchField = '';

    this.Synchronization.startUpSync();
    this.Synchronization.startDownSync(false);
  }


  /**
  * Remove process from the list
  * Uses synchronization service to sync other devices.
  */
  removeProcess(process, itemsliding) {
    if(this.getProcessLock(process.ProcessID) != 1){
      try{
        itemsliding.close();
        this.storageServiceProvider.getUser().then((user) => {
          this.user = user;
          var unsubcribeporcess = {
            userToken: this.user.AuthenticationToken,
            processId: process.ProcessID.toString(),
            action: 'Remove',
            diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
            operationType : 'APPLICATION'
          };
          this.loading.presentLoading("Removing process from favorites...", 20000);
          var unsubscribedResult = this.socket.callWebSocketService('unSubscribeProcess', unsubcribeporcess);
          unsubscribedResult.then((result) => {
            this.loading.hideLoading();
            this.Synchronization.flushProcessData(process.ProcessID.toString(), false);
            this.Synchronization.startDownSync(false);
          }).catch(error => {
            this.loading.hideLoading();
            if (error != 'NoConnection') {
              this.errorReportingProvider.logErrorOnAppServer('Removing Process Error',
                'Error in removing process from favorites',
                this.user.AuthenticationToken.toString(),
                process.ProcessID.toString(),
                'MyProcessesPage(socket.unSubscribeProcess)',
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
      catch (error) {
        this.storageServiceProvider.getUser().then((user) => {
          this.errorReportingProvider.logErrorOnAppServer('Favorites Error',
            'Error while removing process from directory',
            user.AuthenticationToken,
            process.ProcessID ? process.ProcessID:'',
            'MyProcessesPage.removeProcess',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        });
      }
    }
    else{
      alert('Process update in progress');
    }
  }

  /**
  * Mute process so that no further push notifications are sent
  * Uses synchronization service to sync other devices.
  */
  muteProcess(process, slidingitem) {
    try{
      slidingitem.close();
      this.ClientDBProcessResources.getAllProcessResources(this).then(() => {
        var resource = this.ClientDBProcessResources.getProcessSetting(process.ProcessID);
  
        if (typeof resource.processUserSettings.Mute_Process != 'undefined') {
          if (typeof resource.processUserSettings.Mute_Process.Allow != 'undefined') {
            if (resource.processUserSettings.Mute_Process.Allow == 'False') {
              resource.processUserSettings.Mute_Process.Allow = 'True';
            }
            else if (resource.processUserSettings.Mute_Process.Allow == 'True') {
              resource.processUserSettings.Mute_Process.Allow = 'False';
            }
          }
          else {
            resource.processUserSettings.Mute_Process = { Allow: "True" };
          }
        }
        else {
          resource.processUserSettings.Mute_Process = { Allow: "True" };
        }
        this.ClientDBProcessResources.updateProcessResource(process.ProcessID, 'ProcessSettings', JSON.stringify(resource), 0).then(() => {
          var taskQuery = {
            methodName: 'updateUserSettings',
            context: 'ProcessSettings',
            processId: process.ProcessID,
            settingName: 'Mute_Process',
            value: JSON.stringify(resource.processUserSettings.Mute_Process)
          }
          this.Synchronization.addNewSyncTask('Server', 'Process', process.ProcessID, 'Update', JSON.stringify(taskQuery), 'ProcessResources', 0, 'ProcessSettings').then(() => {
            this.Synchronization.startUpSync();
          });
        });
      });
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Favorites Error',
          'Error while applying process setting',
          user.AuthenticationToken,
          process.ProcessID ? process.ProcessID:'',
          'MyProcessesPage.muteProcess',
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
  * called on share button is clicked. Uses social sharing plugin to get messages apps and share links
  */
  shareProcess(process, itemsliding) {

    var weblink = ENV.WEB_SERVER_URL + "sharedurl?route=process&processID=" + process.ProcessID
    this.socialsharing.share(weblink).then((val) => {
      itemsliding.close();
    });
  }

  /**
  * decode text in notification to be rendered on html
  */
  decodeText(encodedText) {
    return decodeURIComponent(encodedText);
  };

  /**
  * Toggle mute icon
  */
  showMuteIcon(process) {
    if (typeof this.processSetting == 'undefined') {
      return false;
    }
    if (this.processSetting[process.ProcessID].processUserSettings) {
      if (this.processSetting[process.ProcessID].processUserSettings.Mute_Process.Allow === 'True') {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }


  }

  /**
  * Open up pending approval modal
  */
  openModalPendingApproval(process) {
    let directoryModal = this.modalCtrl.create(MyProcessesPendingApprovalPopupPage, { params: process });
    directoryModal.present();
  }




}
