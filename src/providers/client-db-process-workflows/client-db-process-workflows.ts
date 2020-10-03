import { ProcessDataProvider } from './../process-data/process-data';
import { BehaviorSubject } from 'rxjs';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbProcessWorkflowsProvider
Description: Service to perform CRUD operations on process workflows table.
Location: ./providers/ClientDbProcessWorkflowsProvider
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
import 'rxjs/add/operator/map';

/*
  Generated class for the ClientDbProcessWorkflowsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbProcessWorkflowsProvider {

  private ProcessWorkflowList;
  private processWorkflows = [];

  //behaviour subject and subscriber object for other classes to subscribe change events
  private _workflowsUpdater = new BehaviorSubject(false);
  workflowsUpdater$ = this._workflowsUpdater.asObservable();
  updateWorkFlows(val) {
    this._workflowsUpdater.next(val);
  }
  

  /**
   * Class constructor
   */
  constructor(private clientDbProvider: ClientDbProvider, 
    private platform: Platform, 
    private helperProvider: HelperProvider,
    private globalservice: ProcessDataProvider) {
  }

  /**
   * Create the table
   */
  initDB() {
    this.platform.ready().then(() => {
      var createTable = 'CREATE TABLE IF NOT EXISTS ProcessWorkflows' + ' (ProcessWorkflowID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, ProcessID INTEGER, WorkflowID INTEGER, Value NVARCHAR(32), LastModified DATETIME)';
      this.clientDbProvider.runQuery(createTable, [], (res) => {
        return;
      }, (err) => {
        alert(err);
      });
    });
  }

  /**
   * Insert ProcessWorkflow in the ProcessWorkflows table
   */
  insertProcessWorkflow(ProcessID, WorkflowID, Value, reload) {
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT INTO ProcessWorkflows (ProcessID, WorkflowID, Value, LastModified) VALUES (?,?,?,?)';
      this.clientDbProvider.runQuery(query, [ProcessID, WorkflowID, Value, this.helperProvider.convertDateToUTC(new Date())], (response) => {
        resolve(response);
        if (reload) {//reload false for batch updates
          this.getAllProcessWorkflows();
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update ProcessWorkflow in the ProcessWorkflows table
   */
  updateProcessWorkflow(ProcessWorkflowID, ProcessID, WorkflowID, Value, reload) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE ProcessWorkflows SET ProcessID = ?, WorkflowID = ?, Value = ?, LastModified = ? WHERE ProcessWorkflowID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID, WorkflowID, Value, this.helperProvider.convertDateToUTC(new Date()), ProcessWorkflowID], (response) => {
        resolve(response);
        if (reload) {//reload false for batch updates
          this.getAllProcessWorkflows();
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Insert else update ProcessWorkflow in the ProcessWorkflows table
   * if not already exists
   */
  insertElseUpdateProcessWorkflow(ProcessID, WorkflowID, Value, reload, index) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessWorkflows where ProcessID = ? and WorkflowID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID, WorkflowID], (response) => {
        if (response.rows.length === 1) {//update
          this.updateProcessWorkflow(response.rows.item(0).ProcessWorkflowID, ProcessID, WorkflowID, Value, reload).then(() => {
            resolve(index);
          });
        }
        else {//insert
          this.insertProcessWorkflow(ProcessID, WorkflowID, Value, reload).then(() => {
            resolve(index);
          });
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get all ProcessWorkflow from the ProcessWorkflows table
   */
  getAllProcessWorkflows() {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessWorkflows where ProcessID = ?';
      this.clientDbProvider.runQuery(query, [this.globalservice.processId], (response) => {
        this.ProcessWorkflowList = response.rows;
        this.processWorkflows = [];
        if (this.ProcessWorkflowList.length !== 0) {
          for (var i = 0; i < this.ProcessWorkflowList.length; i++) {
            //append in the processWorkflows..
            if (this.processWorkflows[this.ProcessWorkflowList.item(i).ProcessID]) {
              this.processWorkflows[this.ProcessWorkflowList.item(i).ProcessID].push(JSON.parse(this.ProcessWorkflowList.item(i).Value));
            }
            else {//first workflow of the process
              var workflow = [];
              workflow.push(JSON.parse(this.ProcessWorkflowList.item(i).Value));
              this.processWorkflows[this.ProcessWorkflowList.item(i).ProcessID] = workflow;
            }
          }
          this.updateWorkFlows(true);
          resolve(response.rows);
        }
        else{
          this.updateWorkFlows(true);
        }
        resolve(response.rows);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get ProcessWorkflow specified by id
   */
  getProcessWorkflow(id) {
    var item;
    if (this.ProcessWorkflowList) {
      for (var i = 0; i < this.ProcessWorkflowList.length; i++) {
        if (this.ProcessWorkflowList.item(i).ProcessWorkflowID === id) {
          item = this.ProcessWorkflowList.item(i);
          break;
        }
      }
    }
    return item;
  }

  /**
   * Get the ProcessWorkflowList
   */
  returnAllProcessWorkflowList() {
    return this.ProcessWorkflowList;
  }

  /**
   * Get the ProcessWorkflowList index specified by processId
   */
  getProcessWorkflows(processId) {
    return this.processWorkflows[processId];
  }

  /**
   * Delete ProcessWorkflow from the ProcessWorkflows table
   * specified by id
   */
  deleteProcessWorkflow(id) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM ProcessWorkflows WHERE ProcessWorkflowID = ?';

      this.clientDbProvider.runQuery(query, [id], (response) => {
        resolve(response);
        this.getAllProcessWorkflows();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Delete ProcessWorkflow from the ProcessWorkflows table
   * specified by processid
   */
  deleteByProcessId(ProcessID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM ProcessWorkflows WHERE ProcessID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID], (response) => {
        resolve(response);
        this.getAllProcessWorkflows();
      }, (error) => {
        resolve(error);
      });
    });
    return promise;
  }

  /**
   * Get ProcessWorkflow from the ProcessWorkflows table
   * specified by ProcessID and WorkflowID
   */
  getWorkFlow(ProcessID, WorkflowID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessWorkflows where ProcessID = ? and WorkflowID = ?';

      this.clientDbProvider.runQuery(query, [ProcessID, WorkflowID], (response) => {
        if (response.rows.length === 1) {//update
          resolve(response.rows.item(0));
        }
        else {//insert
          resolve('');
        }
      }, (error) => {
        resolve(error);
      });
    });
    return promise;
  }

  /**
   * Empty the lists
   */
  emptyLists() {
    this.ProcessWorkflowList = [];
    this.processWorkflows = [];
  }


}
