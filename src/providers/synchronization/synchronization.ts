import { HelperProvider } from './../helper/helper';
import { ProcessDataProvider } from './../process-data/process-data';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: SynchronizationProvider
Description: Contains methods to run a synchronization routine on device. Updates other tables and create up sync tasks.
Location: ./providers/SynchronizationProvider
Author: Hassan, Arsalan
Version: 1.0.0
Modification history: none
*/


/**
* Importing neccassary libraries and modules for this class 
*/
import { ApplicationDataProvider } from './../application-data/application-data';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Events } from 'ionic-angular';
import { Platform } from 'ionic-angular/index';
import { LoadingProvider } from './../loading/loading';
import { StorageServiceProvider } from './../storage-service/storage-service';
import { DbDataDumpProvider } from './../db-data-dump/db-data-dump';
import { ClientDbProvider } from './../client-db/client-db';
import { SocketProvider } from './../socket/socket';
import { ClientDbProcessObjectsProvider } from './../client-db-process-objects/client-db-process-objects';
import { ClientDbProcessLookupsDataProvider } from './../client-db-process-lookups-data/client-db-process-lookups-data';
import { ClientDbProcessLookupObjectsProvider } from './../client-db-process-lookup-objects/client-db-process-lookup-objects';
import { ClientDbWorkflowSubmissionsProvider } from './../client-db-workflow-submissions/client-db-workflow-submissions';
import { ClientDbProcessWorkflowsProvider } from './../client-db-process-workflows/client-db-process-workflows';
import { ClientDbProcessResourcesProvider } from './../client-db-process-resources/client-db-process-resources';
import { ClientDbUserProfilesProvider } from './../client-db-user-profiles/client-db-user-profiles';
import { ClientDbAppResourcesProvider } from './../client-db-app-resources/client-db-app-resources';
import { ClientDbMyProcessesProvider } from './../client-db-my-processes/client-db-my-processes';
import { ClientDbNotificationsProvider } from './../client-db-notifications/client-db-notifications';
import { ClientDbSynchronizationTasksProvider } from './../client-db-synchronization-tasks/client-db-synchronization-tasks';
import { Injectable } from '@angular/core';
import { Badge } from '@ionic-native/badge';
import { BehaviorSubject } from 'rxjs'
import { ErrorReportingProvider } from '../error-reporting/error-reporting';

/*
  Generated class for the SynchronizationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SynchronizationProvider {

  private synchronizing = false;//flag to indicate sync routine is in progress
  private fullDataLoad = false;//flag to indicate full data load sync routine is in progress
  private authenticationToken = '';//current logged in user's authentication token
  lockProcesses: any = [];//array for indicating a process is locked 1 indicating the process on the array index is locked
  processLockType: any = "";//indicating process lock type update/delete

  stopSync: boolean = false;


  private _logoutSource = new BehaviorSubject(false);//behaviour subject for emitting logout event
  logout$ = this._logoutSource.asObservable();//observable that is refered bu other classes for listening to logout event

  /**
  *Setter for _logoutSource
  */
  setLogout(val) {
    if (val) {
      this.fullDataLoad = false;
      this.stopSync = val;
    }
    this._logoutSource.next(val);
  }

  private _loginRedirectSource = new BehaviorSubject(false);//behaviour subject for emitting login page redirect(without wiping local data) event
  loginRedirectSource$ = this._loginRedirectSource.asObservable();//observable that is refered by other classes for listening to login page redirect event
  /**
  *Setter for _loginRedirectSource
  */
  setLoginRedirect(val) {
    this._loginRedirectSource.next(val);
  }

  private _processLockNav = new BehaviorSubject(false);//behaviour subject for emitting process lock event
  processLockNav$ = this._processLockNav.asObservable();//observable that is refered bu other classes for listening to process lock event
  /**
  *Setter for _processLockNav
  */
  setProcessLockNav(processID) {
    this._processLockNav.next(processID);
  }


  /**
  * class constructor
  */
  constructor(private ClientDBSynchronizationTasks: ClientDbSynchronizationTasksProvider,
    private ClientDBNotifications: ClientDbNotificationsProvider,
    private ClientDBMyProcesses: ClientDbMyProcessesProvider,
    private ClientDBAppResources: ClientDbAppResourcesProvider,
    private ClientDBUserProfiles: ClientDbUserProfilesProvider,
    private ClientDBProcessResources: ClientDbProcessResourcesProvider,
    private ClientDBProcessWorkflows: ClientDbProcessWorkflowsProvider,
    private ClientDBWorkflowSubmissions: ClientDbWorkflowSubmissionsProvider,
    private ClientDBProcessLookupObjects: ClientDbProcessLookupObjectsProvider,
    private ClientDBProcessLookupsData: ClientDbProcessLookupsDataProvider,
    private ClientDBProcessObjects: ClientDbProcessObjectsProvider,
    private clientDbProvider: ClientDbProvider,
    private Socket: SocketProvider,
    public storageServiceProvider: StorageServiceProvider,
    private DBDataDump: DbDataDumpProvider,
    private loading: LoadingProvider,
    private events: Events,
    private badge: Badge,
    private platform: Platform,
    private alertCtrl: AlertController,
    private applicationDataProvider: ApplicationDataProvider,
    private errorReportingProvider: ErrorReportingProvider,
    private globalservice: ProcessDataProvider,
    private helper: HelperProvider) {
      // this.platform.ready().then(() => {
      // this.storageServiceProvider.getLockedProcess().then(result => {
      //   if(result)
      //   {
      //     this.lockProcesses = result;
      //   }
      // });
      // });
      if(window.localStorage['lockedProcesses'])
      {
        this.lockProcesses = JSON.parse(window.localStorage['lockedProcesses'])
        this.processLockType = window.localStorage['lockedProcessType']
      }
      
  }


  /**
  * Server Poller for Updates...
  */
  poller = () => {
    this.startDownSync(true).then(() => {
      this.startUpSync();
    }).catch((e) => {
    });
  };

  /**
  * Initialise and create SQLite Tables in all DB services
  */
  initDB() {
    this.ClientDBSynchronizationTasks.initDB();
    this.ClientDBNotifications.initDB();
    this.ClientDBMyProcesses.initDB();
    this.ClientDBAppResources.initDB();
    this.ClientDBUserProfiles.initDB();
    this.ClientDBProcessResources.initDB();
    this.ClientDBProcessWorkflows.initDB();
    this.ClientDBWorkflowSubmissions.initDB();
    this.ClientDBProcessLookupObjects.initDB();
    this.ClientDBProcessLookupsData.initDB();
    this.ClientDBProcessObjects.initDB();

    window.localStorage['lockedProcesses'] = [];
    this.lockProcesses = [];
  }

  /**
  * Check if a user is logged in
  */
  isLoggedIn() {
    let promise = new Promise((resolve, reject) => {
      this.storageServiceProvider.getUser().then(result => {
        if (result.hasOwnProperty('LoggedOff')) {
          if (result.LoggedOff) {
            resolve(false);
          }
          else {
            this.authenticationToken = result.AuthenticationToken;
            resolve(true);
          }
        }
        else if (result.hasOwnProperty('AuthenticationToken')) {
          //update this.authenticationToken every time to avoid async call to fetch it before each socket call
          this.authenticationToken = result.AuthenticationToken;
          resolve(true);
        }
        else {
          resolve(false);
        }
      }, error => {
        resolve(false);
      });
    });
    return promise;
  }

  /**
  * Setter for fullDataLoad
  */
  setFullDataLoad(value) {
    this.fullDataLoad = value;
  }

  /**
  * Setter for getFullDataLoad
  */
  getFullDataLoad() {
    return this.fullDataLoad;
  }

  /**
  * Start up sync routine to fetch sync tasks
  * from local DB and send to server for execution
  */
  startUpSync() {
    let promise = new Promise((resolve, reject) => {
      this.isLoggedIn().then(response => {
        if (response === true) {//logged in
          //get the UpSync tasks from the register and send to the server...
          this.ClientDBSynchronizationTasks.getAllSynchronizationTasks().then(() => {
            var tasksList = this.ClientDBSynchronizationTasks.returnAllSynchronizationTaskList();
            var tasks = [];
            for (var i = 0; i < tasksList.length; i++) {
              tasksList.item(i).TimeStamp = tasksList.item(i).TimeStamp.toString();
              tasksList.item(i).ProcessID = tasksList.item(i).ProcessID.toString();
              tasksList.item(i).ServerItemID = tasksList.item(i).ServerItemID.toString();
              tasksList.item(i).SynchronizationTasksID = tasksList.item(i).SynchronizationTasksID.toString();

              tasks.push(tasksList.item(i));
            }

            var socketParameters = {
              authenticationToken: this.authenticationToken,
              taskList: JSON.stringify(tasks),
              diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
              operationType: 'SYNC'
            };
            //call the upsync server method
            this.Socket.callWebSocketService('UpSync', socketParameters).then((result: any) => {
              if (typeof result !== 'string' && result.length > 0) {
                for (i = 0; i < result.length; i++) {
                  var task: any = {};
                  for (var j = 0; j < tasks.length; j++) {
                    if (tasks[j].SynchronizationTasksID === result[i]) {
                      task = tasks[j];
                    }
                  }
                  //if upsync task is for saved form..delete the local copy after sync..
                  if (task.TableNames === 'WorkflowSubmissions') {
                    var details = JSON.parse(JSON.parse(task.TaskQuery.replace(/\n/g, "")).value);
                    this.ClientDBWorkflowSubmissions.deleteWorkflowSubmission(parseInt(details.processId), parseInt(details.workflowId), details.formId);
                    this.ClientDBSynchronizationTasks.deleteSynchronizationTask(parseInt(result[i]), i).then((index) => {
                      if (index === result.length - 1) {
                        resolve();
                      }
                    });
                  }
                  //delete the local upsync task
                  else {
                    this.ClientDBSynchronizationTasks.deleteSynchronizationTask(parseInt(result[i]), i).then((index) => {
                      if (index === result.length - 1) {
                        resolve();
                      }
                    });
                  }
                }
              }
            }).catch(error => {
              if (error != 'NoConnection') {//show error reporting dialogue if error is not due to socket send fail
                this.errorReportingProvider.logErrorOnAppServer('Synchronization Error',
                  'Error in starting up sync',
                  this.authenticationToken.toString(),
                  '0',
                  'SynchronizationProvider.startUpSync (socket.UpSync)',
                  error.message ? error.message : '',
                  error.stack ? error.stack : '',
                  new Date().toTimeString(),
                  'Open',
                  'Platform',
                  '');
              }
            });
          })
        }
      })
    });
    return promise;
  }


  /**
  * Fetch list of Tasks to be synced if in case of sequential
  * update, call the poller method after timeout
  */
  startDownSync(sequential) {
    let promise = new Promise((resolve, reject) => {
      this.isLoggedIn().then(response => {
        if (response === true && this.synchronizing === false && this.fullDataLoad === false) {//logged in and not already syncing..
          this.synchronizing = true;

          //fetch list of sync register entries from the server...
          var socketParameters = {
            authenticationToken: this.authenticationToken,
            deviceId: this.applicationDataProvider.uuid,
            diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
            operationType: 'SYNC'
          };
          this.Socket.callWebSocketService('getUserSyncTasksString', socketParameters)
            .then(result => {
              if (result === '')//No sync tasks for the device returned..
              {
                this.synchronizing = false;
                if (sequential === true) {
                  setTimeout(this.poller, 15000);
                }
                resolve();
                this.storageServiceProvider.setLastSynced(new Date());//update the last sync time..
              }
              else if (result.constructor === Array) {
                if (result.length !== 0) {
                  if (result[0].hasOwnProperty('AuthenticationTokenStatus')) {
                    if (result[0].AuthenticationTokenStatus.toString() === 'Device Inactive')//device inactive logout and flush all data...
                    {
                      this.alertCtrl.create({
                        title: '',
                        subTitle: 'Your session has expired, please login again',
                        buttons: [
                          {
                            text: 'OK',
                            role: 'ok',
                            handler: () => {
                            }
                          }
                        ]
                      }).present();
                      this.setLogout(true);//emit the logout event..
                    }
                    else if (result[0].AuthenticationTokenStatus.toString() === 'Token Inactive') {//Device Auto loggout.. set login page as root page
                      this.storageServiceProvider.getUser().then(user => {
                        user.LoggedOff = true;
                        this.storageServiceProvider.setUser(user);
                        this.setLoginRedirect(true);

                        //complete sync routine
                        this.synchronizing = false;
                        if (sequential === true) {
                          setTimeout(this.poller, 15000);
                        }
                        this.storageServiceProvider.setLastSynced(new Date());
                        resolve();
                      });
                    }
                  }
                  else {
                    this.fetchTaskUpdate(result).then(() => {
                      //complete sync routine
                      this.synchronizing = false;
                      if (sequential === true) {
                        setTimeout(this.poller, 15000);
                      }
                      this.storageServiceProvider.setLastSynced(new Date());
                      resolve();
                    }).catch((e) => {
                      this.synchronizing = false;
                      if (sequential === true) {
                        setTimeout(this.poller, 15000);
                      }
                      reject(e);
                    });
                  }
                }
              }
              else {
                //create a custom messge to log as error..
                var e = {
                  message: 'Unknown Server Response in getUserSyncTasksString call at Synchronization.startDownSync response:' + result,
                  stack: ''
                };

                this.errorReportingProvider.logErrorOnAppServer('Synchronization Error',//show error reporting dialogue
                  'Error in starting down sync',
                  this.authenticationToken.toString(),
                  '0',
                  'SynchronizationProvider.startDownSync',
                  e.message ? e.message : '',
                  e.stack ? e.stack : '',
                  new Date().toTimeString(),
                  'Open',
                  'Platform',
                  '');

                this.synchronizing = false;
                if (sequential === true) {
                  setTimeout(this.poller, 15000);
                }
                reject(e);
              }
            }).catch(error => {
              if (error != 'NoConnection') {//show error reporting dialogue if error is not due to socket send fail
                this.errorReportingProvider.logErrorOnAppServer('Synchronization Error',
                  'Error in starting down sync',
                  this.authenticationToken.toString(),
                  '0',
                  'SynchronizationProvider.getUserSyncTasksString (socket.getUserSyncTasksString)',
                  error.message ? error.message : '',
                  error.stack ? error.stack : '',
                  new Date().toTimeString(),
                  'Open',
                  'Platform',
                  '');
              }
              this.synchronizing = false;
              if (sequential === true) {
                setTimeout(this.poller, 15000);
              }
              reject(error);
            });

        }
        else {//not logged in
          this.synchronizing = false;
          if (sequential === true) {
            setTimeout(this.poller, 15000);
          }
          resolve();
        }
      })
    });
    return promise;
  }


  /**
   *Start Full Data Load routine
  */
  startFullDataLoad() {
    let promise = new Promise((resolve, reject) => {
      this.synchronizing = false;

      this.isLoggedIn().then(response => {
        if (response === true) {//logged in
          this.fullDataLoad = true;

          //show loading
          this.loading.presentLoading("Loading your RapidFlow processes ...", 600000);

          var socketParameters = {
            authenticationToken: this.authenticationToken,
            deviceId: this.applicationDataProvider.uuid,
            diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
            operationType: 'SYNC'
          };
          this.Socket.callWebSocketService('fullDataLoad', socketParameters)
            .then((result) => {
              if (result === 'NoConnection') {
                this.fullDataLoad = false;
                resolve();
              }
              else if (result === '')//No sync tasks for the device returned..
              {
                this.fullDataLoad = false;
                resolve();
                this.storageServiceProvider.setLastSynced(new Date());
              }
              else if (result.constructor === Array) {//tasks list returned
                if (result.length !== 0) {
                  this.fetchTaskUpdate(result).then(() => {
                    //hide loading
                    this.loading.hideLoading();

                    this.fullDataLoad = false;
                    this.storageServiceProvider.setLastSynced(new Date());
                    resolve();
                  }).catch((e) => {
                    this.fullDataLoad = false;
                    reject(e);
                  });
                }
              }
              else {
                //hide loading
                this.loading.hideLoading();
                //create a custom messge to log as error..
                var e = {
                  message: 'Unknown Server Response in fullDataLoad call at Synchronization.startFullDataLoad response:' + result,
                  stack: ''
                };
                this.fullDataLoad = false;
                reject(e);
              }
            }).catch(error => {
              this.loading.hideLoading();
              if (error != 'NoConnection') {//show error reporting dialogue if error is not due to socket send fail
                this.errorReportingProvider.logErrorOnAppServer('Synchronization Error',
                  'Error in starting full data load',
                  this.authenticationToken.toString(),
                  '0',
                  'SynchronizationProvider.startFullDataLoad (socket.fullDataLoad)',
                  error.message ? error.message : '',
                  error.stack ? error.stack : '',
                  new Date().toTimeString(),
                  'Open',
                  'Platform',
                  '');
              }
              this.fullDataLoad = false;
              reject(error);
            });
        }
        else if (response === false) {//not logged in
          resolve();
        }
      })
    });
    return promise;
  }


  /**
   *F etch update of a Task and apply
   * the task in sqlite.
  */
  fetchTaskUpdate(tasks) {
    let promise = new Promise((resolve, reject) => {
      //fetch update
      var task = tasks.shift();

      var socketParameters = {
        authenticationToken: this.authenticationToken,
        synchronizationTaskId: task.SynchronizationTaskID.toString(),
        diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
        operationType: 'SYNC'
      };
      this.Socket.callWebSocketService('retrieveSynchronizationTask', socketParameters)
        .then((result) => {
          if (!result.Error) {
            //Apply update in sqlite
            this.applyTaskUpdate(task, result).then(() => {

              if (this.stopSync) {
                tasks = [];
                resolve();
              }

              // if (this.fullDataLoad && task.ObjectKey === 'PlatformSettings') {//Hide loafing halfway through full data load
              //   //hide loading
              //   this.loading.hideLoading();
              // }
              //acknowledge the server task is completed successfully
              socketParameters = {
                authenticationToken: this.authenticationToken,
                synchronizationTaskId: task.SynchronizationTaskID.toString(),
                diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
                operationType: 'SYNC'
              };
              this.Socket.callWebSocketService('completeSyncTask', socketParameters).then(() => {
              }).catch(error => {
                if (error != 'NoConnection') {//show error reporting dialogue if error is not due to socket send fail
                  this.errorReportingProvider.logErrorOnAppServer('Synchronization Error',
                    'Error in completing sync task',
                    this.authenticationToken.toString(),
                    '0',
                    'SynchronizationProvider.fetchTaskUpdate (socket.completeSyncTask)',
                    error.message ? error.message : '',
                    error.stack ? (error.stack + JSON.stringify(task)) : JSON.stringify(task),
                    new Date().toTimeString(),
                    'Open',
                    'Platform',
                    '');
                }
              });

              if (tasks.length === 0) {
                resolve();//all tasks complete resolve the calls
              }
              else {
                return this.fetchTaskUpdate(tasks).then(() => {
                  resolve();
                }).catch((e) => {
                  reject(e);
                });
              }
            }).catch((error) => {
              if (error != 'NoConnection') {//show error reporting dialogue if error is not due to socket send fail
                this.storageServiceProvider.getAllTasks().then((response) => {
                  var match = false;
                  if (response.length > 0) {
                    for (var i = 0; i < response.length; i++) {
                      if (task.SynchronizationTaskID.toString() === response[i]) {
                        match = true;
                      }
                    }
                  }
                  if (!match) {
                    this.storageServiceProvider.addNewTask(task.SynchronizationTaskID.toString());
                    this.errorReportingProvider.logErrorOnAppServer('Synchronization Error',
                      'Error in applying synchronization task update',
                      this.authenticationToken.toString(),
                      '0',
                      'SynchronizationProvider.applyTaskUpdate',
                      error.message ? error.message : '',
                      error.stack ? (error.stack + JSON.stringify(task)) : JSON.stringify(task),
                      new Date().toTimeString(),
                      'Open',
                      'Platform',
                      '');
                  }
                });
              }

              //carry on with rest of the tasks..
              if (tasks.length === 0) {
                reject(error);
              }
              else {
                return this.fetchTaskUpdate(tasks).then(() => {
                  resolve();
                }).catch((e) => {
                  reject(e);
                });
              }
            });
          }
          else {
            if (tasks.length === 0) {
              resolve();
            }
            else {
              return this.fetchTaskUpdate(tasks).then(() => {
                resolve();
              }).catch((e) => {
                reject(e);
              });
            }
          }
        }).catch(error => {
          if (error != 'NoConnection') {//show error reporting dialogue if error is not due to socket send fail
            this.storageServiceProvider.getAllTasks().then((response) => {
              var match = false;
              if (response.length > 0) {
                for (var i = 0; i < response.length; i++) {
                  if (task.SynchronizationTaskID.toString() === response[i]) {
                    match = true;
                  }
                }
              }
              if (!match) {
                this.storageServiceProvider.addNewTask(task.SynchronizationTaskID.toString());
                this.errorReportingProvider.logErrorOnAppServer('Synchronization Error',
                  'Error in loading task updates',
                  this.authenticationToken.toString(),
                  '0',
                  'SynchronizationProvider.fetchTaskUpdate (socket.retrieveSynchronizationTask)',
                  error.message ? error.message : '',
                  error.stack ? (error.stack + JSON.stringify(task)) : JSON.stringify(task),
                  new Date().toTimeString(),
                  'Open',
                  'Platform',
                  '');
              }
            });
          }
          //carry on with rest of the tasks..
          if (tasks.length === 0) {
            reject(error);
          }
          else {
            return this.fetchTaskUpdate(tasks).then(() => {
              resolve();
            }).catch((e) => {
              reject(e);
            });
          }
        });
    });
    return promise;
  }


  /**
  * Apply Task update in sqlite
  * */
  applyTaskUpdate(task, data) {
    let promise = new Promise((resolve, reject) => {
      this.isLoggedIn().then(response => {
        if (response === true) {//logged in
          if (data.message === false) {
            resolve();
          }
          else {
            if (task.ObjectType === 'App') {
              this.applyAppUpdate(task, data).then(() => {
                resolve();
              }).catch((e) => {
                reject(e);
              });
            }
            else if (task.ObjectType === 'Process') {
              this.applyProcessUpdate(task, data).then(() => {
                resolve();
              }).catch((e) => {
                reject(e);
              });
            }
            else if (task.ObjectType === 'Workflow') {
              task;
            }
          }
        }
        else if (response === false) {//not logged in
          resolve();
        }
      })
    });
    return promise;
  }


  /**
  * Apply Application level task update in sqlite
  * */
  applyAppUpdate(task, data) {
    let promise = new Promise((resolve, reject) => {
      try {
        if (task.TableName === 'AppResources') {
          if (task.ObjectKey === 'AppSettings') {
            if (task.Action === 'Update') {
              this.ClientDBAppResources.initDB();
              this.ClientDBAppResources.updateAppResource('AppSettings', JSON.stringify(data)).then(() => {
                resolve();
              });
            }
          }
          if (task.ObjectKey === 'PlatformSettings') {
            if (task.Action === 'Update') {
              this.ClientDBAppResources.initDB();
              this.ClientDBAppResources.updateAppResource('PlatformSettings', JSON.stringify(data)).then(() => {
                resolve();
              });
            }
          }
        }

        else if (task.TableName === 'MyProcesses') {
          if (task.ObjectKey === 'MyProcesses') {
            if (data.length > 0) {
              if (task.ProcessID.toString() === '0') {//Update all process details..
                for (var i = 0; i < data.length; i++) {
                  // if (this.fullDataLoad) {//add processes with pending update status
                  //   data[i].Status = 'Pending Update';
                  // }
                  this.ClientDBMyProcesses.initDB();
                  this.ClientDBMyProcesses.insertElseUpdateProcess(parseInt(data[i].ProcessID), JSON.stringify(data[i])).then(() => {
                    resolve();
                  });
                  if (this.stopSync) {
                    resolve();
                  }
                }
              }
              else {//Update specific process details..
                let found: boolean = false;
                for (i = 0; i < data.length; i++) {
                  if (task.ProcessID.toString() === data[i].ProcessID.toString()) {
                    found = true;
                    this.ClientDBMyProcesses.initDB();
                    this.ClientDBMyProcesses.insertElseUpdateProcess(parseInt(data[i].ProcessID), JSON.stringify(data[i])).then(() => {
                      resolve();
                    });
                    if (this.stopSync) {
                      resolve();
                    }
                  }
                }
                if(!found){
                  resolve();
                }
              }
            }
            else//no subscribed processes
            {
              resolve();
            }
          }
        }

        else if (task.TableName === 'Notifications') {
          // if (this.fullDataLoad) {//Hide loafing halfway through full data load
          //   //hide loading
          //   this.loading.hideLoading();
          // }
          if (task.ObjectKey !== '')//insert, delete or update for a single notification
          {
            if (task.ObjectKey === 'Notification') {
              if (task.Action === 'Insert') {
                //insert the new notification
              }
              if (task.Action === 'Update') {
                this.ClientDBNotifications.readNotification(parseInt(task.ServerItemID), task.ObjectKey).then(() => {
                  resolve();
                });
              }
              if (task.Action === 'Unread') {
                this.ClientDBNotifications.unReadNotification(parseInt(task.ServerItemID), task.ObjectKey).then(() => {
                  resolve();
                });
              }
              if (task.Action === 'Delete') {
                this.ClientDBNotifications.removeNotification(parseInt(task.ServerItemID), task.ObjectKey).then(() => {
                  resolve();
                });
              }
            }
            else if (task.ObjectKey === 'Task') {
              if (task.Action === 'Insert') {
                //insert the new task
              }
              if (task.Action === 'Update') {
                //update the task
              }
              if (task.Action === 'Delete') {
                this.ClientDBNotifications.removeNotification(parseInt(task.ServerItemID), task.ObjectKey).then(() => {
                  resolve();
                });
              }
            }
          }
          else//inserts for multiple values.. full data load..
          {
            this.ClientDBNotifications.initDB();
            if (data.tasks) {
              var tasks = this.helper.parseJSONifString(data.tasks);
              if (tasks.length === 0) {
                resolve();
              }
              else {
                for (i = 0; i < tasks.length; i++) {//tasks
                  tasks[i].NotificationAction = 'Pending';//adding notification action in tasks to cater for retrieving most recent notification message while filtering out read notifications in the query...
                  this.ClientDBNotifications.insertElseUpdateNotification(parseInt(tasks[i].NotificationID), parseInt(tasks[i].ProcessID), JSON.stringify(tasks[i]), 'Task', false, i).then((index) => {
                    if (index === tasks.length - 1)//last update applied..
                    {
                      this.ClientDBNotifications.getAllNotifications();
                      resolve();
                    }
                  });
                  if (this.stopSync) {
                    resolve();
                  }
                }
              }
            }
            if (data.notifications) {
              var notifications = this.helper.parseJSONifString(data.notifications);
              if (notifications.length === 0) {
                resolve();
              }
              else {
                for (i = 0; i < notifications.length; i++) {//notifications
                  this.ClientDBNotifications.insertElseUpdateNotification(parseInt(notifications[i].NotificationID), parseInt(notifications[i].ProcessID), JSON.stringify(notifications[i]), 'Notification', false, i).then((index) => {
                    if (index === notifications.length - 1)//last update applied..
                    {
                      this.ClientDBNotifications.getAllNotifications();
                      resolve();
                    }
                  });
                  if (this.stopSync) {
                    resolve();
                  }
                }
              }
            }
            if (data.counts) {
              var counts = this.helper.parseJSONifString(data.counts);
              var notificationCounts = [];
              for (i = 0; i < counts.length; i++) {
                var processId = counts[i].ProcessID;
                notificationCounts[processId] = counts[i];
              }
              this.storageServiceProvider.setNotificationCounts(notificationCounts);
              resolve();
            }
          }
        }

        else if (task.TableName === 'NotificationCounts') {
          notificationCounts = [];
          for (i = 0; i < data.length; i++) {
            processId = data[i].ProcessID;
            notificationCounts[processId] = data[i];
          }
          this.storageServiceProvider.setNotificationCounts(notificationCounts);
          resolve();
        }

        else if (task.TableName === 'blockprocess') {
          this.lockProcess(task.ProcessID, 'update');
          resolve();
        }
        else if (task.TableName === 'unblockprocess') {
          this.unlockProcess(task.ProcessID);
          resolve();
        }
        //lock the process or show loading if process opened.
        else if (task.TableName === 'lockprocess') {
          if (this.globalservice.processId) {
            if (task.ProcessID) {
              if (task.ProcessID.toString() === this.globalservice.processId.toString()) {
                this.loading.presentLoading("Updating Process ...", 60000);
                resolve();
              }
              else {
                this.lockProcess(task.ProcessID, 'update');
                resolve();
              }
            }
            else {
              this.lockProcess(task.ProcessID, 'update');
              resolve();
            }
          }
          else {
            this.lockProcess(task.ProcessID, 'update');
            resolve();
          }
        }
        else if (task.TableName === 'unlockprocess') {
          if (this.globalservice.processId) {
            if (task.ProcessID) {
              if (task.ProcessID.toString() === this.globalservice.processId.toString()) {
                try {
                  this.loading.hideLoading();
                }
                catch (error) {
                }
                resolve();
              }
              else {
                this.unlockProcess(task.ProcessID);
                resolve();
              }
            }
            else {
              this.unlockProcess(task.ProcessID);
              resolve();
            }
          }
          else {
            this.unlockProcess(task.ProcessID);
            resolve();
          }
        }
        else if (task.TableName === 'flushProcessData') {
          this.flushProcessData(task.ProcessID, true);
          resolve();
        }
        else if (task.TableName === 'flushProcessDataWithoutMyProcesses') {
          this.flushProcessDataWithoutMyProcesses(task.ProcessID);
          resolve();
        }
        else if (task.TableName === 'UserProfiles') {
          if (task.Action === 'Delete') {
            this.ClientDBUserProfiles.initDB();
            this.ClientDBUserProfiles.deleteUserProfile(parseInt(task.ServerItemID)).then(() => {
              resolve();
            });
          }
        }
        else {
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }


  /**
  * Apply Process level task update in sqlite
  * */
  applyProcessUpdate(task, data) {
    let promise = new Promise((resolve, reject) => {

      try {
        if (task.TableName === 'ProcessWorkflows') {
          if (task.Action === 'Insert' || task.Action === 'Update') {
            if (data.length === 0) {
              resolve();
            }
            else {
              for (var i = 0; i < data.length; i++) {
                var processID = data[i].ProcessID;
                var workflowID = data[i].WorkflowID;
                this.ClientDBProcessWorkflows.insertElseUpdateProcessWorkflow(parseInt(processID), parseInt(workflowID), JSON.stringify(data[i]), (i === data.length - 1) ? true : false, i).then((index) => {
                  if (index === data.length - 1)//last update applied..
                  {
                    resolve();
                  }
                });
                if (this.stopSync) {
                  resolve();
                }
              }
            }
          }
        }

        else if (task.TableName === 'ProcessResources') {
          if (task.ObjectKey === 'ProcessSettings') {
            if (task.Action === 'Insert' || task.Action === 'Update') {
              var processSetting = [];
              var processGlobalSettings = JSON.parse(data.processGlobalSettings.replace(/\n/g, ""));
              var processUserSettings = JSON.parse(data.processUserSettings.replace(/\n/g, ""));

              //add processGlobalSettings in processSetting[processId]
              for (i = 0; i < processGlobalSettings.length; i++) {
                var processId = processGlobalSettings[i].ProcessID;
                if (processSetting[processId])//non-empty
                {
                  if (processGlobalSettings[i].hasOwnProperty('Process_Admin')) {
                    if (processSetting[processId].processGlobalSettings) {
                      processSetting[processId].processGlobalSettings.Process_Admin = processGlobalSettings[i].Process_Admin;
                    }
                    else {
                      processSetting[processId].processGlobalSettings = {};
                      processSetting[processId].processGlobalSettings.Process_Admin = processGlobalSettings[i].Process_Admin;
                    }
                  }
                  if (processGlobalSettings[i].hasOwnProperty('Process_Owner')) {
                    if (processSetting[processId].processGlobalSettings) {
                      processSetting[processId].processGlobalSettings.Process_Owner = processGlobalSettings[i].Process_Owner;
                    }
                    else {
                      processSetting[processId].processGlobalSettings = {};
                      processSetting[processId].processGlobalSettings.Process_Owner = processGlobalSettings[i].Process_Owner;
                    }
                  }
                  if (processGlobalSettings[i].hasOwnProperty('Process_Settings')) {
                    if (processSetting[processId].processGlobalSettings) {
                      processSetting[processId].processGlobalSettings.Process_Settings = processGlobalSettings[i].Process_Settings;
                    }
                    else {
                      processSetting[processId].processGlobalSettings = {};
                      processSetting[processId].processGlobalSettings.Process_Settings = processGlobalSettings[i].Process_Settings;
                    }
                  }
                }
                else//empty
                {
                  processSetting[processId] = [];
                  if (processGlobalSettings[i].hasOwnProperty('Process_Admin')) {
                    if (processSetting[processId].processGlobalSettings) {
                      processSetting[processId].processGlobalSettings.Process_Admin = processGlobalSettings[i].Process_Admin;
                    }
                    else {
                      processSetting[processId].processGlobalSettings = {};
                      processSetting[processId].processGlobalSettings.Process_Admin = processGlobalSettings[i].Process_Admin;
                    }
                  }
                  if (processGlobalSettings[i].hasOwnProperty('Process_Owner')) {
                    if (processSetting[processId].processGlobalSettings) {
                      processSetting[processId].processGlobalSettings.Process_Owner = processGlobalSettings[i].Process_Owner;
                    }
                    else {
                      processSetting[processId].processGlobalSettings = {};
                      processSetting[processId].processGlobalSettings.Process_Owner = processGlobalSettings[i].Process_Owner;
                    }
                  }
                  if (processGlobalSettings[i].hasOwnProperty('Process_Settings')) {
                    if (processSetting[processId].processGlobalSettings) {
                      processSetting[processId].processGlobalSettings.Process_Settings = processGlobalSettings[i].Process_Settings;
                    }
                    else {
                      processSetting[processId].processGlobalSettings = {};
                      processSetting[processId].processGlobalSettings.Process_Settings = processGlobalSettings[i].Process_Settings;
                    }
                  }
                }
                processSetting[processId].processId = processId;
                if (this.stopSync) {
                  resolve();
                }
              }
              for (i = 0; i < processUserSettings.length; i++) {
                processId = processUserSettings[i].ProcessID;
                if (processSetting[processId])//processSetting non-empty
                {
                  processSetting[processId].processUserSettings = processUserSettings[i];
                }
                else//processSetting empty
                {
                  processSetting[processId] = [];
                  processSetting[processId].processUserSettings = processUserSettings[i];
                }
                processSetting[processId].processId = processId;
              }

              for (var setting in processSetting) {
                var settingData = {
                  processId: processSetting[setting].processId,
                  processUserSettings: processSetting[setting].processUserSettings,
                  processGlobalSettings: processSetting[setting].processGlobalSettings
                };
                this.ClientDBProcessResources.insertElseUpdateProcessResource(parseInt(settingData.processId), 0, task.ObjectKey, JSON.stringify(settingData));
                if (this.stopSync) {
                  resolve();
                }
              }
              resolve();
            }
          }
        }

        else if (task.TableName === 'ProcessLookups') {
          if (task.Action === 'Insert' || task.Action === 'Update') {
            if (data.hasOwnProperty('processLookupObjects') && data.hasOwnProperty('processLookupsData')) {
              var processLookupObjects = this.helper.parseJSONifString(data.processLookupObjects);
              var processLookupsData = this.helper.parseJSONifString(data.processLookupsData);

              if (processLookupObjects.length === 0) {
                resolve();
              }
              else {
                for (i = 0; i < processLookupObjects.length; i++) {
                  var lookupObject = processLookupObjects[i];
                  this.ClientDBProcessLookupObjects.insertElseUpdateProcessLookupObject(parseInt(lookupObject.LookupID), parseInt(lookupObject.ProcessID), JSON.stringify(lookupObject), i).then((index) => {
                    // if (index === processLookupObjects.length - 1)//last update applied..
                    // {
                    //   resolve();
                    // }
                  });
                  if (this.stopSync) {
                    resolve();
                  }
                }
              }
              if (processLookupsData.length === 0) {
                resolve();
              }
              else {
                if(processLookupsData.length > 1){
                  this.ClientDBProcessLookupsData.bulkInsertElseUpdateProcessLookupData(processLookupsData).then((index1) => {
                    resolve();
                  }).catch(err=>{//fallback
                    for (var j = 0; j < processLookupsData.length; j++) {
                      var lookupData = processLookupsData[j];
                      if (lookupData.AvailableOffline.toLowerCase() === 'true') {
                        this.ClientDBProcessLookupsData.insertElseUpdateProcessLookupData(parseInt(lookupData.LookupDataID), parseInt(lookupData.LookupID), JSON.stringify(lookupData.Value), j).then((index1) => {
                          if (index1 === processLookupsData.length - 1)//last update applied..
                          {
                            resolve();
                          }
                        });
                      }
                      else {
                        if (j === processLookupsData.length - 1)//last update applied..
                        {
                          resolve();
                        }
                      }
                      if (this.stopSync) {
                        resolve();
                      }
                    }
                  })
                }
                else{
                  var lookupData = processLookupsData[0];
                  if (lookupData.AvailableOffline.toLowerCase() === 'true') {
                    this.ClientDBProcessLookupsData.insertElseUpdateProcessLookupData(parseInt(lookupData.LookupDataID), parseInt(lookupData.LookupID), JSON.stringify(lookupData.Value), 0).then((index1) => {
                      resolve();
                    });
                  }
                }
              }
            }
            else {
              resolve();
            }
          }
          else {//delete
            this.ClientDBProcessLookupsData.deleteProcessLookupsDataByLookupDataID(parseInt(task.ServerItemID)).then(() => {
              resolve();
            });
          }
        }

        else if (task.TableName === 'ProcessObjects') {
          if (task.Action === 'Insert' || task.Action === 'Update') {
            if (task.ObjectKey === 'ProcessAddOnData')//save AddOnData in SQLite
            {
              if (data.length === 0) {
                resolve();
              }
              else {
                for (i = 0; i < data.length; i++) {
                  this.ClientDBProcessObjects.insertElseUpdateProcessObject(parseInt(data[i].AddOnId), parseInt(data[i].ProcessID), 'ProcessAddOn', JSON.stringify(data[i]), i).then((index) => {
                    if (index === data.length - 1)//last update applied..
                    {
                      resolve();
                    }
                  });
                  if (this.stopSync) {
                    resolve();
                  }
                }
              }
            }
            else//save ProcessAddOns, ProcessPivots and ProcessReports Definitions only..
            {
              var ProcessPivots = data.ProcessPivots;
              var ProcessReports = data.ProcessReports;

              if (ProcessReports.length > 0 && ProcessPivots.length === 0) {
                for (i = 0; i < ProcessReports.length; i++) {
                  this.ClientDBProcessObjects.insertElseUpdateProcessObject(parseInt(ProcessReports[i].ProcessObjectID), parseInt(ProcessReports[i].ProcessID), 'ProcessReport', JSON.stringify(ProcessReports[i]), i).then((index) => {
                    if (index === ProcessReports.length - 1)//last update applied..
                    {
                      resolve();
                    }
                  });
                  if (this.stopSync) {
                    resolve();
                  }
                }
              }
              else if (ProcessReports.length === 0 && ProcessPivots.length > 0) {
                for (i = 0; i < ProcessPivots.length; i++) {
                  this.ClientDBProcessObjects.insertElseUpdateProcessObject(parseInt(ProcessPivots[i].ProcessObjectID), parseInt(ProcessPivots[i].ProcessID), 'ProcessPivot', JSON.stringify(ProcessPivots[i]), i).then((index) => {
                    if (index === ProcessPivots.length - 1)//last update applied..
                    {
                      resolve();
                    }
                  });
                  if (this.stopSync) {
                    resolve();
                  }
                }
              }
              else if (ProcessReports.length > 0 && ProcessPivots.length > 0) {
                for (i = 0; i < ProcessPivots.length; i++) {
                  this.ClientDBProcessObjects.insertElseUpdateProcessObject(parseInt(ProcessPivots[i].ProcessObjectID), parseInt(ProcessPivots[i].ProcessID), 'ProcessPivot', JSON.stringify(ProcessPivots[i]), i);
                  if (this.stopSync) {
                    resolve();
                  }
                }
                for (i = 0; i < ProcessReports.length; i++) {
                  this.ClientDBProcessObjects.insertElseUpdateProcessObject(parseInt(ProcessReports[i].ProcessObjectID), parseInt(ProcessReports[i].ProcessID), 'ProcessReport', JSON.stringify(ProcessReports[i]), i).then((index) => {
                    if (index === ProcessReports.length - 1)//last update applied..
                    {
                      resolve();
                    }
                  });
                  if (this.stopSync) {
                    resolve();
                  }
                }
              }
              else {
                resolve();
              }
            }
          }
        }
        else {
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }


  /**
  * Apply Workflow level task update in sqlite
  * */
  applyWorkflowUpdate(task, data) {
    let promise = new Promise((resolve, reject) => {
      resolve();
    });
    return promise;
  }


  /**
  * Add an Up-sync task in the sqLite
  * */
  addNewSyncTask(Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey) {
    let promise = new Promise((resolve, reject) => {
      this.ClientDBSynchronizationTasks.initDB();
      this.ClientDBSynchronizationTasks.insertNewSynchronizationTask(Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey).then(() => {
        resolve();
      });
    });
    return promise;
  }


  /**
   * Lock an updating process..
   */
  lockProcess(processId, type) {
    this.setProcessLockNav(processId);
    this.lockProcesses[processId] = 1;
    window.localStorage['lockedProcesses'] = JSON.stringify(this.lockProcesses);
    //this.storageServiceProvider.setLockedProcess(this.lockProcesses);
    window.localStorage['lockedProcessType'] = type;
    this.processLockType = type;
    var arg = {
      processId: processId.toString(),
      lock: 1
    };
    this.events.publish('toggleProcessLock', arg);
  }


  /**
   * UnLock an updating process..
   */
  unlockProcess(processId) {
    this.setProcessLockNav(false);
    this.lockProcesses[processId] = 0;
    window.localStorage['lockedProcesses'] = JSON.stringify(this.lockProcesses);
    //this.storageServiceProvider.setLockedProcess(this.lockProcesses);
    window.localStorage['lockedProcessType'] = '';
    var arg = {
      processId: processId.toString(),
      lock: 1
    };
    this.events.publish('toggleProcessLock', arg);
  }


  /**
   * Flush process Data from localDB..
   */
  flushProcessDataWithoutMyProcesses(processId) {
    this.ClientDBNotifications.deleteAllNotificationsByProcessId(processId).then(() => {
      this.ClientDBProcessObjects.deleteByProcessId(processId).then(() => {
        this.ClientDBProcessWorkflows.deleteByProcessId(processId).then(() => {
          this.ClientDBProcessResources.deleteByProcessId(processId).then(() => {
            this.ClientDBProcessResources.deleteByProcessId(processId).then(() => {
              this.ClientDBWorkflowSubmissions.deleteByProcessId(processId).then(() => {
                this.ClientDBProcessLookupObjects.getAllProcessLookupObjects().then(() => {
                  var lookups = this.ClientDBProcessLookupObjects.getprocessLookupDefinitions(processId);
                  if (typeof lookups !== 'undefined') {
                    for (var i = 0; i < lookups.length; i++) {
                      this.ClientDBProcessLookupObjects.deleteProcessLookupObject(lookups[i].LookupID, processId);
                      this.ClientDBProcessLookupsData.deleteProcessLookupsData(lookups[i].LookupID, 0);
                    }
                  }
                });
                this.storageServiceProvider.removeProcessNotificationCounts(processId);
              });
            });
          });
        });
      });
    });
  }

  /**
   * Flush process Data from localDB..
   */
  flushProcessData(processId, setDeletedFlag) {
    if(setDeletedFlag){
      this.lockProcess(processId, 'delete');
    }
    this.ClientDBNotifications.deleteAllNotificationsByProcessId(processId).then(() => {
      this.ClientDBProcessObjects.deleteByProcessId(processId).then(() => {
        this.ClientDBProcessWorkflows.deleteByProcessId(processId).then(() => {
          this.ClientDBProcessResources.deleteByProcessId(processId).then(() => {
            this.ClientDBProcessResources.deleteByProcessId(processId).then(() => {
              this.ClientDBWorkflowSubmissions.deleteByProcessId(processId).then(() => {
                this.ClientDBMyProcesses.deleteMyProcess(processId).then(() => {
                  this.ClientDBProcessLookupObjects.getAllProcessLookupObjects().then(() => {
                    var lookups = this.ClientDBProcessLookupObjects.getprocessLookupDefinitions(processId);
                    if (typeof lookups !== 'undefined') {
                      for (var i = 0; i < lookups.length; i++) {
                        this.ClientDBProcessLookupObjects.deleteProcessLookupObject(lookups[i].LookupID, processId);
                        this.ClientDBProcessLookupsData.deleteProcessLookupsData(lookups[i].LookupID, 0);
                      }
                    }
                  });
                  this.storageServiceProvider.removeProcessNotificationCounts(processId);
                  this.unlockProcess(processId);
                });
              });
            });
          });
        });
      });
    });
  }


  /**
  * Clear values in the DBServices
  * */
  clearValuesInDBServices() {
    //clear the values in the serrices...
    this.ClientDBSynchronizationTasks.emptyLists();
    this.ClientDBNotifications.emptyLists();
    this.ClientDBMyProcesses.emptyLists();
    this.ClientDBAppResources.emptyLists();
    this.ClientDBUserProfiles.emptyLists();
    this.ClientDBProcessResources.emptyLists();
    this.ClientDBProcessWorkflows.emptyLists();
    this.ClientDBWorkflowSubmissions.emptyLists();
    this.ClientDBProcessLookupObjects.emptyLists();
    this.ClientDBProcessLookupsData.emptyLists();
    this.ClientDBProcessObjects.emptyLists();
  }


  /**
   * Flush local data and restore
   * from server..
   */
  restoreDataFromServer() {
    if (!this.fullDataLoad) {
      this.fullDataLoad = true;
      this.clientDbProvider.deleteDBTables();
      this.storageServiceProvider.removeNotificationCounts();
      this.badge.clear();
      this.clearValuesInDBServices();

      setTimeout(() => {//to cater for successsfull drop of localDB.
        this.initDB();
        /** Dump Data in SQLite */
        this.DBDataDump.dumpData()
          .then(() => {
            //hide loading
            this.loading.hideLoading();
            /** Initiiate synchronization Routine */
            this.startFullDataLoad().then(() => {
            }).catch((error) => {
              if (error != 'NoConnection') {//show error reporting dialogue if error is not due to socket send fail
                this.errorReportingProvider.logErrorOnAppServer('Synchronization Error',
                  'Error in completing sync task',
                  this.authenticationToken.toString(),
                  '0',
                  'SynchronizationProvider.fetchTaskUpdate (socket.completeSyncTask)',
                  error.message ? error.message : '',
                  error.stack ? error.stack : '',
                  new Date().toTimeString(),
                  'Open',
                  'Platform',
                  '');
              }
            });
          });
      }, 3000);
    }
    else {
      alert('RapidFlow Processes loading already in progress');
    }
  }

}
