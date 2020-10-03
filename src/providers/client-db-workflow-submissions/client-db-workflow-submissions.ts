/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbWorkflowSubmissionsProvider
Description: Service to perform CRUD operations on workflow submissions table.
Location: ./providers/ClientDbWorkflowSubmissionsProvider
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
  Generated class for the ClientDbWorkflowSubmissionsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbWorkflowSubmissionsProvider {

  private WorkflowSubmissionList;// list of workflow submissions

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
      var createTable = 'CREATE TABLE IF NOT EXISTS WorkflowSubmissions' + ' (WorkflowSubmissionID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, ProcessID INTEGER, WorkflowID INTEGER, FormID NVARCHAR(32), Value NVARCHAR(32), LastModified DATETIME)';
      this.clientDbProvider.runQuery(createTable, [], (res) => {
        return;
      }, (err) => {
        alert(err);
      });
    });
  }

  /**
   * Insert the workflow submission in table
   */
  insertWorkflowSubmission(ProcessID, WorkflowID, FormID, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT INTO WorkflowSubmissions (ProcessID, WorkflowID, FormID, Value, LastModified) VALUES (?,?,?,?,?)';
      this.clientDbProvider.runQuery(query, [ProcessID, WorkflowID, FormID, Value, this.helperProvider.convertDateToUTC(new Date())], (response) => {
        resolve(response);
        this.getAllWorkflowSubmissions();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update the workflow submission in table
   */
  updateWorkflowSubmission(WorkflowSubmissionID, ProcessID, WorkflowID, FormID, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE WorkflowSubmissions SET ProcessID = ?, WorkflowID = ?, FormID = ?, Value = ?, LastModified = ? WHERE WorkflowSubmissionID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID, WorkflowID, Value, this.helperProvider.convertDateToUTC(new Date()), WorkflowSubmissionID], (response) => {
        resolve(response);
        this.getAllWorkflowSubmissions();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get all workflow submissions in table and populate class variable
   */
  getAllWorkflowSubmissions() {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from WorkflowSubmissions';
      this.clientDbProvider.runQuery(query, [], (response) => {
        this.WorkflowSubmissionList = response.rows;
        resolve(response.rows);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update the workflow submission specified by ProcessID, WorkflowID and FormID
   */
  getWorkflowSubmission(ProcessID, WorkflowID, FormID) {
    var item;
    if (this.WorkflowSubmissionList) {
      for (var i = 0; i < this.WorkflowSubmissionList.length; i++) {
        if (this.WorkflowSubmissionList.item(i).ProcessID === ProcessID && this.WorkflowSubmissionList.item(i).WorkflowID === WorkflowID && this.WorkflowSubmissionList.item(i).FormID === FormID) {
          item = this.WorkflowSubmissionList.item(i);
          break;
        }
      }
    }
    return item;
  }

  /**
   * Getter for class variable WorkflowSubmissionList
   */
  returnAllWorkflowSubmissionList() {
    return this.WorkflowSubmissionList;
  }

  /**
   * Delete the workflow submission specified by ProcessID, WorkflowID and FormID
   */
  deleteWorkflowSubmission(ProcessID, WorkflowID, FormID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM WorkflowSubmissions WHERE ProcessID = ? and WorkflowID = ? and FormID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID, WorkflowID, FormID], (response) => {
        resolve(response);
        this.getAllWorkflowSubmissions();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Delete the workflow submission specified by ProcessID
   */
  deleteByProcessId(ProcessID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM WorkflowSubmissions WHERE ProcessID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID], (response) => {
        resolve(response);
        this.getAllWorkflowSubmissions();
      }, (error) => {
        resolve(error);
      });
    });
    return promise;
  }

  /**
   * Delete the workflow submission specified by ProcessID and WorkflowID
   */
  deleteWorkFlowsByProcessAndWorkFlow(ProcessID, WorkflowID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM WorkflowSubmissions WHERE ProcessID = ? and WorkflowID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID, WorkflowID], (response) => {
        resolve(response);
        this.getAllWorkflowSubmissions();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Insert or update the workflow submission if already exists
   */
  insertElseUpdateWorkflowSubmission(ProcessID, WorkflowID, FormID, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from WorkflowSubmissions where ProcessID = ? and WorkflowID = ? and FormID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID, WorkflowID, FormID], (response) => {
        if (response.rows.length === 1) {//update
          this.updateWorkflowSubmission(response.rows.item(0).WorkflowSubmissionID, ProcessID, WorkflowID, FormID, Value).then(() => {
            resolve();
          });
        }
        else {//insert
          this.insertWorkflowSubmission(ProcessID, WorkflowID, FormID, Value).then(() => {
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
   * Empty the list in WorkflowSubmissionList
   */
  emptyLists() {
    this.WorkflowSubmissionList = [];
  }


}
