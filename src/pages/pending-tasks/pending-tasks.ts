import { FormControl } from '@angular/forms';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-pending-tasks
Description: Renders pending tasks tab. Retrieve tasks from local database and synchronize on other devices after completion.
Location: ./pages/page-pending-tasks
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { FormPage } from './../form/form';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { ClientDbProcessResourcesProvider } from './../../providers/client-db-process-resources/client-db-process-resources';
import { HelperProvider } from './../../providers/helper/helper';
import { Subscription } from 'rxjs/Subscription';
import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
import { ClientDbNotificationsProvider } from './../../providers/client-db-notifications/client-db-notifications';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { ApplicationTabsPage } from './../tabs-application/ApplicationTabs';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController, ToastController, Content } from 'ionic-angular';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';



@IonicPage()
@Component({
  selector: 'page-pending-tasks',
  templateUrl: 'pending-tasks.html',
})
export class PendingTasksPage {

  subscription: Subscription;
  mysearch;//my current search string
  Tasks;//retrieved tasks
  showOnSortApplied;//flag to show alpha sort
  isGroupShown;//toggle for hiding or showing list item
  isRouteShown;//toggle for is current route shown
  shownGroup;//show list itme
  shownRoute;//show route
  @ViewChild(Content) content: Content;//current content

  taskExtractionError: boolean;//error flag if error occured white extracting tasks

  notificationsUpdate: Subscription;//notification subscription

  searchControl: FormControl;//search input control for searching tasks

  descending: boolean = true;//alpha sort flag
  order: number = 1;//default order
  column: string = 'DateCreatedTask';//current column string

  lookupModal;//modal for process lookup approval task
  proxyModal;//modal for procy approver approval task
  taskModal;//modal for workflow tasks approval task

  /**
  * Default contructor of component.
  */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private app: App,
    private storageServiceProvider: StorageServiceProvider,
    private Helper: HelperProvider,
    public ClientDBNotifications: ClientDbNotificationsProvider,
    public ClientDBProcessResources: ClientDbProcessResourcesProvider,
    public toast: ToastController,
    public modalCtrl: ModalController,
    private _backNav: BacknavigationProvider,
    public Synchronization: SynchronizationProvider,
    public globalservice: ProcessDataProvider,
    private modal: ModalController,
    private helper: HelperProvider,
    private errorReportingProvider: ErrorReportingProvider) {

    this.taskExtractionError = false;
    this.Tasks = [];

    this.searchControl = new FormControl();
    this.showOnSortApplied = 'TaskName';

  }
  /**
   * Move to opened process
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
 * Turn on/off alpha sort
 */
  toggleSortAndPublish(toggleSort) {
    this.descending = !this.descending;
    this.order = this.descending ? 1 : -1;
  }

  /**
  * Hook of ion veiw load
  */
  ionViewDidLoad() {
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      this._backNav.changeNav(search);
    })
  }

  /**
  * Hook of ion veiw enter
  */
  ionViewDidEnter() {

  }

  /**
  * Hook of ion veiw leave
  */
  ionViewDidLeave() {
    this.globalservice.navidata = null;
  }


  /**
  * Hook component initialization
  */
  ngOnInit() {

    this.subscription = this._backNav.navItem$.subscribe(item => {
      this.mysearch = item;
    })

    this.ClientDBNotifications.getAllNotifications().then(() => {
      this.Tasks = this.ClientDBNotifications.getTasksList();
      this.updateTasksView();
    });
  }

  /**
  * Hook of ion veiw enter
  */
  ionViewWillEnter() {
    this.mysearch = '';
    this.globalservice.toggleSearch = false;
    this.globalservice.sort = false;
    this.globalservice.toggleSort = false;

    this.notificationsUpdate = this.ClientDBNotifications.notificationsUpdater$.subscribe(item => {
      this.updateTasksView();
    })
  }

  /**
  * Hook of ion veiw leave
  */
  ionViewWillLeave() {

    this.notificationsUpdate.unsubscribe();
  }

  /**
  * decodes uri of text
  */
  decodeText(encodedText) {
    return decodeURI(encodedText);
  };

  /**
  * Hook for any change in view which resizes current view according to new content
  */
  ngDoCheck() {
    this.content.resize();
  }

  /**
  * updates current task view
  */
  updateTasksView() {
    try {
      if (!this.taskExtractionError) {

        if (this.taskModal) {
          this.taskModal.data.found = false;
        }
        if (this.lookupModal) {
          this.lookupModal.data.found = false;
        }
        if (this.proxyModal) {
          this.proxyModal.data.found = false;
        }

        //task view update logic
        this.Tasks = [];
        var temp = this.ClientDBNotifications.getTasksList();
        for (var i = 0; i < temp.length; i++) {
          //for task assignment notifications
          if (temp[i].TaskType === 'TaskAssignment') {
            temp[i].FormHeader = this.Helper.parseJSONifString(temp[i].FormHeader);
            if (temp[i].ProcessID) {
              if (temp[i].ProcessID.toString() == this.globalservice.processId) {
                this.Tasks.push(temp[i]);

                if (this.globalservice.navidata) {//push notification redirect to the task
                  if (temp[i].NotificationID.toString() === this.globalservice.navidata.additionalData.NotificationId.toString()) {
                    this.globalservice.navidata = null;
                    setTimeout(this.openActionPanel(i, temp[i]), 1000);
                  }
                }

                if (this.taskModal) {
                  if (this.taskModal.data.Task.NotificationID === temp[i].NotificationID) {
                    this.taskModal.data.found = true;
                  }
                }


              }
            }
          }

          //for access request notifications
          if (temp[i].TaskType === 'AccessRequest') {
            if (temp[i].ProcessID.toString() == this.globalservice.processId) {
              temp[i].DateCreatedTask = temp[i].DateCreated;
              this.Tasks.push(temp[i]);

              if (this.globalservice.navidata) {//push notification redirect to the task
                if (temp[i].NotificationID.toString() === this.globalservice.navidata.additionalData.NotificationId.toString()) {
                  this.globalservice.navidata = null;
                  this.openAccessRequestActionModal(i, temp[i]);
                }
              }

              if (this.proxyModal) {
                if (this.proxyModal.data.Task.NotificationID === temp[i].NotificationID) {
                  this.proxyModal.data.found = true;
                }
              }
            }
          }
          //for change approval notificaitons
          if (temp[i].TaskType === 'ProcessLookupChangeApproval') {
            if (temp[i].ProcessID.toString() == this.globalservice.processId) {
              temp[i].DateCreatedTask = temp[i].DateCreated;
              this.Tasks.push(temp[i]);

              if (this.lookupModal) {
                if (this.lookupModal.data.Task.NotificationID === temp[i].NotificationID) {
                  this.lookupModal.data.found = true;
                }
              }

              if (this.globalservice.navidata) {//push notification redirect to the task
                if (temp[i].NotificationID.toString() === this.globalservice.navidata.additionalData.NotificationId.toString()) {
                  this.globalservice.navidata = null;
                  this.openLookupActionModal(i, temp[i]);
                }
              }
            }
          }
        }

        let tempTasks = this.Tasks;
        this.Tasks = [];

        for (let i = 0; i < tempTasks.length; i++) {
          if (temp[i].TaskType === 'TaskAssignment') {
            let taskIndex = this.Tasks.map(function (d) { return d['Reference']; }).indexOf(tempTasks[i].Reference)
            if (taskIndex == -1) {
              this.Tasks.push(tempTasks[i]);
            }
          }
          else {
            this.Tasks.push(tempTasks[i]);
          }

        }

        if (this.taskModal) {
          if (this.taskModal.data.found == false) {
            this.taskModal.dismiss();
          }
        }
        if (this.lookupModal) {
          if (this.lookupModal.data.found == false) {
            this.lookupModal.dismiss();
          }
        }
        if (this.proxyModal) {
          if (this.proxyModal.data.found == false) {
            this.proxyModal.dismiss();
          }
        }

        this.extractMyTasks();
      }
    }
    catch (e) {
      this.taskExtractionError = true;

      this.Tasks = [];
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Error in extracting tasks',
          'Error in extracting tasks on pending tasks',
          user.AuthenticationToken.toString(),
          '0',
          'PendingTasksPage.ngDoCheck',
          e.message ? e.message : '',
          e.stack ? e.stack : '',
          new Date().toTimeString(),
          'Open',
          'Platform',
          '');
      });
    }
  }
  /**
  * toggles list item
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
  * toggles current route
  */
  toggleRoute(route) {
    if (this.isRouteShownmethod(route)) {
      this.shownRoute = null;
    } else {
      this.shownRoute = route;
    }
  };
  /**
  * Returns list item shown status in boolean
  */
  isGroupShownmethod(group) {
    return this.shownGroup === group;
  };
  /**
  * Returns route shown status in boolean
  */
  isRouteShownmethod(route) {
    return this.shownRoute === route;
  };

  /**
  * Extract current user's pending tasks
  */
  extractMyTasks() {

    for (var i = 0; i < this.Tasks.length; i++) {
      //iterate thorugh task assignments for form tasks
      if (this.Tasks[i].TaskType === 'TaskAssignment') {
        if (this.Tasks[i].hasOwnProperty('FormTasks') && this.Tasks[i].FormTasks.length !== 0) {
          if (typeof this.Tasks[i].FormTasks === 'string') {
            this.Tasks[i].FormTasks = JSON.parse(this.Tasks[i].FormTasks);
            this.Tasks[i].DefaultButtonsJSON = JSON.parse(this.Tasks[i].DefaultButtonsJSON);
          }

          var task = this.Tasks[i].FormTasks;
          this.Tasks[i].myFormTask = [{}];
          for (var j = 0; j < task.length; j++) {
            var formTask = task[j];
            formTask.TaskName = formTask.TaskName.replace('\\u0027', '\'');
            if (formTask.AssignedToEmail.toLowerCase() === this.globalservice.user.Email.toLowerCase() && formTask.Result === 'Pending') {

              this.Tasks[i].TaskName = formTask.TaskName;

              this.Tasks[i].FormHooks = formTask.FormHooks;
              this.Tasks[i].AssignedToName = formTask.AssignedToName;

              this.Tasks[i].myFormTask = [formTask];
              this.Tasks[i].DateCreatedTask = this.Tasks[i].myFormTask[0].DateStarted;
            }
          }
        }
      }
    }
  }

  /**
    * Open dialog to take lookup approval actions
    */
  openLookupActionModal(index, Task) {
    this.lookupModal = this.modal.create('LookupActionModalPage', { Task: Task });
    this.lookupModal.onDidDismiss(data => {
      delete this.lookupModal;
    });
    this.lookupModal.present();
  }

  /**
  * Open dialog to take acccess reuqest action
  */

  openAccessRequestActionModal(index, Task) {
    this.proxyModal = this.modal.create('AccessRequestActionModalPage', { Task: Task });
    this.proxyModal.onDidDismiss(data => {
      delete this.proxyModal;
    });
    this.proxyModal.present();
  }

  /**
  * Open dialog to take form task action
  */
  openActionPanel(index, Task) {

    var currentPendingTasks = this.getPendingTasksJSON(Task.FormTasks)
    if (currentPendingTasks) {
      if (currentPendingTasks[0].FormActionsRequired) {
        this.openForm(Task);
      }
      else {
        this.taskModal = this.modal.create('TaskActionModalPage', { Task: Task, Context: 'tasks' });
        this.taskModal.onDidDismiss(data => {
          delete this.taskModal
        });
        this.taskModal.present();
      }
    }
    else {
      this.openForm(Task);
    }
  }

  /**
  * Get pending task json from tasks
  */
  getPendingTasksJSON(FormTasks) {
    FormTasks = this.helper.parseJSONifString(FormTasks);
    var pendingtaskslist = [];
    for (var j = 0; j < FormTasks.length; j++) {
      if (FormTasks[j].Result === 'Pending') {
        pendingtaskslist.push(FormTasks[j]);
      }
    }
    return pendingtaskslist;
  }

  /**
  * Open form from task
  */
  openForm(task) {
    this.globalservice.localForm = {};
    this.storageServiceProvider.getUser().then((user) => {
      this.ClientDBProcessResources.getAllProcessResources(this).then(() => {
        this.globalservice.processpermissions = this.ClientDBProcessResources.getProcessSetting(this.globalservice.processId);
        this.globalservice.user = user;
        this.globalservice.reference = task.Reference;
        if (task.localsaved) {

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


}
