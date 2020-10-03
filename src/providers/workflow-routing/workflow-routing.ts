import { ErrorReportingProvider } from './../error-reporting/error-reporting';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: WorkflowRoutingProvider
Description: Contains method to run a rounting engine on client side.
Location: ./providers/WorkflowRoutingProvider
Author: Hassan
Version: 1.0.0
Modification history: none
*/


/**
* Importing neccassary libraries and modules for this class 
*/
import { ProcessDataProvider } from './../process-data/process-data';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the WorkflowRoutingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class WorkflowRoutingProvider {

  private WorkflowTasksJSON: any[];//workflow tasks for the form
  private ProcessTasksJSON: any[];//process tasks for the user
  public CurrentLoggedInUser: any;//user currently logged in

  /**
  * Class constructor
  * */
  constructor(public http: Http,
    public globalservice: ProcessDataProvider,private errorReportingProvider: ErrorReportingProvider,
  ) {
    this.CurrentLoggedInUser = this.globalservice.user;
  }

  /**
  * Update the workflowtasks routing
  * */
  getProcessTasksFromServer(CurrentStatusValue): any {
    if (CurrentStatusValue == "INITIATING") {
      return this.generateWorkflowTasksJSON(this.ProcessTasksJSON);
    } else {
      this.WorkflowTasksJSON = this.generateWorkflowRoutingTblForInitiatorReview();
      this.WorkflowTasksJSON = this.updateIterationforInitiatorReview();
      return this.WorkflowTasksJSON;
    }
  }

  /**
  * Update the workflowtasks with initiator review task
  * */
  updateIterationforInitiatorReview() {
    let LastInitiatorReviewIndex: number = 0;
    var tmpIterationNumber = 0;
    for (var k in this.WorkflowTasksJSON) {

      if (this.WorkflowTasksJSON[k].ButtonPressed == "RESUBMIT") {

        tmpIterationNumber = parseInt(this.WorkflowTasksJSON[k].Iteration);
        LastInitiatorReviewIndex = parseInt(k);
      }
    }
    for (var j = LastInitiatorReviewIndex + 1; j < this.WorkflowTasksJSON.length; j++) {

      if (this.WorkflowTasksJSON[j]["Iteration"] != tmpIterationNumber) {
        this.WorkflowTasksJSON[j]["Iteration"] = tmpIterationNumber;
      }
    }
    return this.WorkflowTasksJSON;
  }

  /**
  * Generate workflowtasks for initiator review task
  * */
  generateWorkflowRoutingTblForInitiatorReview() {
    try{
      var taskRowNumber = 0;
      var iterationNumber = 0;
      var tempTaskRowNumber =  0;
      // retrieve the latest resubmitted request and its iteration number
      for (var k in this.WorkflowTasksJSON) {
        if (this.WorkflowTasksJSON[k].ButtonPressed == "RESUBMIT") {
          taskRowNumber = parseInt(k);
          tempTaskRowNumber = parseInt(k);
          iterationNumber = parseInt(this.WorkflowTasksJSON[k].Iteration);
        }
      }
 
      let tempWorkflowTasksJSON = JSON.parse(JSON.stringify(this.WorkflowTasksJSON));
      // retrieve the dynamically added tasks in workflow tasks JSON
      for(let ind:number = 0; ind < this.ProcessTasksJSON.length; ind++)
      {
        for(let subInd:number = 0; subInd < tempWorkflowTasksJSON.length; subInd++){
          if( (this.ProcessTasksJSON[ind]["TaskName"].toLowerCase() == tempWorkflowTasksJSON[subInd]["TaskName"].toLowerCase()
          && iterationNumber > tempWorkflowTasksJSON[subInd]["Iteration"] )
          || tempWorkflowTasksJSON[subInd]["TaskName"].toLowerCase() == this.ProcessTasksJSON[0]["TaskName"].toLowerCase())
          {
            tempWorkflowTasksJSON.splice(subInd,1);
            subInd--;
          }
        }
      }
 
      if(this.ProcessTasksJSON[0] != undefined){
        if(this.ProcessTasksJSON[0]["TaskName"] != undefined){
          for(let index:number = 1; index < this.ProcessTasksJSON.length; index++)
          {
            for(let subIndex:number = 1; subIndex < this.WorkflowTasksJSON.length; subIndex++){
              if(this.ProcessTasksJSON[index]["TaskName"].toLowerCase() == this.WorkflowTasksJSON[subIndex]["TaskName"].toLowerCase()
              && (iterationNumber - 1) == this.WorkflowTasksJSON[subIndex]["Iteration"]
              && this.WorkflowTasksJSON[subIndex]["IsDelegated"] == false){
                if(this.WorkflowTasksJSON[subIndex]["ButtonPressed"] != ""){
                  var taskRow = JSON.parse(JSON.stringify(this.WorkflowTasksJSON[subIndex]));
                  taskRow["Iteration"] = iterationNumber;
                  taskRow["DateInitiated"] = '';
                  taskRow["DateCompleted"] = '';
                  taskRow["Result"] = '';
                  taskRow["Comments"] = '';
                  taskRow["ButtonPressed"] = '';
                  taskRowNumber++
                  this.WorkflowTasksJSON.splice(taskRowNumber,0,taskRow);
                }
                else{
                  var taskRow = JSON.parse(JSON.stringify(this.WorkflowTasksJSON[subIndex]));
                  taskRow["Iteration"] = iterationNumber;
                  taskRow["DateInitiated"] = '';
                  taskRow["DateCompleted"] = '';
                  taskRow["Result"] = '';
                  taskRow["Comments"] = '';
                  taskRow["ButtonPressed"] = '';
                  taskRowNumber++
                  this.WorkflowTasksJSON.splice(taskRowNumber,1,taskRow);
                }
              }
            }
          }
        }
      }
     
      //the dynamic tasks added are stored in the tempWorkflowTasksJSON and will be added in the end
      var initiationTaskRowNumber = tempTaskRowNumber;
      if(tempWorkflowTasksJSON[0] != undefined){
        if(tempWorkflowTasksJSON[0]["TaskName"] != undefined){
          for(let index:number = 0; index < tempWorkflowTasksJSON.length; index++)
          {
            var isNewTask = true;
            var tempSequenceNumber = 0;
            for(let subIndex:number = tempTaskRowNumber; subIndex < this.WorkflowTasksJSON.length; subIndex++){
              if(tempWorkflowTasksJSON[index]["TaskName"].toLowerCase() == this.WorkflowTasksJSON[subIndex]["TaskName"].toLowerCase()
              && iterationNumber >= tempWorkflowTasksJSON[index]["Iteration"] ){
               isNewTask = false;
                tempSequenceNumber = this.WorkflowTasksJSON[subIndex]["Sequence"];
              }
            }
            if(isNewTask){
              if(iterationNumber -1 == tempWorkflowTasksJSON[index]["Iteration"]){
                tempSequenceNumber = tempWorkflowTasksJSON[index]["Sequence"];
                var taskRow = JSON.parse(JSON.stringify(tempWorkflowTasksJSON[index]));
                taskRow["Iteration"] = iterationNumber;
                taskRow["DateInitiated"] = '';
                taskRow["DateCompleted"] = '';
                taskRow["Result"] = '';
                taskRow["Comments"] = '';
                taskRow["ButtonPressed"] = '';
                var taskIndex = initiationTaskRowNumber-1;
                taskIndex = taskIndex + tempSequenceNumber;
                this.WorkflowTasksJSON.splice(taskIndex,0,taskRow);
                tempTaskRowNumber++;
              }
            }
            else{
              if(iterationNumber -1 == tempWorkflowTasksJSON[index]["Iteration"]){
                tempSequenceNumber = tempWorkflowTasksJSON[index]["Sequence"];
                var taskRow = JSON.parse(JSON.stringify(tempWorkflowTasksJSON[index]));
                taskRow["Iteration"] = iterationNumber;
                taskRow["DateInitiated"] = '';
                taskRow["DateCompleted"] = '';
                taskRow["Result"] = '';
                taskRow["Comments"] = '';
                taskRow["ButtonPressed"] = '';
                var taskIndex = initiationTaskRowNumber-1;
                taskIndex = taskIndex + tempSequenceNumber;
                this.WorkflowTasksJSON.splice(taskIndex,1,taskRow);
                tempTaskRowNumber++;
              }
            }
          }
        }
      }
      return this.WorkflowTasksJSON;
    }
    catch(error)
    {
      var user = this.CurrentLoggedInUser;
      this.errorReportingProvider.logErrorOnAppServer('generateWorkflowRoutingTblForInitiatorReview Error',
        'An error occured while generating action buttons ',
        user["AuthenticationToken"],
        this.globalservice.processId.toString(),
        'generateWorkflowRoutingTblForInitiatorReview form',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
    }
  }


  /**
  * Generate workflowtasks json using the process tasks
  * */
  generateWorkflowTasksJSON(ProcessTasks): any[] {

    if (ProcessTasks != "undefined" && ProcessTasks != null) {
      if (ProcessTasks.length > 0) {
        if (typeof ProcessTasks[0].TaskName != "undefined") {
          this.WorkflowTasksJSON = [];
          let TaskRow;

          this.ProcessTasksJSON.forEach(item => {
            let $this = item;
            let ModifiedTitle = $this["TaskName"].split(' ').join('_');
            while (ModifiedTitle.indexOf("'") !== -1) {
              ModifiedTitle = ModifiedTitle.replace("'", "");
            }
            let AssigneesName = "";
            let AssignedToEmail = "";
            //if multiple assignees
            if (typeof $this["DefaultAssignees"].results != "undefined") {
              var DefaultAssigneesLength = $this["DefaultAssignees"].results.length;
              for (var a = 0; a < DefaultAssigneesLength; a++) {
                AssigneesName = $this["DefaultAssignees"].results[a].Name;
                AssignedToEmail = $this["DefaultAssignees"].results[a].Email;
                TaskRow = {};
                TaskRow["Sequence"] = $this["Sequence"];
                TaskRow["Iteration"] = 1;
                TaskRow["TaskName"] = $this["TaskName"];
                TaskRow["MultipleAssigneeRestriction"] = $this["MultipleAssigneeRestriction"];
                TaskRow["AssignedToName"] = AssigneesName;
                TaskRow["AssignedToEmail"] = AssignedToEmail;
                TaskRow["ExpectedCompletionDays"] = $this["ExpectedCompletionDays"];
                TaskRow["ReminderSchedule"] = $this["ReminderSchedule"];
                TaskRow["Escalation"] = $this["Escalation"];
                TaskRow["NotificationTemplate"] = $this["NotificationTemplate"];
                TaskRow["CommentsFlag"] = $this["CommentsFlag"];
                TaskRow["FormActionsRequired"] = $this["FormActionsRequired"];
                TaskRow["NumberofReminders"] = $this["NumberofReminders"];
                TaskRow["EditableFields"] = $this["EditableFields"];
                TaskRow["SkipAssigneeAutomatically"] = $this["SkipAssigneeAutomatically"];
                TaskRow["Required"] = 'Yes';
                TaskRow["DateStarted"] = '';
                TaskRow["DateCompleted"] = '';
                TaskRow["Result"] = '';
                TaskRow["ButtonPressed"] = '';
                TaskRow["Comments"] = '';
                TaskRow["IsDelegated"] = false;
                TaskRow["ActionButtons"] = $this["ActionButtons"];
                TaskRow["TaskInstructions"] = $this["TaskInstructions"];
                TaskRow["PendingText"] = $this["PendingText"];
                this.WorkflowTasksJSON.push(TaskRow);
              }
              //single assignee
            } else {
              TaskRow = {};
              TaskRow["Sequence"] = $this["Sequence"];
              TaskRow["Iteration"] = 1;
              TaskRow["TaskName"] = $this["TaskName"];
              TaskRow["MultipleAssigneeRestriction"] = $this["MultipleAssigneeRestriction"];
              TaskRow["AssignedToName"] = AssigneesName;
              TaskRow["AssignedToEmail"] = AssignedToEmail;
              TaskRow["ExpectedCompletionDays"] = $this["ExpectedCompletionDays"];
              TaskRow["ReminderSchedule"] = $this["ReminderSchedule"];
              TaskRow["Escalation"] = $this["Escalation"];
              TaskRow["NotificationTemplate"] = $this["NotificationTemplate"];
              TaskRow["CommentsFlag"] = $this["CommentsFlag"];
              TaskRow["FormActionsRequired"] = $this["FormActionsRequired"];
              TaskRow["NumberofReminders"] = $this["NumberofReminders"];
              TaskRow["EditableFields"] = $this["EditableFields"];
              TaskRow["SkipAssigneeAutomatically"] = $this["SkipAssigneeAutomatically"];
              TaskRow["Required"] = 'Yes';
              TaskRow["DateStarted"] = '';
              TaskRow["DateCompleted"] = '';
              TaskRow["Result"] = '';
              TaskRow["ButtonPressed"] = '';
              TaskRow["Comments"] = '';
              TaskRow["IsDelegated"] = false;
              TaskRow["ActionButtons"] = $this["ActionButtons"];
              TaskRow["TaskInstructions"] = $this["TaskInstructions"];
              TaskRow["PendingText"] = $this["PendingText"];
              this.WorkflowTasksJSON.push(TaskRow);
            }
          });
          this.updateInitiationTask();
        }
      }
    }
    return this.WorkflowTasksJSON;
  }

  /**
  * Updat initiation tasks with the current user
  * */
  updateInitiationTask() {
    this.WorkflowTasksJSON[0].AssignedToEmail = this.CurrentLoggedInUser.Email;
    this.WorkflowTasksJSON[0].AssignedToName = this.CurrentLoggedInUser.DisplayName;
    this.WorkflowTasksJSON[0].Result = "Pending";
  }

  /**
  * Get current pending task from workflow tasks
  * */
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
  * Get current user task from pending task
  * */
  getCurrentUserTaskJSON(currentPendingTasks) {
    var pendingtaskslist = [];
    for (let key in currentPendingTasks) {
      let obj = currentPendingTasks[key];
      if (obj.Result == "Pending" && obj.AssignedToEmail.toLowerCase() == this.CurrentLoggedInUser.Email.toLowerCase()) {
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

  /**
  * add an asignee in workflow tasks which is selected in form peoplepicker
  * */
  addPeoplePickerValueInWorkflowTask(formDataJSON, taskType, taskNameToAdd, taskNameToAddAfter, FieldModel, TaskJSON, TaskIns, Pendingtxt, ButtonsJSON) {
    var Iteration = 1;
    var test = JSON.stringify(ButtonsJSON)
    ButtonsJSON = test.replace(/"/g, '\'');
    for (var k in this.WorkflowTasksJSON) {
      if (this.WorkflowTasksJSON[k].ButtonPressed == "RESUBMIT") {
        Iteration = parseInt(this.WorkflowTasksJSON[k].Iteration);
      }
    }
    TaskJSON = JSON.parse(TaskJSON);
    if (typeof formDataJSON[FieldModel] != "undefined" && formDataJSON[FieldModel].length > 0) {
      for (var i = 0; i < formDataJSON[FieldModel].length; i++) {
        var ApproverTitle = formDataJSON[FieldModel][i].DisplayName.replace(/;/, "");
        var ApproverEmail = formDataJSON[FieldModel][i].Email.replace(/;/, "");
        var LocalTaskJSON = '{"Sequence":"' + TaskJSON["Sequence"] + '",' +
          '"Iteration":"' + Iteration + '", ' +
          '"TaskName":"' + taskNameToAdd + '",' +
          '"MultipleAssigneeRestriction":"' + TaskJSON["MultipleAssigneeRestriction"] + '",' +
          '"AssignedToName":"' + ApproverTitle + '",' +
          '"AssignedToEmail":"' + ApproverEmail + '",' +
          '"ExpectedCompletionDays":"' + TaskJSON["ExpectedCompletionDays"] + '",' +
          '"NumberofReminders":"' + TaskJSON["NumberofReminders"] + '",' +
          '"EditableFields":"' + TaskJSON["EditableFields"] + '",' +
          '"SkipAssigneeAutomatically":"' + TaskJSON["SkipAssigneeAutomatically"] + '",' +
          '"Required":"' + TaskJSON["Required"] + '",' +
          '"ActionButtons":"' + JSON.parse(ButtonsJSON) + '",' +
          '"TaskInstructions":"' + TaskIns + '",' +
          '"PendingText":"' + Pendingtxt + '"}';
        LocalTaskJSON = LocalTaskJSON.replace(/\\/g, "\\\\");
        if (taskType.toLowerCase() == "add") {
          this.WorkflowTasksJSON = this.addWorkflowTask(taskNameToAdd, LocalTaskJSON)
        }
        else {
          this.WorkflowTasksJSON = this.updateWorkflowTask(taskNameToAdd, LocalTaskJSON)
        }
      }
    }
    else {
      alert('Assignee specified for "' + taskNameToAdd + '" has invalid user details. Please specify a valid user for this task.');
      formDataJSON[FieldModel] = [];
    }
    return this.WorkflowTasksJSON;
  }

  /**
  * add a new task in workflow tasks
  * */
  addWorkflowTask(TaskNameToAddAfter, TaskJSON) {
    TaskJSON = JSON.parse(TaskJSON);
    let TaskRowNumber: number = 0;
    var IsNewRow = 1;
    for (let i: number = 0; i < this.WorkflowTasksJSON.length; i++) {
      if (this.WorkflowTasksJSON[i]["TaskName"].toLowerCase() == TaskNameToAddAfter.toLowerCase() && (this.WorkflowTasksJSON[i]["Result"] == "" || this.WorkflowTasksJSON[i]["Result"] == "Pending")) {
        TaskRowNumber = i;
        IsNewRow = 0;
      }
    }

    var ApproverTitle = TaskJSON["AssignedToName"];
    var ApproverEmail = TaskJSON["AssignedToEmail"];
    var TaskRow = {};
    if (IsNewRow == 0) {

      TaskRow = JSON.parse(JSON.stringify(TaskJSON));

      TaskRow["AssignedToName"] = ApproverTitle;
      TaskRow["AssignedToEmail"] = ApproverEmail;
      this.WorkflowTasksJSON.splice(TaskRowNumber + 1, 0, TaskRow);
      TaskRowNumber = TaskRowNumber + 1;
    }

    else if (IsNewRow == 1) {
      
      TaskRow = JSON.parse(JSON.stringify(TaskJSON));

      TaskRow["AssignedToName"] = ApproverTitle;
      TaskRow["AssignedToEmail"] = ApproverEmail;

      if (TaskNameToAddAfter == "") {
        this.WorkflowTasksJSON.splice(0, 0, TaskRow);
      }
      else {
        this.WorkflowTasksJSON.splice(this.WorkflowTasksJSON.length, 0, TaskRow);

      }
    }
    return this.WorkflowTasksJSON;
  }

  /**
  * update an existing task in workflow tasks
  * */
  updateWorkflowTask = function (TaskNameToUpdate, TaskJSON) {
    TaskJSON = JSON.parse(TaskJSON);
    for (var i = 0; i < this.WorkflowTasksJSON.length; i++) {
      if (this.WorkflowTasksJSON[i]["TaskName"].toLowerCase() == TaskNameToUpdate.toLowerCase() && this.WorkflowTasksJSON[i]["Result"] == "") {
        for (let key in TaskJSON) {
          let value = TaskJSON[key]
          if (key != "Iteration") {
            if (key == "Sequence") {
              this.WorkflowTasksJSON[i][key] = parseInt(value);
            }
            else if (key == "ExpectedCompletionDays") {
              this.WorkflowTasksJSON[i][key] = parseInt(value);
            }
            else if (key == "SkipAssigneeAutomatically") {
              if (value == "false") {
                this.WorkflowTasksJSON[i][key] = false;
              }
              else {
                this.WorkflowTasksJSON[i][key] = true;
              }
            }
            else if (key == "ActionButtons") {
              if (value == "null") {
                this.WorkflowTasksJSON[i][key] = null;
              }
              else {
                this.WorkflowTasksJSON[i][key] = value;
              }
            }
            else {
              this.WorkflowTasksJSON[i][key] = value;
            }
          }
        }
      }
    }
    return this.WorkflowTasksJSON;
  }

  /**
  * get approver count for a composite task
  * */
  getApproverCount(ApproverId) {
    var origString = ApproverId;
    var characterToCount = "@";
    var counter = 0;
    //Check If First Approver is Composite or not
    var myArray = origString.toLowerCase().split('');
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i] == characterToCount) {
        counter++;
      }
    }
    return counter;
  }

  /**
  * set workflow tasks in the class object
  * */
  setWorkflowRouting(workflowRouting, processTasks) {
    this.WorkflowTasksJSON = workflowRouting;
    this.ProcessTasksJSON = processTasks;
  }

  /**
  * Check ig the current pending task is delegated ot not
  * */
  checkIsDelegatedTask(currentPendingTaskJson) {
    var obj = [];
    for (let i = 0; i < currentPendingTaskJson.length; i++) {
      if (currentPendingTaskJson[i].IsDelegated) {
        obj.push(i);
      }
    }
    return obj;
  }

  /**
  * Check workflow task
  * */
  checkWorkflowTaskJson(){
    return true;
  }



}
