/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-task-action-modal
Description: Renders tasks action popup to take action on pending tasks. Uses Synchronization service to sync devices.
Location: ./pages/page-task-action-modal
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { EncryptionProvider } from './../../providers/encryption/encryption';
import { LoadingProvider } from './../../providers/loading/loading';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { SocketProvider } from './../../providers/socket/socket';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { ClientDbProcessResourcesProvider } from './../../providers/client-db-process-resources/client-db-process-resources';
import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { ClientDbNotificationsProvider } from '../../providers/client-db-notifications/client-db-notifications';
import { HelperProvider } from '../../providers/helper/helper';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';

/**
 * Generated class for the TaskActionModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-task-action-modal',
  templateUrl: 'task-action-modal.html',
})
export class TaskActionModalPage implements OnInit {

  context: String = ''; // Global variable of class to store the context of the pop up
  task: any; // Global variable of class to store the current task details
  permissionString: any; // Global variable of class to store user permissions for the current workflow task
  selectedAssignee; // Global variable of class to store the current selected assignee
  btns: any; // Global variable of class to store available buttons for the task
  canDelegate: Boolean = false; // Global flag to check if the user can delegate the current task
  DelegateBtn: any = {}; // Global variable of class to store the delegate action for the user

  CurrentPendingTasksJSON: any; // Global variable of class to store the current pending task of the workflow
  CurrentUserTaskJSON: any; // Global variable of class to store user task from the current pending task

  delegatees: any; // Global variable of class to store assignees for task delegation

  isDelegateAny: boolean; // Global flag to check if the user has delegate any permissions
  isRestartAny: boolean; // Global flag to check if the user has restart any permissions
  isTerminateAny: boolean; // Global flag to check if the user has terminate any permissions

  shownGroup; // Global flag to show the action buttons group
  shownRoute; // Global flag to show workflow routing on the form

  peoplePickerDisplayText: String = ''; // Global variable of class to store display text for the user
  peoplePickerArray: any[] = []; // Global variable of class to store users nto display
  delegateUser: any = {}; // Global variable of class to store the user whose task needs to be delegated
  comments: String = ""; // Global variable of class to store user comments in the pop up
  user: any; // Global variable of class to store the current user

  hideCommentsBox; // Global flag to show/hide user comments

  /**
  * Class constructor
  */
  constructor(public navCtrl: NavController, private loading: LoadingProvider,
    public navParams: NavParams,
    private ClientDBProcessResources: ClientDbProcessResourcesProvider,
    private storageServiceProvider: StorageServiceProvider,
    private ngZone: NgZone,////tslint warning - Used in internal function..lint warning
    private encryptionProvider: EncryptionProvider,
    private modal: ModalController,
    public viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private ClientDBNotifications: ClientDbNotificationsProvider,
    private Socket: SocketProvider,
    private globalservice: ProcessDataProvider,
    private Helper: HelperProvider,
    private errorReportingProvider: ErrorReportingProvider) {
    this.isDelegateAny = false;
    this.isRestartAny = false;
    this.isTerminateAny = false;
    this.hideCommentsBox = false;

    this.context = navParams.get('Context');
    this.task = navParams.get('Task');
    if (!this.task.myFormTask) {
      this.task.myFormTask.IsDelegated = false;
    }
    this.selectedAssignee = {};
  }

  /**
  * Initializer function for the component
  */
  ngOnInit() {
    this.checkButtonPermissions();
  }


  /**
  * Check button permissions for the current user
  * and determine which actions the user can perform
  */
  checkButtonPermissions() {
    try {
      this.ClientDBProcessResources.getAllProcessResources(this).then((scope: any) => {
        var newVal = scope.ClientDBProcessResources.getProcessSetting(scope.task.ProcessID);
        var buttonsPermissions = '';
        var CustomPagePermissions = [];
        if (newVal) {
          if (newVal.processUserSettings.Process_User_Permissions) {
            CustomPagePermissions = newVal.processUserSettings.Process_User_Permissions;
          }
          else if (newVal.processUserSettings.User_Permissions) {
            CustomPagePermissions = newVal.processUserSettings.User_Permissions;
          }
          for (var j = 0; j < CustomPagePermissions.length; j++) {
            if (CustomPagePermissions[j].PermissionName === 'Terminate' &&
              CustomPagePermissions[j].ItemType === 'ProcessWorkflow' &&
              CustomPagePermissions[j].ID.toString() === scope.task.WorkflowID.toString()) {
              buttonsPermissions += 'TERMINATE,';
            }
            if (CustomPagePermissions[j].PermissionName === 'Restart' &&
              CustomPagePermissions[j].ItemType === 'ProcessWorkflow' &&
              CustomPagePermissions[j].ID.toString() === scope.task.WorkflowID.toString()) {
              buttonsPermissions += 'RESTART,';
            }

            if (CustomPagePermissions[j].PermissionName === 'Reject' &&
              CustomPagePermissions[j].ItemType === 'ProcessWorkflow' &&
              CustomPagePermissions[j].ID.toString() === scope.task.WorkflowID.toString()) {
              buttonsPermissions += 'REJECT,';
            }
            if (CustomPagePermissions[j].PermissionName === 'Delegate' &&
              CustomPagePermissions[j].ItemType === 'ProcessWorkflow' &&
              CustomPagePermissions[j].ID.toString() === scope.task.WorkflowID.toString()) {
              buttonsPermissions += 'DELEGATE,';
            }

            if (CustomPagePermissions[j].PermissionName === 'Delete' &&
              CustomPagePermissions[j].ItemType === 'ProcessWorkflow' &&
              CustomPagePermissions[j].ID.toString() === scope.task.WorkflowID.toString()) {
              buttonsPermissions += 'DELETE,';
            }
            if (CustomPagePermissions[j].PermissionName === 'Terminate Any' &&
              CustomPagePermissions[j].ItemType === 'ProcessWorkflow' &&
              CustomPagePermissions[j].ID.toString() === scope.task.WorkflowID.toString()) {
              buttonsPermissions += 'TERMINATE,';
              this.isTerminateAny = true;
            }
            if (CustomPagePermissions[j].PermissionName === 'Restart Any' &&
              CustomPagePermissions[j].ItemType === 'ProcessWorkflow' &&
              CustomPagePermissions[j].ID.toString() === scope.task.WorkflowID.toString()) {
              buttonsPermissions += 'RESTART,';
              this.isRestartAny = true;
            }
            if (CustomPagePermissions[j].PermissionName === 'Delegate Any' &&
              CustomPagePermissions[j].ItemType === 'ProcessWorkflow' &&
              CustomPagePermissions[j].ID.toString() === scope.task.WorkflowID.toString()) {
              buttonsPermissions += 'DELEGATE,';
              this.isDelegateAny = true;
            }
            if (CustomPagePermissions[j].PermissionName === 'Approve' &&
              CustomPagePermissions[j].ItemType === 'ProcessWorkflow' &&
              CustomPagePermissions[j].ID.toString() === scope.task.WorkflowID.toString()) {
              buttonsPermissions += 'PROCEED_WITH_YES,PROCEED_WITH_NO,CLAIM,';
            }
          }
          scope.permissionString = buttonsPermissions;
          if (this.context === 'tasks') {
            scope.drawTaskButtons(scope)
          }
          else if (this.context === 'submissions') {
            scope.drawSubmissionsButtons(scope)
          }
        }
      });
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Task Action Error',
          'Error while checking button permissions',
          user.AuthenticationToken.toString(),
          '0',
          'TaskActionModalPage(checkButtonPermissions)',
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
  * Generate and return the available actions for the user to take action from the pop over
  */
  drawTaskButtons(scope) {
    try {
      scope.storageServiceProvider.getUser().then((user) => {
        this.user = user;
        var CurrentPendingTasksJSON = scope.getPendingTasksJSON(scope.task.FormTasks);
        var CurrentUserTaskJSON = scope.getCurrentUserTaskJSON(CurrentPendingTasksJSON, user);

        scope.ngZone.run(() => {
          scope.CurrentPendingTasksJSON = CurrentPendingTasksJSON;
          scope.selectedAssignee = scope.CurrentPendingTasksJSON[0];
          scope.CurrentUserTaskJSON = CurrentUserTaskJSON[0];
        });

        scope.btns = {};
        var WorkflowTasksJSON = scope.task.FormTasks;
        var InitiatorEmail = scope.task.InitiatedByEmail;
        var buttonsJSON;
        var buttonList = [];

        if (CurrentUserTaskJSON.ActionButtons) {
          buttonsJSON = CurrentUserTaskJSON.ActionButtons;
        }
        else {
          buttonsJSON = scope.task.DefaultButtonsJSON;
        }

        var cases = '';
        if ((CurrentPendingTasksJSON.length > 1 && CurrentPendingTasksJSON[0].MultipleAssigneeRestriction === 'Anyone') && (user.Email.toLowerCase() === CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
          cases = 'claim';
        }
        else {
          if ((user.Email.toLowerCase() === CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (CurrentPendingTasksJSON[0].TaskName === WorkflowTasksJSON[0].TaskName)) {
            cases = 'initiatorReview';
          }
          else {
            if ((user.Email.toLowerCase() === CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (user.Email.toLowerCase() !== InitiatorEmail.toLowerCase())) {
              cases = 'approver';
            }
            else if ((user.Email.toLowerCase() === CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (user.Email.toLowerCase() === InitiatorEmail.toLowerCase())) {
              cases = 'approverAndInitiator';
            }
          }
        }
        switch (cases) {
          case 'claim':
            buttonList.push('CLAIM');
            break;
          case 'initiatorReview':
            if (buttonList.indexOf('TERMINATE') === -1) {
              buttonList.push('TERMINATE');
            }
            break;
          case 'approver':
            if (buttonList.indexOf('PROCEED_WITH_YES') === -1) {
              buttonList.push('PROCEED_WITH_YES');
            }
            if (buttonList.indexOf('PROCEED_WITH_NO') === -1) {
              buttonList.push('PROCEED_WITH_NO');
            }
            if (buttonList.indexOf('DELEGATE') === -1) {
              buttonList.push('DELEGATE');
            }
            if (buttonList.indexOf('RESTART') === -1) {
              buttonList.push('RESTART');
            }
            if (buttonList.indexOf('REJECT') === -1) {
              buttonList.push('REJECT');
            }
            break;
          case 'approverAndInitiator':
            if (buttonList.indexOf('PROCEED_WITH_YES') === -1) {
              buttonList.push('PROCEED_WITH_YES');
            }
            if (buttonList.indexOf('PROCEED_WITH_NO') === -1) {
              buttonList.push('PROCEED_WITH_NO');
            }
            if (buttonList.indexOf('DELEGATE') === -1) {
              buttonList.push('DELEGATE');
            }
            if (buttonList.indexOf('RESTART') === -1) {
              buttonList.push('RESTART');
            }
            if (buttonList.indexOf('TERMINATE') === -1) {
              buttonList.push('TERMINATE');
            }
            if (buttonList.indexOf('REJECT') === -1) {
              buttonList.push('REJECT');
            }
            break;
        }
        // permission trimming..
        var templength = buttonList.length;
        for (var k = 0; k < templength; k++) {
          if (scope.permissionString.indexOf(buttonList[k]) === -1) {
            buttonList[k] = "";

          }
          else if (!scope.task.DefaultButtonsJSON.hasOwnProperty(buttonList[k])) {
             buttonList[k] = "";

          }
        }
        if (CurrentPendingTasksJSON[0].TaskName === WorkflowTasksJSON[0].TaskName) {
          var i = buttonList.indexOf('RESTART');
          if (i != -1) {
           
             buttonList[i] = "";
          }
        }
        if (this.isTerminateAny) {
          if (buttonList.indexOf('TERMINATE') === -1) {
            buttonList.push('TERMINATE');
          }
        }

        //comments flag check
        if (buttonList.length <= 0 || !this.task.myFormTask[0].CommentsFlag) {
          this.hideCommentsBox = true;
        }
        // buttons population
        for (var j = 0; j < buttonList.length; j++) {
          if(buttonList[j] != "")
          {
            if (buttonList[j] === 'CLAIM') {
              if (scope.task.DefaultButtonsJSON.hasOwnProperty('CLAIM')) {
                scope.btns['CLAIM'] = scope.task.DefaultButtonsJSON.CLAIM;
              }
            }
            else if (buttonList[j] === 'DELEGATE') {
              if (buttonsJSON.hasOwnProperty('DELEGATE')) {
                scope.DelegateBtn = buttonsJSON.DELEGATE;
                scope.canDelegate = true;
              }
            }
            else {
              scope.btns[buttonList[j]] = buttonsJSON[buttonList[j]];
            }
          }
        }
        // check special cases
        if (scope.CurrentUserTaskJSON.IsDelegated) {
          scope.canDelegate = false;
        }
        if (this.isDelegateAny) {
          scope.delegatees = scope.CurrentPendingTasksJSON;
        }
        else {
          scope.delegatees = [scope.CurrentUserTaskJSON];
        }


      });
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Task Action Error',
          'Error while drawing tasks buttons',
          user.AuthenticationToken.toString(),
          '0',
          'TaskActionModalPage(drawTaskButtons)',
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
  * Generate and return action buttons for submissions view
  */
  drawSubmissionsButtons(scope) {
    try {
      scope.storageServiceProvider.getUser().then((user) => {
        this.user = user;
        scope.btns = {};
        var WorkflowTasksJSON = scope.task.FormTasks;
        var CurrentPendingTasksJSON = scope.getPendingTasksJSON(scope.task.FormTasks);
        var CurrentUserTaskJSON = scope.getCurrentUserTaskJSON(CurrentPendingTasksJSON, user);

        scope.ngZone.run(() => {
          scope.CurrentPendingTasksJSON = CurrentPendingTasksJSON;
          scope.CurrentUserTaskJSON = CurrentUserTaskJSON[0];
          scope.selectedAssignee = scope.CurrentPendingTasksJSON[0];
        });

        var buttonsJSON;

        if (CurrentUserTaskJSON.ActionButtons) {
          buttonsJSON = CurrentUserTaskJSON.ActionButtons;
        }
        else {
          buttonsJSON = scope.task.DefaultButtonsJSON;
        }

        var buttonslist = [];
        if ((CurrentPendingTasksJSON.length > 1 && CurrentPendingTasksJSON[0].MultipleAssigneeRestriction.toLowerCase() == "anyone") && (user.Email.toLowerCase() == CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
          // claim button always come from default
          buttonsJSON = scope.task.DefaultButtonsJSON;
          buttonslist = ["CLAIM"];
        }
        else {
          //Initiator Review check if the current task is initiator review and current logged in user is assignee
          if ((user.Email.toLowerCase() == CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (CurrentUserTaskJSON[0].TaskName.toLowerCase() == WorkflowTasksJSON[0].TaskName.toLowerCase())) { 
            if (CurrentUserTaskJSON[0].TaskName == "") {
              if (WorkflowTasksJSON[0].ActionButtons) {
                buttonsJSON = JSON.parse(WorkflowTasksJSON[0].ActionButtons);
              }
              else {
                buttonsJSON = scope.task.DefaultButtonsJSON;
              }
            }
            buttonslist = ["RESUBMIT", "TERMINATE"]
          }
          else {
            //Initiator
            if ((user.Email.toLowerCase() == scope.task.InitiatedByEmail.toLowerCase()) && (user.Email.toLowerCase() != CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
              buttonslist = ["RESTART", "TERMINATE"]
            }
            //Approver
            else if ((user.Email.toLowerCase() == CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (user.Email.toLowerCase() != scope.task.InitiatedByEmail.toLowerCase())) {
              buttonslist = ["PROCEED_WITH_YES", "PROCEED_WITH_NO", "REJECT", "DELEGATE", "RESTART"]
            }

            //Assignedto and Initiator
            else if ((user.Email.toLowerCase() == scope.task.InitiatedByEmail.toLowerCase()) && (user.Email.toLowerCase() == CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
              buttonslist = ["TERMINATE", "RESTART", "REJECT", "DELEGATE", "PROCEED_WITH_NO", "PROCEED_WITH_YES"]
            }
            //Other all users
            else {
              buttonslist = [];
            }
          }
        }

        if (this.isTerminateAny && buttonslist.indexOf("TERMINATE") == -1) {
          buttonslist.push("TERMINATE");
        }
        if (this.isRestartAny && buttonslist.indexOf("RESTART") == -1) {
          if (CurrentUserTaskJSON[0].TaskName.toLowerCase() != WorkflowTasksJSON[0].TaskName.toLowerCase()) {
            if (CurrentPendingTasksJSON[0].TaskName.toLowerCase() != WorkflowTasksJSON[0].TaskName.toLowerCase()) {
              buttonslist.push("RESTART");
            }
          }
        }
        if (this.isDelegateAny && buttonslist.indexOf("DELEGATE") == -1) {
          if (CurrentUserTaskJSON[0].TaskName.toLowerCase() != WorkflowTasksJSON[0].TaskName.toLowerCase()) {
            this.isDelegateAny = true;
            buttonslist.push("DELEGATE");
          }
        }

        // remove if already restarted
        if (CurrentPendingTasksJSON[0].TaskName.toLowerCase() === WorkflowTasksJSON[0].TaskName.toLowerCase()) {
          buttonslist = buttonslist.filter((item) => {
            return item != "RESTART"
          })
        }

        //comments flag check
        if (buttonslist.length <= 0 || !this.task.myFormTask[0].CommentsFlag) {
          this.hideCommentsBox = true;
        }

        // remove if already delegated
        // buttons population
        for (var j = 0; j < buttonslist.length; j++) {
          if (buttonslist[j] === 'DELEGATE') {
            if (buttonsJSON.hasOwnProperty('DELEGATE')) {
              scope.DelegateBtn = buttonsJSON.DELEGATE;
              scope.canDelegate = true;
            }
            else {
              scope.DelegateBtn = {};
            }
          }
          else if (buttonslist[j] === 'RESTART') {
            if (buttonsJSON.hasOwnProperty('RESTART')) {
              scope.btns[buttonslist[j]] = buttonsJSON[buttonslist[j]];
            }
          }
          else if (buttonslist[j] === 'TERMINATE') {
            if (buttonsJSON.hasOwnProperty('TERMINATE')) {
              scope.btns[buttonslist[j]] = buttonsJSON[buttonslist[j]];
            }
          }
        }

        scope.delegatees = [scope.CurrentUserTaskJSON];
        if (!this.isDelegateAny) {
          for (var i = 0; i < scope.CurrentPendingTasksJSON.length; i++) {
            if (scope.delegatees[0].AssignedToEmail !== scope.CurrentPendingTasksJSON[i].AssignedToEmail) {
              if (!scope.CurrentPendingTasksJSON[i].IsDelegated) {
                scope.delegatees.push(scope.CurrentPendingTasksJSON[i]);
              }
            }
          }
        }
        else{
          scope.delegatees = scope.CurrentPendingTasksJSON;
        }
      });
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Task Action Error',
          'Error while drawing submissions buttons',
          user.AuthenticationToken.toString(),
          '0',
          'TaskActionModalPage(drawSubmissionsButtons)',
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
  * REturn current user task from the current pending task
  */
  getCurrentUserTaskJSON(currentPendingTasks, user) {
    try {
      var pendingtaskslist = [];
      for (let key in currentPendingTasks) {
        let obj = currentPendingTasks[key];
        if (obj.Result == "Pending" && obj.AssignedToEmail.toLowerCase() == user.Email.toLowerCase()) {
          pendingtaskslist.push(obj)
        }
      }
      if (pendingtaskslist.length == 0) {
        let obj = {
          TaskName: "",
          AssignedToEmail: "",
          Iteration: -1,
          EditableFields: null,
          MultipleAssigneeRestriction: ""
        }
        pendingtaskslist.push(obj);
      }
      return pendingtaskslist;
    }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Task Action Error',
          'Error while geting current user tasks JSON',
          user.AuthenticationToken.toString(),
          '0',
          'TaskActionModalPage(drawSubmissionsButtons)',
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
  * Return current pending task from the workflow task
  */
  getPendingTasksJSON(FormTasks) {
    var pendingtaskslist = [];
    for (var j = 0; j < FormTasks.length; j++) {
      if (FormTasks[j].Result === 'Pending') {
        pendingtaskslist.push(FormTasks[j]);
      }
    }
    return pendingtaskslist;
  }

  /**
  * Toggle workflow routing group
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
  * Check if the group is shown
  */
  isGroupShownmethod(group) {
    return this.shownGroup === group;
  };

  /**
  * Shows the peopel picker to select the user
  */
  openPeoplePicker() {
    var peoplePicker = this.modal.create('PeoplePickerPage', { "peoplePickerArray": this.peoplePickerArray, "maxSelectedItems": 1, "selfSelection": false });
    peoplePicker.onDidDismiss(data => {
      if (Array.isArray(data)) {
        this.peoplePickerArray = data;
        this.delegateUser = data[0];
        this.peoplePickerDisplayText = '';
        for (var i = 0; i < data.length; i++) {
          if (data[i].DisplayName) {
            this.peoplePickerDisplayText += data[i].DisplayName;
          }
          else {
            this.peoplePickerDisplayText += data[i].Email;
          }
          if (data.length > 1 && i < data.length - 1) {
            this.peoplePickerDisplayText += ('; ');
          }
        }
      }
    });
    peoplePicker.present();
  }


  /**
  * Complete the action taken by the current assignee
  */
  performAction(buttonId, button) {
    var self=this;
    if(button.confirmation.toLowerCase() == "none")
    {
      self.performActionNow(buttonId, button) 
    }
    else if(button.confirmation.toLowerCase() == "warn")
    {
      let alert = self.alertCtrl.create({
        title: this.task.WorkFlowDisplyName,
        message: (button.warningtext)?(button.warningtext):'Are you sure you want to ' + button.label,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Ok',
            handler: () => {
              self.performActionNow(buttonId, button) 
            }
          }
        ]
      });
      alert.present();
    }
    else if(button.confirmation.toLowerCase() == "authenticate")
    {
      self.alertCtrl.create({
      subTitle: self.globalservice.user.LoginID,
      title: "Re-Authentication Required",
      inputs: [
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        }
      ],
      buttons: [
        
        {
          text: 'Authenticate',
          handler: data => {
            if(data.password.length > 0)
            { 
                  this.loading.presentLoading('Authenticating...', 3000)
                  var authenticateObj = {
                    loginId: self.encryptionProvider.encryptData(self.globalservice.user.LoginID.toLowerCase()),
                    password: self.encryptionProvider.encryptData(data.password.toString()),
                    diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
                    operationType : 'APPLICATION'
                  }
                  self.Socket.callWebSocketService('validateCredentials', authenticateObj).then((result) => {

                    if (result === 'false') {
                      let alert = self.alertCtrl.create({
                        title: this.task.WorkFlowDisplyName,
                        message: "Invalid password",
                        buttons: [
                          {
                            text: 'Ok',
                            handler: () => {
                            }
                          }
                        ]
                      });
                      alert.present();
                      return false;
                    }
                    else if (result === 'true') {
                      self.performActionNow(buttonId, button)
                      return true;
                    }
                  });
                }
                else {
                  let alert = self.alertCtrl.create({
                    title: this.task.WorkFlowDisplyName,
                    message: "Please enter password",
                    buttons: [
                      {
                        text: 'Ok',
                        handler: () => {
                        }
                      }
                    ]
                  });
                  alert.present();
                  return false;
                }
              }
            },
            {
              text: 'Cancel',
              role: 'cancel',
              handler: data => {
              }
            }
          ]
        }).present();
      
    }
  };
  
  /**
  * Perform the user action for the current task
  */
  performActionNow(buttonId, button) {
    try {
      if (buttonId === 'CLOSE') {
        this.viewCtrl.dismiss();
        return;
      }
      if (buttonId === 'DELEGATE') {
        if (this.peoplePickerArray[0].Email) {
          this.peoplePickerArray[0];
          if (this.selectedAssignee.AssignedToEmail.toLowerCase() == this.peoplePickerArray[0].Email.toLowerCase()) {
            this.alertCtrl.create({
              title: this.task.WorkFlowDisplyName,
              subTitle: 'The task has been already assigned to the selected user',
              buttons: ['OK']
            }).present();
            return;
          }
        }
        else {
          this.alertCtrl.create({
            title: this.task.WorkFlowDisplyName,
            subTitle: 'Please select a delegate',
            buttons: ['OK']
          }).present();
          return;
        }
      }

        if (this.context === 'tasks') {
          if (this.task.myFormTask[0].FormActionsRequired) {
          }
        }

        if (typeof this.delegateUser.Email === 'undefined' && typeof this.delegateUser.DisplayName === 'undefined') {
          this.delegateUser.Email = '';
          this.delegateUser.DisplayName = '';
        }
        var outcome;
        if(buttonId == 'CLAIM')
        {
          outcome = this.task.DefaultButtonsJSON[buttonId].outcome;
        }
        else
        {
          if (this.CurrentPendingTasksJSON[0].ActionButtons !== null) {
            outcome = this.CurrentPendingTasksJSON[0].ActionButtons[buttonId].outcome;
          }
          else {
            outcome = this.task.DefaultButtonsJSON[buttonId].outcome;
          }
        }
        var paramsTaskAction = {
          processId: this.globalservice.processId.toString(),
          workflowId: this.task.WorkflowID.toString(),
          formId: this.task.FormID,
          currentLoggedInUserEmail: this.user.Email,
          currentLoggedInUserName: this.user.DisplayName,
          buttonId: buttonId,
          outcome: outcome,
          comments: this.comments,
          workflowTasks: JSON.stringify(this.task.FormTasks),
          delegatedFromEmail: this.selectedAssignee.AssignedToEmail,
          delegatedToEmail: this.delegateUser.Email,
          delegatedToName: this.delegateUser.DisplayName,
          getCurrentDate: this.formatDate(new Date()),
          diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
          operationType : 'WORKFLOW'
        };
        this.loading.presentLoading("Processing Task...", 20000);
        this.Socket.callWebSocketService('userTaskAction', paramsTaskAction).then((re) => {
          this.loading.hideLoading();
          this.deleteNotification(this.task);
          this.viewCtrl.dismiss('completed');
        }).catch(error => {
          this.loading.hideLoading();
          if (error != 'NoConnection') {
            this.storageServiceProvider.getUser().then((user) => {
              this.errorReportingProvider.logErrorOnAppServer('Form Action Error',
                'An error occured while performing action',
                user.AuthenticationToken.toString(),
                this.task.ProcessID.toString(),
                'TaskActionModalPage(socket.userTaskAction)',
                error.message ? error.message : '',
                error.stack ? error.stack : '',
                new Date().toTimeString(),
                'open',
                'Platform',
                '');
            }).then(() => {
              this.viewCtrl.dismiss();
            }).catch(() => {
              this.viewCtrl.dismiss();
            })
          }
        });
      }
    catch (error) {
      this.storageServiceProvider.getUser().then((user) => {
        this.errorReportingProvider.logErrorOnAppServer('Task Action Error',
          'Error while performing action',
          user.AuthenticationToken.toString(),
          '0',
          'TaskActionModalPage(performAction)',
          error.message ? error.message : '',
          error.stack ? error.stack : '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');
      });
    }
  };

  /**
   * Date Formatter
   * @param inputDate
   */
  formatDate(inputDate) {
    if (inputDate) {
      var utcDate = new Date(Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), inputDate.getHours(), inputDate.getMinutes()))
      return utcDate;
    }
    else {
      utcDate = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes()))
      return utcDate;
    }
  }

  /**
  * Delete the provided notification
  */
  deleteNotification(notification) {
    //remove the notification in the localDB
    this.ClientDBNotifications.removeNotification(notification.NotificationID, 'Task').then(() => {
    });
  };

  /**
  * Check if the current object is empty or not
  */
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
}

