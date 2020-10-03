
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


/**
 * Importing neccassary liberaries and modules for this class 
 */
import { FormControl } from '@angular/forms';
import { ErrorReportingProvider } from './../../providers/error-reporting/error-reporting';
import { Subscription } from 'rxjs/Subscription';
import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { FormPage } from './../form/form';
import { ClientDbProcessResourcesProvider } from './../../providers/client-db-process-resources/client-db-process-resources';
import { ClientDbProcessWorkflowsProvider } from './../../providers/client-db-process-workflows/client-db-process-workflows';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Content } from 'ionic-angular';
import { ApplicationTabsPage } from '../tabs-application/ApplicationTabs';

/*
ModuleID: page-create-new
Description: Renders workflows from local database.
Location: ./pages/page-create-new
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@IonicPage()
@Component({
  selector: 'page-create-new',
  templateUrl: 'create-new.html',
})
export class CreateNewPage {
  searchControl: FormControl;//search control for create new
  processWorkflows = []; // stores process workflows list
  subscription: Subscription; // subscription for Searchbar 
  mysearch; // string for value of search query
  showOnSortApplied; // holds string value of key use to sort
  @ViewChild(Content) content: Content;

  descending: boolean = false;
  order: number;
  column: string = 'WorkflowDisplayName';

  workflowsUpdate: Subscription; // subscription for workflows updates
  processResourcesUpdate: Subscription; // subscription for process resources updates

  /**
   * Creates an instance of CreateNewPage.
   * @param {StorageServiceProvider} storageServiceProvider 
   * @param {NavController} navCtrl 
   * @param {ClientDbProcessWorkflowsProvider} ClientDBProcessWorkflows 
   * @param {NavParams} navParams 
   * @param {ClientDbProcessResourcesProvider} ClientDBProcessResources 
   * @param {App} app 
   * @param {ErrorReportingProvider} errorReportingProvider 
   * @param {BacknavigationProvider} _backNav 
   * @param {ProcessDataProvider} globalservice 
   * @memberof CreateNewPage
   */
  constructor(
    private storageServiceProvider: StorageServiceProvider,
    public navCtrl: NavController,
    private ClientDBProcessWorkflows: ClientDbProcessWorkflowsProvider,
    public navParams: NavParams,
    private ClientDBProcessResources: ClientDbProcessResourcesProvider,
    private app: App,
    private errorReportingProvider: ErrorReportingProvider,
    private _backNav: BacknavigationProvider,
    public globalservice: ProcessDataProvider) {
    this.searchControl = new FormControl();
    this.showOnSortApplied = ''
    this.mysearch = '';
    this.order = 0;
  }

  /**
  * go to my processes screen
  */
  gotomyprocess() {
    this.workflowsUpdate.unsubscribe();
    this.processResourcesUpdate.unsubscribe();
    this.globalservice.processId = 0;

    if(this.globalservice.processToast){
      this.globalservice.processToast.dismiss();
    }
    
    this.app.getRootNav().pop().catch((error) => {
      this.app.getRootNav().setRoot(ApplicationTabsPage, { tabIndex: 0 });
    });
  }

  /**
  * toggle sorts and change its order
  */
  toggleSortAndPublish(toggleSort) {
    this.descending = !this.descending;
    this.order = this.descending ? 1 : -1;
  }

  /**
  * Initialize the current Component. called after constructor
  * verify the permissions on workflows retrieved from local database
  */
  ngOnInit() {
    this.subscription = this._backNav.navItem$.subscribe(item => {
      this.mysearch = item;
    });

    this.ClientDBProcessWorkflows.getAllProcessWorkflows();
    this.ClientDBProcessResources.getAllProcessResources(this);
  }

  /**
  * register for search event
  */
  ionViewDidLoad() {
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this._backNav.changeNav(search);
    })
  }

  /**
  * View entering listener
  */
  ionViewWillEnter() {
    this.mysearch = '';
    this.globalservice.toggleSearch = false;
    this.globalservice.sort = false;
    this.globalservice.toggleSort = false;

    //observe workflows updates
    this.workflowsUpdate = this.ClientDBProcessWorkflows.workflowsUpdater$.subscribe(item => {
      this.updateProcessWorkFlows();
    })
    //observe process resources update
    this.processResourcesUpdate = this.ClientDBProcessResources.processesUpdater$.subscribe(item => {
      this.updateProcessWorkFlows();
    })

  }

  /**
  * View leaving listener
  */
  ionViewWillLeave() {
    this.globalservice.hideAllFilters = false;
    this.workflowsUpdate.unsubscribe();
    this.processResourcesUpdate.unsubscribe();
  }

  /**
   * Update the workflows from local db
   */
  updateProcessWorkFlows() {
    try {
      this.processWorkflows = [];
      var tempWFs = [];
      tempWFs = this.ClientDBProcessWorkflows.getProcessWorkflows(this.globalservice.processId);
      if (tempWFs) {
        var newVal = this.ClientDBProcessResources.getProcessSetting(this.globalservice.processId);
        var permissions = [];
        if (newVal) {
          if (newVal.processUserSettings.Process_User_Permissions) {
            permissions = newVal.processUserSettings.Process_User_Permissions;
          }
          else if (newVal.processUserSettings.User_Permissions) {
            permissions = newVal.processUserSettings.User_Permissions;
          }
          for (var i = 0; i < tempWFs.length; i++) {
            for (var j = 0; j < permissions.length; j++) {
              if (permissions[j].PermissionName === 'Add' &&
                permissions[j].ItemType === 'ProcessWorkflow' &&
                permissions[j].ID.toString() === tempWFs[i].WorkflowID.toString()) {
                this.processWorkflows.push(tempWFs[i]);
                break;
              }
            }
          }
        }
      }
    }
    catch (e) {
      this.processWorkflows = [];

      this.errorReportingProvider.logErrorOnAppServer('Error in workflows',
        'Error in extracting workflows on create new',
        this.globalservice.user.AuthenticationToken.toString(),
        '0',
        'CreateNewPage.updateProcessWorkFlows',
        e.message ? e.message : '',
        e.stack ? e.stack : '',
        new Date().toTimeString(),
        'Open',
        'Platform',
        '');
    }
  }


  /**
  * refreshes screen when ever angular cycle runs
  */
  ngDoCheck() {
    this.content.resize();
  }


  /**
  * open form from workflows
  */
  openForm(workflow) {
    this.globalservice.localForm = {};
    this.storageServiceProvider.getUser().then((user) => {
      this.globalservice.user = user;
      this.globalservice.reference = "New";
      this.globalservice.workflowId = workflow.WorkflowID;
      this.globalservice.actualFormId = 'new'
      this.app.getRootNav().push(FormPage);
    });
  }

}
