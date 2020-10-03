/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-process
Description: Renders process level tabs.
Location: ./pages/page-process
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { ProcessMetricsPage } from './../process-metrics/process-metrics';
import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { CountServiceProvider } from './../../providers/count-service/count-service';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { ProcesssettingsPage } from './../processsettings/processsettings';
import { NotificationsPage } from './../notifications/notifications';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { ApplicationTabsPage } from './../tabs-application/ApplicationTabs';
import { ProcessLookupsPage } from './../process-lookups/process-lookups';
import { AddonsPage } from './../addons/addons';
import { PivotsPage } from './../pivots/pivots';
import { ReportsPage } from './../reports/reports';
import { SubmissionsPage } from './../submissions/submissions';
import { CreateNewPage } from './../create-new/create-new';
import { PendingTasksPage } from './../pending-tasks/pending-tasks';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, App, Content, Tabs, NavParams } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { FormControl } from '@angular/forms';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import { ClientDbProcessResourcesProvider } from '../../providers/client-db-process-resources/client-db-process-resources';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import * as moment from 'moment';


@IonicPage({
  name: 'test',
  segment: 'test/hassan',
  defaultHistory: ['MyProcessesPage']
})
@Component({
  selector: 'page-process',
  templateUrl: 'process.html'
})
export class ProcessPage {

  searchControl: FormControl; //search form contrl
  processCounts;//total processes
  processId;//selected process id
  inboxcount = 0;//app notifications count
  taskcount = 0;//tasks count
  pendingTasksRoot = PendingTasksPage //pending task page reference
  createNewRoot = CreateNewPage// create new page reference
  submissionsRoot = SubmissionsPage//submissions page refernce
  reportsRoot = ReportsPage//reports page refernce
  pivotsRoot = PivotsPage//pivot page reference
  addonsRoot = AddonsPage//addon page reference
  processLookupsRoot = ProcessLookupsPage//process lookup page refenrece
  notificationsRoot = NotificationsPage//notification page refrence
  processSettingsRoot = ProcesssettingsPage//process settings page reference
  processMetricsRoot = ProcessMetricsPage//process metrics page reference
  parentTitle: string;//top title to show
  subscription: Subscription;//subscription service
  @ViewChild(Tabs) tabs: Tabs;//tabs object
  @ViewChild(Content) content: Content;//current content

  myIndex;//current index

  processResourcesUpdate: Subscription; // subscription for process resources updates


  /**
 * Default contructor of component.
 */
  constructor(
    public navCtrl: NavController,
    private _backNav: BacknavigationProvider,
    private _navService: CountServiceProvider,
    private storageServiceProvider: StorageServiceProvider,
    public app: App, public globalservice: ProcessDataProvider,
    private synchronizationProvider: SynchronizationProvider,
    public navparams: NavParams,
    public errorReportingProvider: ErrorReportingProvider,
    private clientDBProcessResources: ClientDbProcessResourcesProvider,
    public toast: ToastController) {
    this.myIndex = this.navparams.data.tabIndex || 0;

    this.processId = parseInt(this.globalservice.processId);
    this.searchControl = new FormControl();
    this.globalservice.sort = false;
    this.globalservice.toggleSearch = false;
    this.globalservice.hideAllFilters = false;

    this.synchronizationProvider.startUpSync();
    this.synchronizationProvider.startDownSync(false);
  }

  /**
 * Subscribe to notification navigation
 */
  notificationNavSubscription: Subscription = this.synchronizationProvider.processLockNav$.subscribe(item => {
    if (item != false) {
      this.synchronizationProvider.setProcessLockNav(false);
      if (this.globalservice.processId.toString() === item.toString()) {
        this.app.getRootNav().setRoot(ApplicationTabsPage);
        this.notificationNavSubscription = null;
      }
    }
  })



  /**
 * Component initialization lifecycle hook
 */
  ngOnInit() {

    this.processId = parseInt(this.globalservice.processId);

    this.storageServiceProvider.getNotificationCounts().then((result) => {
      if (parseInt(result[this.processId].TaskCount) > 0) {
        this.taskcount = result[this.processId].TaskCount
      }
      else {
        this.taskcount = null;
      }
      if (parseInt(result[this.processId].InboxCount) > 0) {
        this.inboxcount = result[this.processId].InboxCount
      }
      else {
        this.inboxcount = null;
      }
    }).catch((err) => {
      this.taskcount = null;
      this.inboxcount = null;
    });

    //subscription for more items
    this.subscription = this._navService.navItem$
      .subscribe(item => {
        try {
          this.processCounts = item;
          this.processId = parseInt(this.globalservice.processId);
          if (this.processCounts) {
            if (this.processCounts[this.processId]) {
              if (parseInt(this.processCounts[this.processId].TaskCount) > 0) {
                this.taskcount = this.processCounts[this.processId].TaskCount
              }
              else {
                this.taskcount = null;
              }
              if (parseInt(this.processCounts[this.processId].InboxCount) > 0) {
                this.inboxcount = this.processCounts[this.processId].InboxCount
              }
              else {
                this.inboxcount = null;
              }
            }
          }
        }
        catch (error) {
          this.inboxcount = null;
          this.taskcount = null;
        }
      })

      this.processResourcesUpdate = this.clientDBProcessResources.processesUpdater$.subscribe(item => {
        this.updateProcessSettings();
      })

      try {
        if(this.globalservice.processpermissions.processGlobalSettings.Process_Settings.PROCESS_ALERT){
          let processOffset = this.globalservice.processpermissions.processGlobalSettings.Process_Settings.PROCESS_TIMEZONE;
          let expiryDate = this.globalservice.processpermissions.processGlobalSettings.Process_Settings.PROCESS_ALERT.ExpiryDate;
  
          //apply alert based on alert object
          if (this.globalservice.processpermissions.processGlobalSettings.Process_Settings.PROCESS_ALERT) {
            // var now = new Date();
            // var toDate = Date.parse(this.globalservice.processpermissions.processGlobalSettings.Process_Settings.PROCESS_ALERT.ExpiryDate)
            expiryDate = moment.utc(expiryDate).format('DD-MMM-YYYY hh:mm A');
            let thisDate = moment.utc().zone(processOffset).format('DD-MMM-YYYY hh:mm A');
  
            if (Date.parse(expiryDate) > Date.parse(thisDate)) {
              if (this.globalservice.processpermissions.processGlobalSettings.Process_Settings.PROCESS_ALERT.AlertText.length > 0) {
                if(!this.globalservice.processToastShown){
                  this.globalservice.processToastShown = true;
                  this.globalservice.processToast = this.toast.create({
                    message: this.globalservice.processpermissions.processGlobalSettings.Process_Settings.PROCESS_ALERT.AlertText,
                    position: 'bottom',
                    showCloseButton: true,
                    closeButtonText: 'X'
                  })
                  this.globalservice.processToast.onDidDismiss(() => {
                    this.globalservice.processToastShown = false;
                    ///undo operation
                  });
                  this.globalservice.processToast.present();
                }
              }
            }
          }
        }
      }
      catch (e) {
        this.globalservice.processToastShown = false;
      }
  }

  /**
  * Life cycle destroy life cycle hook.
  */
  ngOnDestroy() {
    if (this.subscription) {
      // prevent memory leak when component is destroyed
      this.subscription.unsubscribe();
    }
    if (this.processResourcesUpdate) {
      // prevent memory leak when component is destroyed
      this.processResourcesUpdate.unsubscribe();
    }
  }

  /**
   * Ion view load lifecycle hook
   */
  ionViewDidLoad() {
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this._backNav.changeNav(search);
    })
  }


  /**
  * Toggle alhpa sorting
  */
  toggleSortAndPublish(toggleSort) {

    this.globalservice.sort = toggleSort;

  }


  /**
   * Update the process global settings and permissions
   */
  updateProcessSettings() {
    this.globalservice.processpermissions = this.clientDBProcessResources.getProcessSetting(this.globalservice.processId);
    this.globalservice.processDiagnosticLog = this.globalservice.getDiagnosticLoggingFlag(this.globalservice.processpermissions.processGlobalSettings.Process_Settings.DIAGNOSTIC_LOGGING).toString();
  }

}
