import { ProcessOffsetPipe } from './../../pipes/process-offset/process-offset';
import { CustomDialogComponent } from './../../components/custom-dialog/custom-dialog';
import { Content, LoadingController, ModalController } from 'ionic-angular';
import * as moment from 'moment';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


/**
 * Importing neccassary liberaries and modules for this class 
 */
import { EncryptionProvider } from './../../providers/encryption/encryption';
import { HelperProvider } from './../../providers/helper/helper';
import { ENV } from './../../config/environment.prod';
import { SocialSharing } from '@ionic-native/social-sharing';
import { LoadingProvider } from './../../providers/loading/loading';
import { SocketProvider } from './../../providers/socket/socket';
import { ProcessFormProvider } from './../../providers/process-form/process-form';
import { WorkflowRoutingProvider } from './../../providers/workflow-routing/workflow-routing';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { ClientDbProcessWorkflowsProvider } from './../../providers/client-db-process-workflows/client-db-process-workflows';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  Compiler, Component, NgModule, OnInit, ViewChild,
  ViewContainerRef
} from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormsModule } from '@angular/forms';
import { AppModule } from '../../app/app.module';
import * as ts from "typescript";//tslint warning - used in internal method not detected by tslint
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { ClientDbNotificationsProvider } from '../../providers/client-db-notifications/client-db-notifications';
import { ScreenOrientation } from '@ionic-native/screen-orientation';


/*
ModuleID: page-form
Description: Renders process forms. Contains methods to update workflow engine and form rendering methods at various stages in a workflow.
Location: ./pages/page-form
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@IonicPage()
@Component({
  selector: 'page-form',
  templateUrl: 'form.html',
})
export class FormPage implements OnInit {
  isShareAble; // hides / shows the sharing button to share the form
  public processWorkflow; // current workflow data
  public processId: any; // process id of the process
  public workflowId: any; // current workflow id
  public formId: any; // current form id
  public formObjects: any; // for form objects needed to open form type json
  public actualFormId: any; // temp variable for holding form id and reference numbers
  public CurrentLoggedInUser: any; // current logged in user object
  public downloadlink = ""; // form download link

  public FormDataJSON: any; // Global variable for Process data JSON from workflows list
  public WorkflowSettingJSON: any; // Global variable for Process data JSON from workflows list
  public WorkflowTasksJSON: any[]; //Container for storing workflow tasks as JSON
  public ProcessTasksJSON: any[]; //Container for Workflow Tasks From Form design/Design Time Workflow Tasks
  public RepeatingTableJSON: any[]; //Container for storing workflow tasks as JSON

  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  @ViewChild(Content) content: Content;

  /**
   * Creates an instance of FormPage.
   * @param {Compiler} compiler 
   * @param {NavController} navCtrl 
   * @param {SocialSharing} socialsharing 
   * @param {HelperProvider} helper 
   * @param {SocketProvider} socket 
   * @param {LoadingProvider} loading 
   * @param {EncryptionProvider} encryptionProvider 
   * @param {AlertController} alertCtrl 
   * @param {ProcessFormProvider} processFormService 
   * @param {WorkflowRoutingProvider} workflowRoutingService 
   * @param {ProcessDataProvider} globalservice 
   * @param {ClientDbProcessWorkflowsProvider} ClientDBProcessWorkflows 
   * @param {NavParams} navParams 
   * @param {ErrorReportingProvider} errorReportingProvider 
   * @param {StorageServiceProvider} storageServiceProvider 
   * @param {ScreenOrientation} screenOrientation 
   * @memberof FormPage
   */
  constructor(private compiler: Compiler,
    public navCtrl: NavController,
    private socialsharing: SocialSharing,
    private helper: HelperProvider,
    public socket: SocketProvider,
    private loading: LoadingProvider,
    private encryptionProvider: EncryptionProvider,
    private alertCtrl: AlertController,
    private processFormService: ProcessFormProvider,
    private workflowRoutingService: WorkflowRoutingProvider,
    public globalservice: ProcessDataProvider,
    public ClientDBProcessWorkflows: ClientDbProcessWorkflowsProvider,
    public navParams: NavParams,
    private errorReportingProvider: ErrorReportingProvider,
    private storageServiceProvider: StorageServiceProvider,
    private screenOrientation: ScreenOrientation) {
    this.actualFormId = this.globalservice.actualFormId;
    this.processId = this.globalservice.processId;
    this.workflowId = this.globalservice.workflowId
    this.isShareAble = false;
  }

  /**
  * lock orientation on mobile devices to open form in landscap mod
  */
  ionViewDidLoad() {
    if (!(<any>window).isTablet) {
      if (this.screenOrientation.type == 'landscape' || this.screenOrientation.type == 'landscape-primary' || this.screenOrientation.type == 'landscape-secondary') {
        this.globalservice.returnScreenOrientation = 'landscape';
      }
      else if (this.screenOrientation.type == 'portrait' || this.screenOrientation.type == 'portrait-primary' || this.screenOrientation.type == 'portrait-secondary') {
        this.globalservice.returnScreenOrientation = 'portrait';
      }
      // set to landscape
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    }
  }


  /**
   * Reset the screen orientation on
   * view destruction 
   */
  ngOnDestroy() {
    //reset the screen orientation
    if (this.globalservice.returnScreenOrientation == 'landscape') {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    }
    else if (this.globalservice.returnScreenOrientation == 'portrait') {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
    // allow user rotate
    this.screenOrientation.unlock();
  }

  /**
  * Initialize the component
  */
  ngOnInit() {
    this.renderForm();
  }

  /**
  * resize the current ViewChild.
  */
  ngDoCheck() {
    this.content.resize();
  }

  /**
  * Adds the form component so that it can be rendered dynamically.
  */

  addComponent(formTemplate: string, formComponent: string) {
    @Component({
      template: formTemplate
    })
    class TemplateComponent {
      isGroupShown; // toggle the routing group section
      isRouteShown; // check if the routing is already shown
      shownGroup; // show only current routing group
      shownRoute; // check only current routing
      isInstructionshown; // toggle instructions
      isRoutingshown; // check if instructions routing is shown
      public formId: any; // form id of the process form
      public formObjects: any; // form objects required to render form
      public actualFormId: any; // temp variable for holding form id and reference numbers
      public commentsRequired: boolean; // temp variable for holding form id and reference numbers
      public copyInitiatorOnTaskNotifications: boolean; // check box value to add cc to initiator
      public FormDataJSON: any; // Global variable for Process data JSON from workflows list
      public CurrentUserTaskJSON = []; //For Saving current assigned task
      public CurrentPendingTasksJSON = []; //For Saving current Pending task
      public CurrentLoggedInUser = []; //Store details for the current logged in user
      public ProcessSettingsJSON = []; //Store the Process Settings for the Process
      public rapidFlowInternalsJSON = {} //RapidflowInternalJSON
      public WorkflowTasksJSON: any[]; // current routing
      public RepeatingTableJSON: any[]; // form repeating table jsons
      public LookupJSON: any[]; // lookup jsons
      public WorkflowSettingJSON = [] //the current workflow settings JSON
      public FormOptionsJSON = [] //the current form options JSON
      private DelegateActionButton: any; //Button Json for delegate
      public showDelegateButton = false; // boolean to show delegate drop down
      public showDelegateSection: boolean; // boolean to show delegate section
      public multipleAssignee: boolean; // to check for multiple assignee of a task
      private DelegateDetails: any[]; // holds data when a user selects a delegate
      public DelegateOptions: any; // populates the drop down menu of delegatees
      public delegateFrom: any; // delegate from name
      public allowAccess = false; // for checking if the user has access to this form
      public showPermissionNote = false; // show permissions note if available
      public allOtherUsers = false; // renders buttons for all other users
      public currentPendingTask: any; // current pending tasks of the form
      public ActionButtons: any[]; // action buttons to render on the form
      public actionPanelVisible: boolean; // make action panel visible
      public taskInstructions: string; // for task instructions
      public isFormDeleted: boolean; // check if the form is already delegated
      public workflowVersion: number; // for workflow versions
      public isDelegateAny: boolean; // check for special delegate any permission
      public validRepeatingTables: boolean; // check if the repeating table is valid
      public showRouting: boolean // toggle workflow routing
      public processOffset: any;//process offset
      public workflowAssesmentFlag: boolean = true; // Global flag of the class to check if the workflow assesment needs to be called or not
      public customDialogRef: any
      public customProgressDialogRef: any
      public formLoading:any;
      /**
       * Creates an instance of TemplateComponent.
       * @param {FormPage} a 
       * @param {LoadingProvider} loading 
       * @param {AlertController} alertCtrl 
       * @param {EncryptionProvider} encryptionProvider 
       * @param {ErrorReportingProvider} errorReportingProvider 
       * @param {SocketProvider} socket 
       * @param {WorkflowRoutingProvider} workflowRoutingService 
       * @param {ProcessFormProvider} processFormService 
       * @param {ClientDbNotificationsProvider} clientDbNotificationsProvider 
       * @param {ProcessDataProvider} globalservice 
       * @memberof TemplateComponent
       */
      constructor(private a: FormPage,
        private loading: LoadingProvider,
        private loadingctrl: LoadingController,
        private alertCtrl: AlertController,
        private encryptionProvider: EncryptionProvider,
        private errorReportingProvider: ErrorReportingProvider,
        private socket: SocketProvider,
        private workflowRoutingService: WorkflowRoutingProvider,
        private processFormService: ProcessFormProvider,
        public dialog: ModalController,
        private clientDbNotificationsProvider: ClientDbNotificationsProvider,
        public globalservice: ProcessDataProvider,
        public screenOrientation: ScreenOrientation) {
        this.commentsRequired = false;
        this.copyInitiatorOnTaskNotifications = true;
        this.actualFormId = a.actualFormId;
        this.ActionButtons = [];
        this.taskInstructions = "";
        this.CurrentLoggedInUser = a.CurrentLoggedInUser;
        this.isFormDeleted = false;
        this.DelegateDetails = [];
        this.DelegateActionButton = {};
        this.showDelegateSection = false;
        this.showDelegateButton = false;
        this.multipleAssignee = false;
        this.isDelegateAny = false;
        this.showRouting = true;
        this.DelegateOptions = {
          "defaultValue": "",
          "readonly": false,
          "disabled": false,
          "required": false,
          "visible": true,
          "validationText": "Field cannot be blank"
        };
        this.workflowVersion = 1;
        this.validRepeatingTables = false;
        this.actionPanelVisible = false;
        this.currentPendingTask = "";
        this.processOffset = "";
      }

      /**
      * Initialize the form component 
      */
      ngOnInit() {
        this.renderForm();
      }

      /**
      * toggle routing arrow
      */
      toggleroutuing(wf) {
        if (this.iswfroutingShownmethod(wf)) {
          this.isRoutingshown = null;
        } else {
          this.isRoutingshown = wf;
        }
      };

      /**
      * check if the routing is shown
      */
      iswfroutingShownmethod(wf) {
        return this.isRoutingshown === wf;
      };

      /**
      * toggle instructions
      */
      toggleins(ins) {
        if (this.isinsShownmethod(ins)) {
          this.isInstructionshown = null;
        } else {
          this.isInstructionshown = ins;
        }
      };

      /**
      * check if the instructions are shown 
      */
      isinsShownmethod(ins) {
        return this.isInstructionshown === ins;
      };

      /**
      * toggle workflow groups
      */
      toggleGroup(group) {
        if (this.isGroupShownmethod(group)) {
          this.shownGroup = null;
        } else {
          this.shownGroup = group;
        }
        this.shownRoute = null;
        //$ionicScrollDelegate.resize();
      };

      /**
      * toggle workflow comments
      */
      toggleRoute(route) {
        if (this.isRouteShownmethod(route)) {
          this.shownRoute = null;
        } else {
          this.shownRoute = route;
        }
      };

      /**
      * check if workflow routing is shown 
      */
      isGroupShownmethod(group) {
        return this.shownGroup === group;
      };

      /**
      * check if comments shown
      */
      isRouteShownmethod(route) {
        return this.shownRoute === route;
      };

      /**
      * Renders form and initialize form objects and render form in its states
      * checks for the button cases and button rendering logic
      * updates routing
      * checks form versions
      * check form authorizations.
      */

      renderForm() {
        try {
          // renders local form
          if (this.a.globalservice.localForm["localsaved"]) {
            this.WorkflowSettingJSON = this.a.formObjects.WorkflowSettingsJSON;
            this.ProcessSettingsJSON = this.a.formObjects.ProcessSettingsJSON;
            this.processOffset = this.ProcessSettingsJSON["PROCESS_TIMEZONE"];
            this.FormDataJSON = this.a.formObjects.FormData;;
            this.WorkflowTasksJSON = this.a.formObjects.WorkflowTasksJSON;
            this.workflowRoutingService.setWorkflowRouting(this.WorkflowTasksJSON, this.a.formObjects.WorkflowTasksJSON);

            this.RepeatingTableJSON = [];
            this.RepeatingTableJSON = this.a.formObjects.RepeatingTableJSON;
            this.LookupJSON = [];
            this.LookupJSON = this.a.formObjects.LookupJSON;
            this.CurrentPendingTasksJSON = this.getPendingTasksJSON(this.WorkflowTasksJSON);
            this.CurrentUserTaskJSON = this.getCurrentUserTaskJSON(this.CurrentPendingTasksJSON);
            if (this.WorkflowSettingJSON[0].Form_Settings.FORM_WORKFLOW_ROUTING_DISPLAY != undefined) {
              this.showRouting = this.WorkflowSettingJSON[0].Form_Settings.FORM_WORKFLOW_ROUTING_DISPLAY;
            }
            //update form instructions on the form
            this.taskInstructions = "";
            if (this.CurrentPendingTasksJSON.length > 0) {
              if (this.FormDataJSON["Status"] == "PENDING" && this.CurrentPendingTasksJSON[0]["TaskName"].toLowerCase() == this.WorkflowTasksJSON[0]["TaskName"].toLowerCase() && this.CurrentPendingTasksJSON[0]["IsDelegated"] == false) {
                this.WorkflowTasksJSON = this.getProcessTasksFromServer("PENDING");
              }
              this.taskInstructions = this.CurrentPendingTasksJSON[0].TaskInstructions;
              this.currentPendingTask = this.CurrentPendingTasksJSON[0].TaskName;
            }
            if (this.a.formObjects.DeletedOn != null || this.a.formObjects.DeletedOn != undefined) {
              if (this.a.formObjects.DeletedOn == "") {
                this.isFormDeleted = false;
              }
              else {
                this.isFormDeleted = true;
              }
            }
            this.ActionButtons = [];
            this.DelegateActionButton = {};
            this.processFormService.setIsFormDeleted(this.a.formObjects.DeletedOn);
            this.isFormDeleted = this.processFormService.getIsFormDeleted();
            this.ActionButtons = this.determineUserActions(this.WorkflowTasksJSON, this.CurrentPendingTasksJSON, this.CurrentUserTaskJSON, this.FormDataJSON, this.WorkflowSettingJSON[0].DefaultButtons, this.WorkflowSettingJSON[0].Form_Settings);

            // check for delegation tasks and action buttons rendering
            this.isDelegateAny = this.processFormService.getIsDelegateAny()

            if (this.CurrentPendingTasksJSON.length > 1) {
              this.multipleAssignee = true;
              if (!this.isDelegateAny) {
                this.delegateFrom = this.CurrentUserTaskJSON[0].AssignedToEmail;
              }
            }
            else if (this.CurrentPendingTasksJSON.length == 1) {
              this.multipleAssignee = false;
              this.delegateFrom = this.CurrentPendingTasksJSON[0].AssignedToEmail;
            }

            // check the current task is delegated or not
            let delegatedTasks = this.checkIsDelegatedTask(this.CurrentPendingTasksJSON);
            for (let i = 0; i < delegatedTasks.length; i++) {
              if (this.CurrentPendingTasksJSON.length == 1) {
              }
              else if (this.CurrentPendingTasksJSON.length > 1) {
                this.CurrentPendingTasksJSON.splice(delegatedTasks[i], 1);
              }
            }

            if (!this.CurrentUserTaskJSON[0].IsDelegated || this.isDelegateAny) {
              for (let key in this.ActionButtons) {
                this.actionPanelVisible = true;
                let obj = this.ActionButtons[key];
                if (key.toLowerCase() == "delegate") {
                  this.showDelegateSection = true;
                  this.showDelegateButton = false;
                  this.DelegateActionButton[key] = obj;
                  delete this.ActionButtons[key];
                }
              }
            }
            else {
              for (let key in this.ActionButtons) {
                this.actionPanelVisible = true;
                let obj = this.ActionButtons[key];
                if (key.toLowerCase() == "delegate") {
                  this.showDelegateSection = false;
                  this.showDelegateButton = false;
                  delete this.ActionButtons[key];
                }
              }
            }

            this.FormDataJSON = this.renderPendingForm(this.FormDataJSON, this.CurrentUserTaskJSON, this.RepeatingTableJSON, this.WorkflowTasksJSON, this.a.formObjects.FormOptionsJSON);
            if (this.FormDataJSON["InvalidRepeatingTables"] != undefined) {
              if (this.FormDataJSON["InvalidRepeatingTables"].length > 0) {
                this.validRepeatingTables = false;
              }
              else {
                this.validRepeatingTables = true;
              }
            }
            //check for new version
            if (parseInt(this.FormDataJSON["WorkflowVersion"]) < parseInt(this.a.formObjects.LatestVersion) && this.FormDataJSON["Status"] == "SAVED") {
              alert('Please delete this form as newer version is available')
              delete this.ActionButtons["SUBMIT"];
              if (this.isFormDeleted) {
                delete this.ActionButtons["RESTORE"];
              }
            }
            delete this.ActionButtons["DELETE"]
          }
          else if (this.actualFormId.toLowerCase() == "new") {
            this.WorkflowSettingJSON = this.a.formObjects.WorkflowSettingsJSON;
            this.ProcessSettingsJSON = this.a.formObjects.ProcessSettingsJSON;
            this.processOffset = this.ProcessSettingsJSON["PROCESS_TIMEZONE"];
            this.FormOptionsJSON = this.a.formObjects.FormOptionsJSON;
            this.workflowVersion = this.a.formObjects.Version;
            this.FormDataJSON = this.getFormData(this.a.processId, this.a.workflowId, this.ProcessSettingsJSON, this.WorkflowSettingJSON, this.FormOptionsJSON, this.workflowVersion);
            this.WorkflowTasksJSON = this.a.formObjects.WorkflowTasksJSON;
            this.workflowRoutingService.setWorkflowRouting(this.WorkflowTasksJSON, this.WorkflowTasksJSON);
            this.WorkflowTasksJSON = this.getProcessTasksFromServer("INITIATING");
            this.RepeatingTableJSON = this.a.formObjects.RepeatingTableJSON;
            this.FormDataJSON = this.updateInvalidRepeatingTables(this.FormDataJSON, this.FormDataJSON["FormOptions"], this.RepeatingTableJSON);
            this.LookupJSON = this.a.formObjects.LookupJSON;
            this.CurrentPendingTasksJSON = this.getPendingTasksJSON(this.WorkflowTasksJSON);
            this.CurrentUserTaskJSON = this.getCurrentUserTaskJSON(this.CurrentPendingTasksJSON);
            if (this.FormDataJSON["InvalidRepeatingTables"] != undefined) {
              if (this.FormDataJSON["InvalidRepeatingTables"].length > 0) {
                this.validRepeatingTables = false;
              }
              else {
                this.validRepeatingTables = true;
              }
            }
            // render new form buttons
            this.LookupJSON = this.a.formObjects.LookupJSON;
            if (this.WorkflowSettingJSON[0].Form_Settings.FORM_WORKFLOW_ROUTING_DISPLAY != undefined) {
              this.showRouting = this.WorkflowSettingJSON[0].Form_Settings.FORM_WORKFLOW_ROUTING_DISPLAY;
            }
            let NewActionButtons = {};
            try {
              if (this.WorkflowTasksJSON[0].ActionButtons) {
                NewActionButtons = this.WorkflowTasksJSON[0].ActionButtons;
              } else {
                NewActionButtons = this.WorkflowSettingJSON[0].DefaultButtons;
                this.WorkflowTasksJSON[0].ActionButtons = this.WorkflowSettingJSON[0].DefaultButtons;
              }
            } catch (err) {
              alert("Unable to parse - error in ActionButtons for pending Approver in Process Tasks. Error:" + err)
            }
            let buttonslist = ["SUBMIT", "SAVE", "CLOSE", "RESET"];
            this.taskInstructions = "";
            this.taskInstructions = this.WorkflowTasksJSON[0].TaskInstructions;
            this.ActionButtons = [];
            this.ActionButtons = this.generateActionButtons(this.a.processId, this.a.workflowId, this.WorkflowSettingJSON, NewActionButtons, buttonslist);
            for (let key in this.ActionButtons) {//tslint warning - used to iterate the first action button if it exists
              this.actionPanelVisible = true;
              break;
            }
            this.currentPendingTask = this.WorkflowTasksJSON[0].TaskName;
          }
          else {
            this.WorkflowSettingJSON = this.a.formObjects.WorkflowSettingsJSON;
            this.ProcessSettingsJSON = this.a.formObjects.ProcessSettingsJSON;
            this.processOffset = this.ProcessSettingsJSON["PROCESS_TIMEZONE"];
            this.FormDataJSON = this.a.formObjects.FormData;
            this.WorkflowTasksJSON = this.a.formObjects.FormTasks;
            this.workflowRoutingService.setWorkflowRouting(this.WorkflowTasksJSON, this.a.formObjects.WorkflowTasksJSON);

            this.RepeatingTableJSON = [];
            this.RepeatingTableJSON = this.a.formObjects.RepeatingTableJSON;
            this.LookupJSON = [];
            this.LookupJSON = this.a.formObjects.LookupJSON;
            this.CurrentPendingTasksJSON = this.getPendingTasksJSON(this.WorkflowTasksJSON);
            this.CurrentUserTaskJSON = this.getCurrentUserTaskJSON(this.CurrentPendingTasksJSON);
            if (this.WorkflowSettingJSON[0].Form_Settings.FORM_WORKFLOW_ROUTING_DISPLAY != undefined) {
              this.showRouting = this.WorkflowSettingJSON[0].Form_Settings.FORM_WORKFLOW_ROUTING_DISPLAY;
            }
            //update form instructions on the form
            this.taskInstructions = "";
            if (this.CurrentPendingTasksJSON.length > 0) {
              if (this.FormDataJSON["Status"] == "PENDING" && this.CurrentPendingTasksJSON[0]["TaskName"].toLowerCase() == this.WorkflowTasksJSON[0]["TaskName"].toLowerCase() && this.CurrentPendingTasksJSON[0]["IsDelegated"] == false) {
                this.WorkflowTasksJSON = this.getProcessTasksFromServer("PENDING");
              }
              this.taskInstructions = this.CurrentPendingTasksJSON[0].TaskInstructions;
              this.currentPendingTask = this.CurrentPendingTasksJSON[0].TaskName;
            }
            if (this.a.formObjects.DeletedOn != null || this.a.formObjects.DeletedOn != undefined) {
              if (this.a.formObjects.DeletedOn == "") {
                this.isFormDeleted = false;
              }
              else {
                this.isFormDeleted = true;
              }
            }
            this.ActionButtons = [];
            this.DelegateActionButton = {};
            this.processFormService.setIsFormDeleted(this.a.formObjects.DeletedOn);
            this.isFormDeleted = this.processFormService.getIsFormDeleted();
            this.ActionButtons = this.determineUserActions(this.WorkflowTasksJSON, this.CurrentPendingTasksJSON, this.CurrentUserTaskJSON, this.FormDataJSON, this.WorkflowSettingJSON[0].DefaultButtons, this.WorkflowSettingJSON[0].Form_Settings);

            // check for delegation tasks and action buttons rendering
            if (this.CurrentPendingTasksJSON.length > 1) {
              this.multipleAssignee = true;
              this.isDelegateAny = this.processFormService.getIsDelegateAny()
              if (!this.isDelegateAny) {
                this.delegateFrom = this.CurrentUserTaskJSON[0].AssignedToEmail;
              }
            }
            else if (this.CurrentPendingTasksJSON.length == 1) {
              this.multipleAssignee = false;
              this.delegateFrom = this.CurrentPendingTasksJSON[0].AssignedToEmail;
            }

            let delegatedTasks = this.checkIsDelegatedTask(this.CurrentPendingTasksJSON);
            for (let i = 0; i < delegatedTasks.length; i++) {
              if (this.CurrentPendingTasksJSON.length == 1) {
              }
              else if (this.CurrentPendingTasksJSON.length > 1) {
                this.CurrentPendingTasksJSON.splice(delegatedTasks[i], 1);
              }
            }

            if (!this.CurrentUserTaskJSON[0].IsDelegated) {
              for (let key in this.ActionButtons) {
                this.actionPanelVisible = true;
                let obj = this.ActionButtons[key];
                if (key.toLowerCase() == "delegate") {
                  this.showDelegateSection = true;
                  this.showDelegateButton = false;
                  this.DelegateActionButton[key] = obj;
                  delete this.ActionButtons[key];
                }
              }
            }
            else {
              for (let key in this.ActionButtons) {
                this.actionPanelVisible = true;
                if (key.toLowerCase() == "delegate") {
                  this.showDelegateSection = false;
                  this.showDelegateButton = false;
                  delete this.ActionButtons[key];
                }
              }
            }

            this.FormDataJSON = this.renderPendingForm(this.FormDataJSON, this.CurrentUserTaskJSON, this.RepeatingTableJSON, this.WorkflowTasksJSON, this.a.formObjects.DefaultValuesJSON);
            if (this.FormDataJSON["InvalidRepeatingTables"] != undefined) {
              if (this.FormDataJSON["InvalidRepeatingTables"].length > 0) {
                this.validRepeatingTables = false;
              }
              else {
                this.validRepeatingTables = true;
              }
            }
            //check for new version
            if (parseInt(this.FormDataJSON["WorkflowVersion"]) < parseInt(this.a.formObjects.LatestVersion) && this.FormDataJSON["Status"] == "SAVED") {
              alert('Please delete this form as newer version is available')
              delete this.ActionButtons["SUBMIT"];
              if (this.isFormDeleted) {
                delete this.ActionButtons["RESTORE"];
              }
            }
          }

          this.performFormLoadOperations();
          this.FormDataJSON = this.updateAttachmentPath(this.FormDataJSON["Status"], this.FormDataJSON);
        }
        catch (error) // main try/catch of render form
        {
          var user = this.CurrentLoggedInUser;
          this.errorReportingProvider.logErrorOnAppServer('Render Form Error',
            'An error occured while rendering form',
            user["AuthenticationToken"],
            this.globalservice.processId,
            'renderform()',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        }
      }
      /**
      * update form repeating table and validate it
      */
      updateTableValidation(event) {
        var found = false;
        if (this.FormDataJSON["InvalidRepeatingTables"] != undefined) {
          if (event != undefined) {
            if (event["tableName"] != undefined) {
              for (let i = 0; i < this.FormDataJSON["InvalidRepeatingTables"].length; i++) {
                if (this.FormDataJSON["InvalidRepeatingTables"][i]["tableName"].toLowerCase() == event["tableName"].toLowerCase()) {
                  found = true;
                  if (event["valid"]) {
                    this.FormDataJSON["InvalidRepeatingTables"].splice(i, 1);
                  }
                }
              }

              if (!found && !event["valid"]) {
                this.FormDataJSON["InvalidRepeatingTables"].push(event);
              }
            }
          }
        }
        if (this.FormDataJSON["InvalidRepeatingTables"].length > 0) {
          this.validRepeatingTables = false;
        }
        else {
          this.validRepeatingTables = true;
        }
      }

      /*
      * Method to call workflow assessment
      * Access workflow after the preconditions have been met.
      */

      performWorkflowAssesment(buttonID) {
        this.globalservice.localSavedFlag = false;

        if (buttonID != "SAVE") {
          this.FormDataJSON = this.updateFormForPdf(this.FormDataJSON, this.RepeatingTableJSON);
          this.FormDataJSON = this.updateAttachmentPath("COMPLETED", this.FormDataJSON);
        }
        let message = (buttonID == "SUBMIT" || buttonID == "RESUBMIT") ? "Processing Task..." : "Processing Task...";
        this.loading.presentLoading(message, 30000);
        if (this.workflowAssesmentFlag) {
          this.processFormService.performWorkflowAssesment(buttonID, this).then(tempFormComponent => {
            this.loading.hideLoading();
            if (typeof tempFormComponent["message"] == "undefined" && typeof tempFormComponent["Error"] == "undefined") {
              if (tempFormComponent.FormDataJSON["Status"] == "COMPLETED" || tempFormComponent.FormDataJSON["Status"] == "TERMINATED" || tempFormComponent.FormDataJSON["Status"] == "REJECTED") {
                tempFormComponent.FormDataJSON["DateCompleted"] = this.processFormService.formatDate(new Date());
              }
              switch (buttonID) {

                case "SAVE":
                  this.WorkflowTasksJSON = tempFormComponent.WorkflowTasksJSON;
                  this.FormDataJSON = tempFormComponent.FormDataJSON;
                  if (this.FormDataJSON["Status"].toLowerCase() == "notsaved") {
                    this.alertCtrl.create({
                      title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                      message: "You are not allowed to save any more forms. Kindly delete any and try again.",
                      buttons: [
                        {
                          text: 'OK',
                          role: 'OK',
                          handler: () => {
                            this.loading.hideLoading();
                            this.a.navCtrl.pop()
                          }
                        }
                      ]
                    }).present();
                  }
                  else if (this.globalservice.localSavedFlag) {
                    this.alertCtrl.create({
                      title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                      message: "No connectivity, the form has been saved locally.",
                      buttons: [
                        {
                          text: 'OK',
                          role: 'OK',
                          handler: () => {
                            this.loading.hideLoading();
                            this.a.navCtrl.pop()
                          }
                        }
                      ]
                    }).present();
                  }
                  else {
                    let processOffset = new ProcessOffsetPipe();
                    let processOffsetDate = processOffset.transform(moment.utc(new Date()), this.ProcessSettingsJSON["PROCESS_TIMEZONE"]);
                    //processOffsetDate = moment(processOffsetDate).format('DD-MMM-YYYY HH:MM:A');
                    this.FormDataJSON["SavedDateTime"] = processOffsetDate; 
                    this.processFormService.performWorkflowProgress(buttonID, this);
                    this.alertCtrl.create({
                      title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                      message: "Form has been saved successfully.",
                      buttons: [
                        {
                          text: 'OK',
                          role: 'OK',
                          handler: () => {
                            this.loading.hideLoading();
                            this.a.navCtrl.pop()
                          }
                        }
                      ]
                    }).present();
                  }
                  break;
                case "SUBMIT":
                  this.WorkflowTasksJSON = tempFormComponent.WorkflowTasksJSON;
                  this.FormDataJSON = tempFormComponent.FormDataJSON;
                  this.processFormService.performWorkflowProgress(buttonID, this);
                  this.performPostWorkflowTaskOperations(this.FormDataJSON["Status"], this.currentPendingTask, buttonID).then(response => {
                    if (response) {
                      if (this.FormDataJSON["Reference"] != "Not Assigned" && this.FormDataJSON["Status"] != "SAVED") {
                        this.alertCtrl.create({
                          title: 'Task Completed',
                          message: "Form has been submitted successfully and assigned reference number - " + this.FormDataJSON["Reference"],
                          buttons: [
                            {
                              text: 'OK',
                              role: 'OK',
                              handler: () => {
                                this.loading.hideLoading();
                                this.a.navCtrl.pop()
                              }
                            }
                          ]
                        }).present();
                      }
                      else if (!this.globalservice.localSavedFlag) {
                        this.alertCtrl.create({
                          title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                          message: "The worklfow is not registered in production. Form has been saved successfully. Please contact support for details.",
                          buttons: [
                            {
                              text: 'OK',
                              role: 'OK',
                              handler: () => {
                                this.loading.hideLoading();
                                this.a.navCtrl.pop()
                              }
                            }
                          ]
                        }).present();
                      }
                      else {
                        this.alertCtrl.create({
                          title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                          message: "No connectivity, the form has been saved locally.",
                          buttons: [
                            {
                              text: 'OK',
                              role: 'OK',
                              handler: () => {
                                this.loading.hideLoading();
                                this.a.navCtrl.pop()
                              }
                            }
                          ]
                        }).present();
                      }
                    }
                    else {
                      this.loading.hideLoading();
                      this.a.navCtrl.pop()
                    }
                  });
                  break;

                case "CLAIM":
                case "PROCEED_WITH_YES":
                case "PROCEED_WITH_NO":
                case "RESUBMIT":
                case "REJECT":
                case "TERMINATE":
                case "RESTART":
                case "DELEGATE":
                  this.WorkflowTasksJSON = tempFormComponent.WorkflowTasksJSON;
                  this.FormDataJSON = tempFormComponent.FormDataJSON;
                  this.FormDataJSON["DisplayStatus"] = this.WorkflowSettingJSON[0].Workflow_Status_Labels[this.FormDataJSON["Status"]];
                  this.processFormService.performWorkflowProgress(buttonID, this);
                  this.performPostWorkflowTaskOperations(this.FormDataJSON["Status"], this.currentPendingTask, buttonID).then(response => {
                    if (response) {
                      this.loading.hideLoading();
                      this.a.navCtrl.pop();
                    }
                    else {
                      this.loading.hideLoading();
                    }
                  });

                  //try delete the notification in case of local task present..
                  this.clientDbNotificationsProvider.removeTask(parseInt(this.globalservice.processId), parseInt(this.globalservice.workflowId), this.FormDataJSON["FormID"])
                  break;

              }
            }
            else {
              if (buttonID == "DELEGATE") {
                this.alertCtrl.create({
                  title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                  message: tempFormComponent["message"],
                  buttons: [
                    {
                      text: 'OK',
                      role: 'OK',
                      handler: () => {
                        this.loading.hideLoading();
                        this.a.navCtrl.pop()
                      }
                    }
                  ]
                }).present();
              }
              else if (tempFormComponent["message"] != undefined) {
                this.alertCtrl.create({
                  title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                  message: tempFormComponent["message"],
                  buttons: [
                    {
                      text: 'OK',
                      role: 'OK',
                      handler: () => {
                        this.loading.hideLoading();
                        this.a.navCtrl.pop()
                      }
                    }
                  ]
                }).present();
              }
              else if (tempFormComponent["Error"] != undefined) {
                // this.rapidflowService.ShowErrorMessage("generateReferenceNumber-Process Form service", "Platfrom", "Error occured while executing api call", tempFormComponent["Error"], "An error occured while generating reference number", "RapidflowServices.workflowAssesment", this.a.processId, true);
                var user = this.CurrentLoggedInUser;
                this.errorReportingProvider.logErrorOnAppServer('Form Component Error',
                  'Error occured while executing api call',
                  user["AuthenticationToken"],
                  this.globalservice.processId,
                  'userAction-FormSub',
                  tempFormComponent["Error"] ? tempFormComponent["Error"] : '',
                  tempFormComponent["Error"] ? tempFormComponent["Error"] : '',
                  new Date().toTimeString(),
                  'open',
                  'Platform',
                  '');
              }
            }
          }).catch(error => {
            if (error != 'NoConnection') {
              this.errorReportingProvider.logErrorOnAppServer('userActionWithPreWorkflowTasks Error',
                'userActionWithPreWorkflowTasks',
                this.processFormService.CurrentLoggedInUser.AuthenticationToken,
                this.globalservice.processId,
                'userActionWithPreWorkflowTasks',
                error.message ? error.message : '',
                error.stack ? error.stack : '',
                new Date().toTimeString(),
                'open',
                'Platform',
                '');
            }
          });
        }
        else {

        }
      }
      /**
         * Custom dialog for the developer to render HTML in dialog
         * 
         * @param {any} dialogTitle 
         * @param {any} dialogHtml 
         * @param {any} dialogLogic 
         * @memberof TemplateComponent
         */
        openCustomDialog(dialogTitle, dialogHtml, dialogLogic, redirect, refresh) {
          this.customDialogRef = this.dialog.create(CustomDialogComponent, {
            data: {
              title: dialogTitle,
              dialogHtml: dialogHtml,
              dialogLogic: dialogLogic,
              FormDataJSON: this.FormDataJSON
            }
          });
          this.customDialogRef.onDidDismiss(data => {
            if(redirect){
                this.a.navCtrl.pop()
              }
              else if(refresh){
                this.a.navCtrl.pop()
              }
          });
          this.customDialogRef.present();
        }


        /**
         * Show custom progress dialog message
         * 
         * @param {any} message 
         * @memberof TemplateComponent
         */
        showCustomProgressDialog(message, clickOutSideToClose){
          if(message == "" || message == undefined){
            message = "Please wait...";
          }
          this.formLoading =  this.loadingctrl.create({
            content:message
          })
          this.formLoading.present();
        }

        /**
         * Hide custom progress dialog
         * 
         * @memberof TemplateComponent
         */
        hideCustomProgressDialog(){
          this.formLoading.dismiss();
        }
        closeCustomDialog(){
           this.customDialogRef.dismiss();
        }

      promptUserBeforeAction(buttonID, button, currentPendingTaskName) {
        var self = this;
        if (button.confirmation.toLowerCase() == "none") {
          self.userActionWithoutPreWorkflowTasks(buttonID, currentPendingTaskName);
        }
        else if (button.confirmation.toLowerCase() == "warn") {
          let alert = self.alertCtrl.create({
            title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
            message: (button.warningtext) ? (button.warningtext) : 'Are you sure you want to ' + button.label,
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
                  self.userActionWithoutPreWorkflowTasks(buttonID, currentPendingTaskName);
                }
              }
            ]
          });
          alert.present();
        }
        else if (button.confirmation.toLowerCase() == "authenticate") {
          let alert = self.alertCtrl.create({
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
                  if (data.password.length > 0) {
                    this.loading.presentLoading('Authenticating...', 30000)
                    var authenticateObj = {
                      loginId: self.encryptionProvider.encryptData(self.globalservice.user.LoginID.toLowerCase()),
                      password: self.encryptionProvider.encryptData(data.password.toString()),
                      diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
                      operationType: 'APPLICATION'
                    }
                    self.socket.callWebSocketService('validateCredentials', authenticateObj).then((result) => {

                      if (result === 'false') {
                        let alert = self.alertCtrl.create({
                          title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
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
                        self.userActionWithoutPreWorkflowTasks(buttonID, currentPendingTaskName);
                        return true;
                      }
                    }).catch(error => {
                      self.loading.hideLoading();
                      let alert = self.alertCtrl.create({
                        title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                        message: "Could not authenticate",
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
                    });
                  }
                  else {
                    let alert = self.alertCtrl.create({
                      title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
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
              }
              , {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {

                }
              }
            ]
          });
          alert.present();
        }
      }

      /**
      * Perform user action when a user clicks on a button
      */
      performActionNow(buttonId, button) {
        var self = this;
        if (button.confirmation.toLowerCase() == "none") {
          self.performWorkflowAssesment(buttonId)
        }
        else if (button.confirmation.toLowerCase() == "warn") {
          let alert = self.alertCtrl.create({
            title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
            message: (button.warningtext) ? (button.warningtext) : 'Are you sure you want to ' + button.label,
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
                  self.performWorkflowAssesment(buttonId)
                }
              }
            ]
          });
          alert.present();
        }
        else if (button.confirmation.toLowerCase() == "authenticate") {
          let alert = self.alertCtrl.create({
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
                  if (data.password.length > 0) {
                    this.loading.presentLoading('Authenticating...', 30000)
                    var authenticateObj = {
                      loginId: self.encryptionProvider.encryptData(self.globalservice.user.LoginID.toLowerCase()),
                      password: self.encryptionProvider.encryptData(data.password.toString()),
                      diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
                      operationType: 'APPLICATION'
                    }
                    self.socket.callWebSocketService('validateCredentials', authenticateObj).then((result) => {

                      if (result === 'false') {
                        let alert = self.alertCtrl.create({
                          title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
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
                        self.performWorkflowAssesment(buttonId)
                        return true;
                      }
                    }).catch(error => {
                      self.loading.hideLoading();
                      let alert = self.alertCtrl.create({
                        title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                        message: "Could not authenticate",
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
                    });
                  }
                  else {
                    let alert = self.alertCtrl.create({
                      title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
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
              }
              , {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {

                }
              }
            ]
          });
          alert.present();
        }
      };

      /**
      * Perform user action after button validations
      */

      userAction(buttonID, button) {
        try {
          
          let currentPendingTaskName = "";
          if (this.CurrentPendingTasksJSON.length < 1) {
            currentPendingTaskName = this.WorkflowTasksJSON[0]["TaskName"];
          }
          else {
            currentPendingTaskName = this.CurrentPendingTasksJSON[0]["TaskName"];
          }

          switch (buttonID) {
            case "SUBMIT":
            case "CLAIM":
            case "PROCEED_WITH_YES":
            case "PROCEED_WITH_NO":
            case "RESUBMIT":
            case "REJECT":
            case "TERMINATE":
            case "RESTART":
            case "DELEGATE":
            case "SAVE":
              if (buttonID == "DELEGATE") {
                if (this.delegateFrom == "") {
                  this.alertCtrl.create({
                    title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                    message: "Please select an assignee whose task you want to delegate.",
                    buttons: [
                      {
                        text: 'OK',
                        role: 'OK',
                        handler: () => {
                        }
                      }
                    ]
                  }).present();

                }
                else if (this.DelegateDetails.length == 0) {
                  this.alertCtrl.create({
                    title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                    message: "Please select an assignee for task delegation.",
                    buttons: [
                      {
                        text: 'OK',
                        role: 'OK',
                        handler: () => {
                        }
                      }
                    ]
                  }).present();

                }
                else if (this.delegateFrom.toLowerCase() == this.DelegateDetails[0].Email.toLowerCase()) {
                  this.alertCtrl.create({
                    title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                    message: "Please select another user as the task is already pending with the selected assignee.",
                    buttons: [
                      {
                        text: 'OK',
                        role: 'OK',
                        handler: () => {
                        }
                      }
                    ]
                  }).present();

                }
                else {
                  this.userActionWithPreWorkflowTasks(buttonID, button, currentPendingTaskName);
                }
              }
              else {
                this.userActionWithPreWorkflowTasks(buttonID, button, currentPendingTaskName);
              }
              break;

            case "DELETE":
            case "RESTORE":

              this.promptUserBeforeAction(button, buttonID, currentPendingTaskName);
              break;
          }

        } catch (error) {
          var user = this.CurrentLoggedInUser;
          this.errorReportingProvider.logErrorOnAppServer('Form Component Error',
            'An error occured while performing action',
            user["AuthenticationToken"],
            this.globalservice.processId,
            'userAction-FormSub',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        }
      }

      /**
      * Called if the required action taken by the user requires further method to be called before starting a workflow
      * form custom logic is executed here and check if everything is ok before proceed.
      */
      userActionWithPreWorkflowTasks(buttonID, button, currentPendingTaskName) {
        if (this.checkWorkflowTaskJson()) {
          this.WorkflowTasksJSON = this.updateTaskInstructions(this.FormDataJSON, this.WorkflowTasksJSON);
          this.performPreWorkflowTaskOperations(this.FormDataJSON["Status"], currentPendingTaskName, buttonID).then(response => {
            if (response) {
              this.performActionNow(buttonID, button)
            }
            else {
              //this.loading.hideLoading();
            }
          })
        }
        else {
          this.alertCtrl.create({
            title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
            message: "Workflow routing is not valid. Please contact process administrator.",
            buttons: [
              {
                text: 'OK',
                role: 'OK',
                handler: () => {
                  //this.loading.hideLoading();
                  this.a.navCtrl.pop()
                }
              }
            ]
          }).present();
        }
      }

      /**
      * Called if the required action taken by the user doesn't requires further method to be called before starting a workflow
      * form custom logic is not executed here.
      */
      userActionWithoutPreWorkflowTasks(buttonID, currentPendingTaskName) {
        let message = (buttonID == "SUBMIT" || buttonID == "RESUBMIT") ? "Starting Workflow..." : "Processing Task...";
        this.loading.presentLoading(message, 20000);
        this.processFormService.performWorkflowAssesment(buttonID, this).then(tempFormComponent => {
          if (tempFormComponent.FormDataJSON["Status"] == "COMPLETED" || tempFormComponent.FormDataJSON["Status"] == "TERMINATED" || tempFormComponent.FormDataJSON["Status"] == "REJECTED") {
            tempFormComponent.FormDataJSON["DateCompleted"] = this.processFormService.formatDate(new Date());
          }
          switch (buttonID) {
            case "DELETE":
            case "RESTORE":
              this.loading.hideLoading();
              this.a.navCtrl.pop()
              break;
          }
        })
      }

      /**
      * hooks provided for form load operation
      */
      performFormLoadOperations() {
        alert("Original");
      }

      /**
      * hooks provided for performPreWorkflowTaskOperations
      */
      performPreWorkflowTaskOperations(status, currentTaskName, userAction) {
        let promise = new Promise((resolve, reject) => {
          resolve(true);
        });
        return promise;
      }

      /**
      * hooks provided for performPostWorkflowTaskOperations
      */

      performPostWorkflowTaskOperations(status, currentTaskName, userAction) {
        let promise = new Promise((resolve, reject) => {
          resolve(true);
        });
        return promise;
      }

      /**
         * Function to return formdatajson object from process form service
         * 
         * @param {any} processId 
         * @param {any} workflowId 
         * @param {any} processSettingsJSON 
         * @param {any} workflowSettingJSON 
         * @param {any} formOptionsJSON 
         * @param {any} workflowVersion 
         * @returns 
         * @memberof TemplateComponent
         */
        getFormData(processId, workflowId, processSettingsJSON, workflowSettingJSON, formOptionsJSON, workflowVersion){
          return this.processFormService.getFormData(processId, workflowId, processSettingsJSON, workflowSettingJSON, formOptionsJSON, workflowVersion);
        }

        /**
         * Function to check validation on repeating tables
         * 
         * @param {any} formDataJSON 
         * @param {any} formOptions 
         * @param {any} repeatingTableJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        updateInvalidRepeatingTables(formDataJSON, formOptions, repeatingTableJSON){
          return this.processFormService.updateInvalidRepeatingTables(formDataJSON, formOptions, repeatingTableJSON);
        }

        /**
         * Function to generate action buttons for the user
         * 
         * @param {any} processId 
         * @param {any} workflowId 
         * @param {any} workflowSettingJSON 
         * @param {any} newActionButtons 
         * @param {any} buttonslist 
         * @returns 
         * @memberof TemplateComponent
         */
        generateActionButtons(processId, workflowId, workflowSettingJSON, newActionButtons, buttonslist){
          return this.processFormService.generateActionButtons(processId, workflowId, workflowSettingJSON, newActionButtons, buttonslist)
        }

        /**
         * Function to determine user action for user
         * 
         * @param {any} workflowTasksJSON 
         * @param {any} currentPendingTasksJSON 
         * @param {any} currentUserTaskJSON 
         * @param {any} formDataJSON 
         * @param {any} defaultButtons 
         * @param {any} formSettings 
         * @returns 
         * @memberof TemplateComponent
         */
        determineUserActions(workflowTasksJSON, currentPendingTasksJSON, currentUserTaskJSON, formDataJSON, defaultButtons, formSettings){
          return this.processFormService.determineUserActions(workflowTasksJSON, currentPendingTasksJSON, currentUserTaskJSON, formDataJSON, defaultButtons, formSettings);
        }

        /**
         * Function called to render pending form for user
         * 
         * @param {any} formDataJSON 
         * @param {any} currentUserTaskJSON 
         * @param {any} repeatingTableJSON 
         * @param {any} workflowTasksJSON 
         * @param {any} defaultValuesJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        renderPendingForm(formDataJSON, currentUserTaskJSON, repeatingTableJSON, workflowTasksJSON, defaultValuesJSON){
          return this.processFormService.renderPendingForm(formDataJSON, currentUserTaskJSON, repeatingTableJSON, workflowTasksJSON, defaultValuesJSON);
        }

        /**
         * Function to update attachment path based on form status
         * 
         * @param {any} formStatus 
         * @param {any} formDataJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        updateAttachmentPath(formStatus, formDataJSON){
          return this.processFormService.updateAttachmentPath(formStatus, formDataJSON);
        }

        /**
         * Function to update task instructions in workflow tasks
         * 
         * @param {any} formDataJSON 
         * @param {any} workflowTasksJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        updateTaskInstructions(formDataJSON, workflowTasksJSON){
          return this.processFormService.updateTaskInstructions(formDataJSON, workflowTasksJSON);
        }

        /**
         * Function to update form data for pdf
         * 
         * @param {any} formDataJSON 
         * @param {any} repeatingTableJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        updateFormForPdf(formDataJSON, repeatingTableJSON){
          return this.processFormService.updateFormForPdf(this.FormDataJSON, this.RepeatingTableJSON);
        }

        /**
         * Update workflow routing as per form status
         * 
         * @param {any} status 
         * @returns 
         * @memberof TemplateComponent
         */
        getProcessTasksFromServer(status){
          return this.workflowRoutingService.getProcessTasksFromServer(status);
        }

        /**
         * Function to get current pending tasks from workflow tasks json
         * 
         * @param {any} workflowTasks 
         * @returns 
         * @memberof TemplateComponent
         */
        getPendingTasksJSON(workflowTasks){
          return this.workflowRoutingService.getPendingTasksJSON(workflowTasks);
        }

        /**
         * Function to return current user task from current pending tasks
         * 
         * @param {any} currentPendingTasksJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        getCurrentUserTaskJSON(currentPendingTasksJSON){
          return this.workflowRoutingService.getCurrentUserTaskJSON(currentPendingTasksJSON);
        }

        /**
         * Check if the current pending task is delegated or not
         * 
         * @param {any} currentPendingTasksJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        checkIsDelegatedTask(currentPendingTasksJSON){
          return this.workflowRoutingService.checkIsDelegatedTask(currentPendingTasksJSON);
        }

        /**
         * Function to validate the workflow tasks json
         * 
         * @returns 
         * @memberof TemplateComponent
         */
        checkWorkflowTaskJson(){
          return this.workflowRoutingService.checkWorkflowTaskJson();
        }


    }

    // injects custome module so that new form is FINALLY rendered here
    @NgModule({ declarations: [TemplateComponent], imports: [AppModule, FlexLayoutModule, FormsModule] })
    class TemplateModule { }

    const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
    const factory = mod.componentFactories.find((comp) =>
      comp.componentType === TemplateComponent
    );
    let comp = '';
    let result = ts.transpile(formComponent);
    eval(result)
    const component = this.container.createComponent(factory);
    Object.assign(component.instance, comp);
  }

  /**
  * Method called for outer components which reads data from local DB in case of new
  * Calls socket method to retrieve form data in case of pending form or completed.
  */
  renderForm() {
    try {
      this.processFormService.setPlatformSettings();
      this.processFormService.getUserPermissions();
      this.processFormService.CurrentLoggedInUser = this.globalservice.user;
      this.workflowRoutingService.CurrentLoggedInUser = this.globalservice.user;
      this.CurrentLoggedInUser = this.globalservice.user;
      if (this.globalservice.localForm["localsaved"]) {
        this.globalservice.localForm["formData"] = this.helper.parseJSONifString(this.globalservice.localForm["formData"]);
        this.globalservice.localForm["formpackage"] = this.helper.parseJSONifString(this.globalservice.localForm["formpackage"]);
        this.ClientDBProcessWorkflows.getWorkFlow(this.globalservice.localForm["formData"].ProcessID, this.globalservice.localForm["formData"].WorkflowID).then((result) => {
          this.formObjects = JSON.parse(result["Value"]);
          this.formObjects.FormData = this.globalservice.localForm["formData"];
          this.formObjects.WorkflowTasksJSON = this.helper.parseJSONifString(this.globalservice.localForm["oldworkflowtasks"]);
          this.formObjects.FormHtml = this.processFormService.getFormHtml(this.formObjects.FormHtml);
          this.formObjects.FormController = this.processFormService.getFormLogicComponent(this.formObjects.FormController);
          this.loading.presentLoading("Loading form...", 20000);
          this.addComponent(this.formObjects.FormHtml, this.formObjects.FormController);
          this.loading.hideLoading();

        });
      }
      else if (this.actualFormId.toLowerCase() == "new") {
        this.isShareAble = true;
        this.ClientDBProcessWorkflows.getWorkFlow(this.globalservice.processId, this.globalservice.workflowId).then((result) => {
          this.formObjects = JSON.parse(result["Value"]);
          if (this.formObjects) {
            this.formObjects.FormHtml = this.processFormService.getFormHtml(this.formObjects.FormHtml);
            this.formObjects.FormController = this.processFormService.getFormLogicComponent(this.formObjects.FormController);
            this.loading.presentLoading("Loading form...", 20000);
            this.addComponent(this.formObjects.FormHtml, this.formObjects.FormController);
            this.loading.hideLoading();
          }
          else {
            this.loading.hideLoading();
            this.alertCtrl.create({
              title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
              message: "You are not authorized to open this request.",
              buttons: [
                {
                  text: 'OK',
                  role: 'OK',
                  handler: () => {
                    this.navCtrl.pop()
                  }
                }
              ]
            }).present();
          }

        });
      }
      else {

        var socketParameters = {
          processId: this.globalservice.processId,
          workflowId: this.globalservice.workflowId,
          formId: this.globalservice.actualFormId,
          diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
          operationType: 'PROCESS'
        };
        this.loading.presentLoading("Loading form...", 20000);
        this.socket.callWebSocketService('RetrieveFormDataWithFreshTemplate', socketParameters)
          .then((result) => {
            try {

              //update attachment paths in case of completed
              this.loading.hideLoading();
              this.isShareAble = true;

              this.formObjects = result[0];
              if (this.formObjects) {
                this.FormDataJSON = this.formObjects.FormData;
                this.formObjects.FormHtml = this.processFormService.getFormHtml(this.formObjects.FormHTML);
                this.formObjects.FormController = this.processFormService.getFormLogicComponent(this.formObjects.FormController);
                switch (this.FormDataJSON["Status"]) {
                  case "COMPLETED":
                  case "TERMINATED":
                  case "REJECTED":

                    var downloadlink = ENV.DOWNLOAD_PDF_PATH + "/WCFFileAttachmentService.svc/downloadFile?fPath=" + this.encryptionProvider.encryptData(this.FormDataJSON["ArchivePath"] + "\\" + this.FormDataJSON["ProcessID"] + "\\" + this.FormDataJSON["WorkflowID"] + "\\" + this.FormDataJSON["FormID"] + "\\" + this.FormDataJSON["Reference"] + ".pdf");
                    this.downloadlink = downloadlink;
                    break;
                }


                //check for form authorizations
                if (this.processFormService.checkFormAuthorization(this.formObjects.FormData["AllJobReaders"], this.formObjects.FormData["ManagerEmail"], this.formObjects.FormData["InitiatedByEmail"], this.globalservice.processpermissions.processUserSettings.Process_User_Permissions, this.workflowId, this.formObjects.FormData["Status"])) {
                  this.addComponent(this.formObjects.FormHtml, this.formObjects.FormController);
                }
                else {
                  this.alertCtrl.create({
                    title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                    message: "Invalid form details or form does not exist. Kindly contact support.",
                    buttons: [
                      {
                        text: 'OK',
                        role: 'OK',
                        handler: () => {
                          this.navCtrl.pop()
                        }
                      }
                    ]
                  }).present();
                }

              }
              else {
                this.alertCtrl.create({
                  title: this.WorkflowSettingJSON[0].Form_Header.FormTitle ? this.WorkflowSettingJSON[0].Form_Header.FormTitle : 'RapidFlow',
                  message: "Invalid form details or form does not exist. Kindly contact support.",
                  buttons: [
                    {
                      text: 'OK',
                      role: 'OK',
                      handler: () => {
                        this.navCtrl.pop()
                      }
                    }
                  ]
                }).present();
              }
            }
            catch (err) {
              alert(err);
            }
          }).catch(error => {
            this.loading.hideLoading();
            if (error != 'NoConnection') {
              this.storageServiceProvider.getUser().then((user) => {
                this.errorReportingProvider.logErrorOnAppServer('Form Data Error',
                  'Error while retrieving form data',
                  user.AuthenticationToken.toString(),
                  this.processId.toString(),
                  'FormPage(socket.RetrieveFormDataWithFreshTemplate)',
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
    catch (error) // main try/catch on render form
    {
      if (error != 'NoConnection') {
        this.storageServiceProvider.getUser().then((user) => {
          this.errorReportingProvider.logErrorOnAppServer('renderform Error',
            'Error while calling render form',
            user.AuthenticationToken.toString(),
            this.processId.toString(),
            'renderform()',
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
  * Share form link on the form.
  */

  shareForm() {
    var weblink = "";
    if(this.formObjects.FormData)
    {
      weblink = ENV.WEB_SERVER_URL + "sharedurl?route=form&processID=" + this.processId + "&workflowID=" + this.workflowId + "&formID=" + this.actualFormId + "&reference=" + this.formObjects.FormData.Reference
    }
    else
    {
      weblink = ENV.WEB_SERVER_URL + "sharedurl?route=form&processID=" + this.processId + "&workflowID=" + this.workflowId + "&formID=" + this.actualFormId + "&reference=" + "Not%20Assigned"
    }
     
    this.socialsharing.share(weblink).then((val) => {

    });
  }
}

