import { FormControl } from '@angular/forms';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-submissions
Description: Renders workflow submissions from server. Uses sockets and pipes to filter view.
Location: ./pages/page-submissions
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { ClientDbSynchronizationTasksProvider } from './../../providers/client-db-synchronization-tasks/client-db-synchronization-tasks';
import { ClientDbWorkflowSubmissionsProvider } from './../../providers/client-db-workflow-submissions/client-db-workflow-submissions';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { FormPage } from './../form/form';
import { Subscription } from 'rxjs/Subscription';
import { HelperProvider } from './../../providers/helper/helper';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { ClientDbProcessWorkflowsProvider } from './../../providers/client-db-process-workflows/client-db-process-workflows';
import { ClientDbProcessResourcesProvider } from './../../providers/client-db-process-resources/client-db-process-resources';
import { LoadingProvider } from './../../providers/loading/loading';
import { SocketProvider } from './../../providers/socket/socket';
import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Content, App } from 'ionic-angular';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import { ApplicationTabsPage } from '../tabs-application/ApplicationTabs';

/**
 * Generated class for the SubmissionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-submissions',
  templateUrl: 'submissions.html',
  providers: [ClientDbProcessWorkflowsProvider, ClientDbProcessResourcesProvider]
})
export class SubmissionsPage implements OnInit {

  user; // Global variable of class to store the currrent user
  Submissions; // Global variable of class to store submissions for the workflow
  processWorkflows; // Global variable of class to store process workflows for submissions
  selectedWorkflow; // Global variable of class to store selected workflow for submissions
  SubmittedBy; // Global variable of class to store whose submitted the request
  selectedSubmittedBy; // Global variable of class to store selected person who submitted the request
  Status; // Global variable of class to store the status of the current workflow
  selectedStatus; // Global variable of class to store displayed status of the current workflow
  processSettings; // Global variable of class to store process settings for the process
  isGroupShown; // Global flag to check if the group is shown or hidden
  isRouteShown; // Global flag to check if the routing is shown or hidden
  shownGroup; // Global variable of class to store group shown
  shownRoute; // Global variable of class to store routing shown
  sort; // Global variable of class to store the sort sequence of the submissions
  mysearch; // Global variable of class to store the current search filter for the submissions
  subscription: Subscription // Global variable of class to store subscription of the process
  searchControl: FormControl; // Global variable of class to store form control of filter
  searchQuery; // Global variable of class to store filter string for submissions
  toggleSearch; // Global flag to toggle search on or off
  pageSize; // Global variable of class to store page size for submissions
  pageNumber; // Global variable of class to store page number for submissions
  noMore; // Global variable of class to store submissions limit
  refresher; // Global flag to refresh the submissions
  showLoading; // Global flag to check if the submissions is loading or not

  showfiltericon: boolean = false;

  @ViewChild(Content) content: Content;

  /**
  * Class constructor
  */
  constructor(public navCtrl: NavController,
    public ClientDBProcessWorkflows: ClientDbProcessWorkflowsProvider,
    public navParams: NavParams,
    private app: App,
    public ClientDBProcessResources: ClientDbProcessResourcesProvider,
    private loading: LoadingProvider,
    private alertCtrl: AlertController,
    private ClientDbSynchronizationTasks: ClientDbSynchronizationTasksProvider,
    private ClientDBWorkflowSubmissions: ClientDbWorkflowSubmissionsProvider,
    private helper: HelperProvider,
    private modal: ModalController,
    private _backNav: BacknavigationProvider,
    private storageServiceProvider: StorageServiceProvider,
    public Synchronization: SynchronizationProvider,
    private socket: SocketProvider,
    public globalservice: ProcessDataProvider,
    private errorReportingProvider: ErrorReportingProvider) {
    this.Submissions = [];
    this.processWorkflows = [];
    this.SubmittedBy = [];
    this.noMore = false;
    this.searchQuery = "";
    this.searchControl = new FormControl();
    this.refresher = null;
    this.showLoading = false;
    this.sort = 'desc';

    /**
    * Function to filter through the submissions with the input query entered by user
    */
    this.searchControl.valueChanges.debounceTime(1200).subscribe(search => {
      if (this.searchQuery != search) {
        if (search.length > 0) {
          this.searchQuery = search;
          this.pageNumber = 1;
          this.showLoading = true;
          this.getWorkflowsFromServer('reset');
        }
        else if (search.length <= 0 && this.searchQuery.length > 0) {
          this.searchQuery = search;
          this.pageNumber = 1;
          this.showLoading = true;
          this.getWorkflowsFromServer('reset');
        }
        else {
          this.searchQuery = "";
        }
      }
    })
  }

  /**
  * Naviagte to my processes tab
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
  * show/hide sort and publish icon for the user
  */
  toggleSortAndPublish(toggleSort) {
    if (toggleSort) {
      this.sort = 'asc';
    }
    else {
      this.sort = 'desc';
    }
    this.pageNumber = 1;
    this.showLoading = true;
    this.getWorkflowsFromServer('reset');
  }

  /**
  * Function triggered when the ion view enters
  */
  ionViewWillEnter() {
    this.globalservice.toggleSearch = false;
    this.mysearch = '';
    this.sort = 'desc';
  }

  /**
  * Function triggered when the ion view leaves
  */
  ionViewWillLeave() {
    this.globalservice.hidesort = false;
  }


  /**
  * Function to refresh the current view
  */
  doRefresh(refresher) {
    refresher.complete();
    this.pageNumber = 1;
    this.showLoading = true;
    this.getWorkflowsFromServer('reset');
  }

  /**
  * Function to trigger resize of the current content
  */
  ngDoCheck() {
    this.content.resize();
  }

  /**
  * The initialize function for submissions component
  */
  ngOnInit() {
    try {
      this.showfiltericon = false;
      
      this.pageSize = 10;
      this.pageNumber = 1;
      this.toggleSearch = false;
      this.showLoading = true;

      this.subscription = this._backNav.navItem$.subscribe(item => {
        this.mysearch = item;
      });
      this.storageServiceProvider.getUser().then((user) => {
        this.user = user;
        this.SubmittedBy = [
          {
            filterby: 'Me',
            value: this.user.Email
          },
          {
            filterby: 'My Direct Reports',
            value: this.user.ManagerEmail
          },
          {
            filterby: 'Everyone',
            value: 'all'
          }];
        this.selectedSubmittedBy = this.SubmittedBy[0];
      });

      this.globalservice.hidesort = true;
      this.showfiltericon = true;
      this.content.resize();
      if (this.processWorkflows.length > 0) {
        this.selectedWorkflow = this.processWorkflows[0];
        this.Status = this.updateStatusFilter(this.processWorkflows[0]);
        this.getWorkflowsFromServer('reset');
      }
      else {
        this.ClientDBProcessWorkflows.getAllProcessWorkflows().then(() => {
          var tempWFs = [];
          tempWFs = this.ClientDBProcessWorkflows.getProcessWorkflows(this.globalservice.processId);
          this.processWorkflows = tempWFs;
          this.selectedWorkflow = this.processWorkflows[0];
          this.Status = this.updateStatusFilter(this.processWorkflows[0]);
          this.getWorkflowsFromServer('reset');
        });
      }
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Submissions Error',
          'Error initializing submissions from workflow',
          user.AuthenticationToken.toString(),
          '0',
          'SubmissionsPage(ngOnInit)',
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
  * Update the tasks as per the filter selected by user for teh current workflow
  */
  updateStatusFilter(workflow) {
    var statuses = [];
    for (let key in workflow.WorkflowSettingsJSON[0].Workflow_Status_Labels) {
      var temp = {
        name: key,
        value: workflow.WorkflowSettingsJSON[0].Workflow_Status_Labels[key]
      };
      if (key === 'PENDING') {
        this.selectedStatus = temp;
      }
      if (key !== 'INITIATING') {
        statuses.push(temp);
      }
    }
    var all = {
      name: 'All',
      value: workflow.WorkflowSettingsJSON[0].SubmissionsDefinition["AllFilterDisplay"]
    };
    statuses.push(all);
    return statuses;
  }

  /**
  * Function triggered when the current workflow is changed
  */
  workflowChanged() {
    this.pageNumber = 1;
    this.showLoading = true;
    this.getWorkflowsFromServer('reset');
  }

  /**
  * Function triggered when submitted by is changed
  */
  submittedByChanged() {
    this.pageNumber = 1;
    this.showLoading = true;
    this.getWorkflowsFromServer('reset');
  }

  /**
  * Function tiggered when status is changed
  */
  statusChanged() {
    this.pageNumber = 1;
    this.showLoading = true;
    this.getWorkflowsFromServer('reset');
  }


  /**
  * Function triggered when user is scrolling on the submissions
  */
  doInfinite(infiniteScroll) {
    if (!this.noMore) {
      this.pageNumber++;
      this.getWorkflowsFromServer(infiniteScroll);
    }
    else {
      infiniteScroll.complete();
    }
  }


  /**
  * Return workflow submissions from the server
  */
  getWorkflowsFromServer(infiniteScroll) {
    this.storageServiceProvider.getUser().then((user) => {
      this.user = user;
      var directoryCall = {
        userToken: this.user.AuthenticationToken,
        processId: this.globalservice.processId,
        workflowId: this.selectedWorkflow.WorkflowID,
        initiatedByFilter: this.selectedSubmittedBy.filterby.toString(),
        statusFilter: this.selectedStatus.name.toString(),
        sorting: this.sort.toString(),
        numberOfRows: "10",
        desiredPageNumber: this.pageNumber.toString(),
        searchValue: this.searchQuery,
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'PROCESS'
      };

      if (this.pageNumber == 1) {
        this.Submissions = [];
        this.noMore = false;
      }
      if (this.showLoading) {
        this.loading.presentLoading("Loading submissions...", 10000);
      }
      //called when submissions detail needs to be retrieved
      var SubmissionsResult = this.socket.callWebSocketService('retrieveWorkflowSubmissionDetails', directoryCall);
      SubmissionsResult.then((result) => {
        var exc = false;
        try {
          if (this.refresher != null) {
            this.refresher.complete();
          }
          if (this.showLoading) {
            this.loading.hideLoading();
            this.showLoading = false;
          }
          else if (typeof infiniteScroll != 'string') {
            infiniteScroll.complete();
          }

          if (result[0].DataIsFiltered == 1) {
            this.showfiltericon = true;
          }
          else {
            this.showfiltericon = false;
          }
          var tempSubmissions = JSON.parse(result[0].WorkflowSubmissions);
          if (tempSubmissions.length == 0) {
            this.noMore = true;
            return;
          }
         


          for (var i = 0; i < tempSubmissions.length; i++) {
            if (tempSubmissions[i].Status.toLowerCase() == 'pending') {
              tempSubmissions[i].FormTasks = this.helper.parseJSONifString(tempSubmissions[i].FormTasks);
              tempSubmissions[i].PendingSince = "";
              let pendingTasksCount = 0;
              for (let j = 0; j < tempSubmissions[i].FormTasks.length; j++) {

                if (tempSubmissions[i].FormTasks[j].Result == "Pending") {
                  tempSubmissions[i].PendingSince = tempSubmissions[i].FormTasks[j].DateStarted;
                  tempSubmissions[i].PendingTaskName = tempSubmissions[i].FormTasks[j].TaskName;
                  tempSubmissions[i].PendingTaskAssigneeName = tempSubmissions[i].FormTasks[j].AssignedToName
                  pendingTasksCount++;
                }
              }
              if (pendingTasksCount > 1) {
                tempSubmissions[i].PendingTaskAssigneeName = "Multiple Assignees";
              }
              tempSubmissions[i].myFormTask = this.getPendingTasksJSON(tempSubmissions[i].FormTasks);
            }
          }

          for (i = 0; i < tempSubmissions.length; i++) {
            this.Submissions.push(tempSubmissions[i]);
          }
        }
        catch (error) {
          exc = true;
          if (error != 'NoConnection') {
            this.storageServiceProvider.getUser().then((user) => {
              this.errorReportingProvider.logErrorOnAppServer('Submissions Error',
                'Error while processing submissions',
                user.AuthenticationToken.toString(),
                '0',
                'SubmissionsPage(socket.retrieveWorkflowSubmissionDetails)',
                error.message ? error.message : '',
                error.stack ? error.stack : '',
                new Date().toTimeString(),
                'open',
                'Platform',
                '');
            });
          }
        }
        finally {
          if (exc) {
            this.Submissions = [];
          }
        }
      }).catch(error => {
        this.loading.hideLoading();
        if (error != 'NoConnection') {
          this.storageServiceProvider.getUser().then((user) => {
            this.errorReportingProvider.logErrorOnAppServer('Submissions Error',
              'Error while processing submissions',
              user.AuthenticationToken.toString(),
              '0',
              'SubmissionsPage(socket.retrieveWorkflowSubmissionDetails)',
              error.message ? error.message : '',
              error.stack ? error.stack : '',
              new Date().toTimeString(),
              'open',
              'Platform',
              '');
          });
        }
        if (error == 'NoConnection') {
          this.ClientDBWorkflowSubmissions.getAllWorkflowSubmissions().then(() => {
            this.Submissions = [];
            var WorkflowSubmissionList = this.ClientDBWorkflowSubmissions.returnAllWorkflowSubmissionList();
            for (var i = 0; i < WorkflowSubmissionList.length; i++) {
              var item = JSON.parse(WorkflowSubmissionList.item(i).Value);
              item.Reference = 'Not Assigned';
              item.InitiatedByName = this.globalservice.user.DisplayName;
              item.Status = 'SAVED';
              item.DateInitiated = '';
              item.DateCompleted = '';
              this.Submissions.push(item);
            }
          });
        }
      });
    });
  }

  /**
  * Return current pending task from the current workflow tasks
  */
  getPendingTasksJSON(workflowTasks) {
    var pendingtaskslist = [];
    for (let key in workflowTasks) {
      let obj = workflowTasks[key];
      if (obj.Result == "Pending") {
        pendingtaskslist.push(obj)
      }
    }
    return pendingtaskslist;
  }

  /**
  * Toggle group view 
  */
  toggleGroup(group) {
    if (this.isGroupShownmethod(group)) {
      this.shownGroup = null;
    } else {
      this.shownGroup = group;
    }
    this.shownRoute = null;
  };

  /**
  * Toggle routing view
  */
  toggleRoute(route) {
    if (this.isRouteShownmethod(route)) {
      this.shownRoute = null;
    } else {
      this.shownRoute = route;
    }
  };

  /**
  * Check if the group is shown
  */
  isGroupShownmethod(group) {
    return this.shownGroup === group;
  };

  /**
  * Check if routing is shown
  */
  isRouteShownmethod(route) {
    return this.shownRoute === route;
  };

  /**
  * Check if the current workflow is deleted or not
  */
  isDeleted(item) {
    if (item.DeletedOn) {
      return true;
    }
    else {
      return false;
    }
  }

  /**
  * Delete the current saved workflow form
  */
  deleteRestoreSavedForm(item) {
    var title = 'Delete saved form?';
    var message = 'Do you agree to delete this saved form?';
    var currentAction = 'delete';
    if (item.localsaved) {
      var formdata = this.helper.parseJSONifString(item["formData"]);
      this.ClientDBWorkflowSubmissions.deleteWorkFlowsByProcessAndWorkFlow(formdata.ProcessID, formdata.WorkflowID).then(() => {
        this.ClientDbSynchronizationTasks.deleteSynchronizationTaskByProcessIDAndWorkFlowID(formdata.ProcessID, formdata.WorkflowID).then(() => {
          this.Submissions.splice(item, 1);
        });
      });
    }
    else {
      if (item.DeletedOn) {
        currentAction = 'restore';
        title = 'Restore saved form?';
        message = 'Do you agree to restore this saved form?';
      }
      let confirm = this.alertCtrl.create({
        title: title,
        message: message,
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
            }
          },
          {
            text: 'Yes',
            handler: () => {
              var paramsAssesment = {
                processId: item.ProcessID.toString(),
                workflowId: item.WorkflowID.toString(),
                formId: item.FormID,
                action: currentAction,
                diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
                operationType : 'PROCESS'
              };
              this.socket.callWebSocketService('deleteSavedForm', paramsAssesment)
                .then((result) => {
                  if (result != null) {
                    this.getWorkflowsFromServer('reset');
                  }
                }).catch(error => {
                  this.loading.hideLoading();
                  if (error != 'NoConnection') {
                    this.storageServiceProvider.getUser().then((user) => {
                      this.errorReportingProvider.logErrorOnAppServer('Submissions Error',
                        'Error while performing saved form ' + currentAction,
                        user.AuthenticationToken.toString(),
                        '0',
                        'SubmissionsPage(socket.deleteSavedForm)',
                        error.message ? error.message : '',
                        error.stack ? error.stack : '',
                        new Date().toTimeString(),
                        'open',
                        'Platform',
                        '');
                    });
                  }
                });
            }
          }
        ]
      });
      confirm.present();
    }
  }

  /**
  * Return the current user task from workflow tasks
  */
  extractMyTasks() {
    for (var i = 0; i < this.Submissions.length; i++) {
      if (this.Submissions[i].hasOwnProperty('FormTasks') && this.Submissions[i].FormTasks.length !== 0) {
        if (typeof this.Submissions[i].FormTasks === 'string') {
          this.Submissions[i].FormTasks = JSON.parse(this.Submissions[i].FormTasks);
          this.Submissions[i].DefaultButtonsJSON = JSON.parse(this.Submissions[i].DefaultButtonsJSON);
        }

        var task = this.Submissions[i].FormTasks;
        for (var j = 0; j < task.length; j++) {
          var formTask = task[j];
          formTask.TaskName = formTask.TaskName.replace('\\u0027', '\'');
          if (formTask.AssignedToEmail.toLowerCase() === this.globalservice.user.Email.toLowerCase() && formTask.Result === 'Pending') {
            this.Submissions[i].TaskName = formTask.TaskName;
            this.Submissions[i].FormHooks = formTask.FormHooks;
            this.Submissions[i].AssignedToName = formTask.AssignedToName;
            this.Submissions[i].myFormTask = formTask;
          }
        }
      }
    }
  }

  /**
  * Open the user action pop up for the current user to perform action
  */
  openActionPanel(index, Task) {
    var FormHeader = [{
      FormDisplayName: this.selectedWorkflow.WorkflowSettingsJSON[0].Form_Header.FormName
    }]
    var DefaultButtonsJSON = this.selectedWorkflow.WorkflowSettingsJSON[0].DefaultButtons;
    var WorkflowID = this.selectedWorkflow.WorkflowID
    Task["WorkflowID"] = WorkflowID;
    Task["FormHeader"] = FormHeader;
    Task["DefaultButtonsJSON"] = DefaultButtonsJSON;
    Task["FormSettings"] = this.selectedWorkflow.Form_Settings;
    const taskModal = this.modal.create('TaskActionModalPage', { Task: Task, Context: 'submissions' });
    taskModal.onDidDismiss(data => {
      if (typeof data === 'string') {
        if (data === 'completed') {
          this.pageNumber = 1;
          this.showLoading = true;
          this.getWorkflowsFromServer('false');
        }
      }
    });

    var currentPendingTasks = this.getPendingTasksJSON(Task.FormTasks)
    if (currentPendingTasks) {
      if (currentPendingTasks[0].FormActionsRequired) {
        this.openForm(Task);
      }
      else {
        taskModal.present();
      }
    }
    else {
      this.openForm(Task);
    }
  }


  /**
  * Open form for the current task
  */
  openForm(task) {
    this.globalservice.localForm = {};
    this.storageServiceProvider.getUser().then((user) => {
      this.ClientDBProcessResources.getAllProcessResources(this).then(() => {
        this.globalservice.processpermissions = this.ClientDBProcessResources.getProcessSetting(this.globalservice.processId);
        this.globalservice.user = user;
        this.globalservice.reference = task.Reference;
        if (task.localsaved) {
          this.globalservice.localForm = task
          this.app.getRootNav().push(FormPage);
        }
        else {
          this.globalservice.localForm = {};
          this.globalservice.workflowId = task.WorkflowID.toString();
          this.globalservice.actualFormId = task.FormID;
          this.app.getRootNav().push(FormPage);
        }
      });
    });
  }

  /**
  * Check if the current submissions is security trimmed
  */
  showadvisory() {
    this.alertCtrl.create({
      title: 'Data Filter in Effect',
      subTitle: 'Displayed data is security trimmed as per your authorizations.',
      buttons: [
        {
          text: 'Close',
          role: 'Close',
          handler: () => {
          }
        }
      ]
    }).present();
  }
}
