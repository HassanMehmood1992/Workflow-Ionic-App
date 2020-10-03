/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbSynchronizationTasksProvider
Description: Service to perform CRUD operations on sychronization table. Use to synchronise devices and creating sychronization tasks
Location: ./providers/ClientDbSynchronizationTasksProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { HelperProvider } from './../helper/helper';
import { Platform } from 'ionic-angular/index';
import { ClientDbProvider } from './../client-db/client-db';
import { Injectable } from '@angular/core';

/*
  Generated class for the ClientDbSynchronizationTasksProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbSynchronizationTasksProvider {

  private SynchronizationTaskList;

  /**
   * Class constructor
   */
  constructor(private clientDbProvider: ClientDbProvider, private platform: Platform, private helperProvider: HelperProvider) {
  }

  /**
   * Create the table
   */
  initDB() {
    this.platform.ready().then(() => {
      var createTable = 'CREATE TABLE IF NOT EXISTS SynchronizationTasks' + ' (SynchronizationTasksID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, Target NVARCHAR(32), ObjectType NVARCHAR(32), ProcessID INTEGER, Action NVARCHAR(32), TaskQuery NVARCHAR(32), TableNames NVARCHAR(32), ServerItemID INTEGER, ObjectKey NVARCHAR(32), TimeStamp DATETIME)';
      this.clientDbProvider.runQuery(createTable, [], (res) => {
        return;
      }, (err) => {
        alert(err);
      });
    });
  }

  /**
   * Insert SynchronizationTask in the SynchronizationTasks table
   */
  insertSynchronizationTask(Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey) {
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT INTO SynchronizationTasks (Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey, TimeStamp) VALUES (?,?,?,?,?,?,?,?,?)';
      this.clientDbProvider.runQuery(query, [Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey, this.helperProvider.getUTCTimestamp()], (response) => {
        resolve(response);
        this.getAllSynchronizationTasks();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Insert a new SynchronizationTask in the SynchronizationTasks table
   * deleting previous colliding sync tasks
   */
  insertNewSynchronizationTask(Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey) {
    let promise = new Promise((resolve, reject) => {
      //check for task collision
      var query = 'SELECT * from SynchronizationTasks where ServerItemID = ? and ObjectKey = ? and TableNames = ? and ProcessID = ?';
      this.clientDbProvider.runQuery(query, [ServerItemID, ObjectKey, TableNames, ProcessID], (response) => {
        if (response.rows.length === 0)//add new sync task
        {
          this.insertSynchronizationTask(Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey).then(() => {
            resolve();
          });
        }
        else {//Delete Previous and add new sync task(s)
          for (var i = 0; i < response.rows.length; i++) {
            var DBTaskQuery = JSON.parse(response.rows.item(i).TaskQuery);

            //cater for collision of UserSettings Both App and Process..
            if (DBTaskQuery.methodName === 'updateUserSettings') {
              if (DBTaskQuery.hasOwnProperty('settingName') && DBTaskQuery.hasOwnProperty('processId')) {
                if (DBTaskQuery.settingName === JSON.parse(TaskQuery).settingName && DBTaskQuery.processId === JSON.parse(TaskQuery).processId) {
                  this.deleteSynchronizationTask(response.rows.item(i).SynchronizationTasksID, 0);
                }
              }
            }
            else if (DBTaskQuery.methodName === 'updateNotification') {
              if (DBTaskQuery.notificationId === JSON.parse(TaskQuery).notificationId && DBTaskQuery.action === JSON.parse(TaskQuery).action) {
                this.deleteSynchronizationTask(response.rows.item(i).SynchronizationTasksID, 0);
              }
            }
            else if (DBTaskQuery.methodName === 'saveFormData') {
              var value = this.helperProvider.parseJSONifString(DBTaskQuery.value);
              if (this.helperProvider.parseJSONifString(value).processId === this.helperProvider.parseJSONifString(this.helperProvider.parseJSONifString(TaskQuery).value).processId && this.helperProvider.parseJSONifString(value).workflowId === this.helperProvider.parseJSONifString(this.helperProvider.parseJSONifString(TaskQuery).value).workflowId) {
                this.deleteSynchronizationTask(response.rows.item(i).SynchronizationTasksID, 0);
              }
            }
          }
          this.insertSynchronizationTask(Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey).then(() => {
            resolve();
          });
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update SynchronizationTask in the SynchronizationTasks table
   */
  updateSynchronizationTask(SynchronizationTasksID, Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE SynchronizationTasks SET Target = ?, ObjectType = ?, ProcessID = ?, Action = ?, TaskQuery = ?, TableNames = ?, ServerItemID = ?, ObjectKey = ?, TimeStamp = ? WHERE SynchronizationTasksID = ?';
      this.clientDbProvider.runQuery(query, [Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey, this.helperProvider.getUTCTimestamp(), SynchronizationTasksID], (response) => {
        resolve(response);
        this.getAllSynchronizationTasks();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get all SynchronizationTask from the SynchronizationTasks table
   * and populate the lists
   */
  getAllSynchronizationTasks() {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from SynchronizationTasks';
      this.clientDbProvider.runQuery(query, [], (response) => {
        this.SynchronizationTaskList = response.rows;
        resolve(response.rows);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get SynchronizationTask specified by id
   */
  getSynchronizationTask(id) {
    var item;
    if (this.SynchronizationTaskList) {
      for (var i = 0; i < this.SynchronizationTaskList.length; i++) {
        if (this.SynchronizationTaskList.item(i).SynchronizationTasksID === id) {
          item = this.SynchronizationTaskList.item(i);
          break;
        }
      }
    }
    return item;
  }

  /**
   * Getter for SynchronizationTaskList
   */
  returnAllSynchronizationTaskList() {
    return this.SynchronizationTaskList;
  }

  /**
   * Delete SynchronizationTask specified by id and index
   */
  deleteSynchronizationTask(id, index) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM SynchronizationTasks WHERE SynchronizationTasksID = ?';
      this.clientDbProvider.runQuery(query, [id], (response) => {
        resolve(index);
        this.getAllSynchronizationTasks();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Delete SynchronizationTask specified by ProcessID and WorkFlowID
   */
  deleteSynchronizationTaskByProcessIDAndWorkFlowID(ProcessID, WorkFlowID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from SynchronizationTasks where ProcessID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID], (response) => {
        if (response.rows.length !== 0)//add new sync task
        {
          for (var i = 0; i < response.rows.length; i++) {
            var DBTaskQuery = JSON.parse(response.rows.item(i).TaskQuery);
            if (DBTaskQuery.methodName === 'saveFormData') {
              var value = this.helperProvider.parseJSONifString(DBTaskQuery.value);
              if (this.helperProvider.parseJSONifString(value).processId === ProcessID && this.helperProvider.parseJSONifString(value).workflowId === WorkFlowID) {
                this.deleteSynchronizationTask(response.rows.item(i).SynchronizationTasksID, 0).then(()=>{
                  resolve();
                })
              }
            }
          }
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Empty the lists
   */
  emptyLists() {
    this.SynchronizationTaskList = [];
  }

}
