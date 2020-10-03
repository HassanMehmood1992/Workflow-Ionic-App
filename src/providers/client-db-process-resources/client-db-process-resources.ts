import { BehaviorSubject } from 'rxjs';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbProcessResourcesProvider
Description: Service to perform CRUD operations on process resource table.
Location: ./providers/ClientDbProcessResourcesProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/



import { HelperProvider } from './../helper/helper';
import { Platform } from 'ionic-angular/index';
import { ClientDbProvider } from './../client-db/client-db';
import { Injectable } from '@angular/core';

/*
  Generated class for the ClientDbProcessResourcesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbProcessResourcesProvider {

  private ProcessResourceList;
  private processSettingsList = [];

  //behaviour subject and subscriber object for other classes to subscribe change events
  private _processesUpdater = new BehaviorSubject(false);
  processesUpdater$ = this._processesUpdater.asObservable();
  updateProcesses(val) {
    this._processesUpdater.next(val);
  }

  /**
   * Class constructor
   */
  constructor(private clientDbProvider: ClientDbProvider, private platform: Platform, private helperProvider: HelperProvider) {
    console.log('Hello ClientDbProcessResourcesProvider Provider');
  }


  /**
   * Initialize the Table
   */
  initDB() {
    this.platform.ready().then(() => {
      var createTable = 'CREATE TABLE IF NOT EXISTS ProcessResources' + ' (ProcessResourcesID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, ProcessID INTEGER, Identifier INTEGER, ObjectKey NVARCHAR(32), Value NVARCHAR(32), LastModified DATETIME)';
      this.clientDbProvider.runQuery(createTable, [], (res) => {
        return;
      }, (err) => {
        alert(err);
      });
    });
  }


  /**
   * Insert ProcessResource in the ProcessResources Table
   */
  insertProcessResource(ProcessID, Identifier, ObjectKey, Value) {
    console.log('adding new ProcessResource');
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT INTO ProcessResources (ProcessID, Identifier, ObjectKey, Value, LastModified) VALUES (?,?,?,?,?)';
      this.clientDbProvider.runQuery(query, [ProcessID, Identifier, ObjectKey, Value, this.helperProvider.convertDateToUTC(new Date())], (response) => {
        console.log(response);
        resolve(response);
        this.getAllProcessResources(this);
      }, (error) => {
        console.log(error);
        reject(error);
      });
    });
    return promise;
  }


  /**
   * Update ProcessResource in the ProcessResources Table
   */
  updateProcessResource(ProcessID, ObjectKey, Value, Identifier) {
    console.log('updating ProcessResources');
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE ProcessResources SET Value = ?, Identifier = ?, LastModified = ? WHERE ProcessID = ? and ObjectKey = ?';
      this.clientDbProvider.runQuery(query, [Value, Identifier, this.helperProvider.convertDateToUTC(new Date()), ProcessID, ObjectKey], (response) => {
        console.log(response);
        resolve(response);
        this.getAllProcessResources(this);
      }, (error) => {
        console.log(error);
        reject(error);
      });
    });
    return promise;
  }


  /**
   * Insert else Update ProcessResource in the ProcessResources Table
   * if not already exists
   */
  insertElseUpdateProcessResource(ProcessID, Identifier, ObjectKey, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessResources where ProcessID = ? and ObjectKey = ?';
      this.clientDbProvider.runQuery(query, [ProcessID, ObjectKey], (response) => {
        if (response.rows.length === 1) {//update
          this.updateProcessResource(ProcessID, ObjectKey, Value, Identifier).then(() => {
            resolve();
          });
        }
        else {//insert
          this.insertProcessResource(ProcessID, Identifier, ObjectKey, Value).then(() => {
            resolve();
          });
        }
      }, (error) => {
        console.log(error);
        reject(error);
      });
    });
    return promise;
  }


  /**
   * Get all ProcessResources to from Table and populate 
   * the class variables
   */
  getAllProcessResources(scope) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessResources';
      this.clientDbProvider.runQuery(query, [], (response) => {
        this.ProcessResourceList = response.rows;
        for (var i = 0; i < this.ProcessResourceList.length; i++) {
          if (this.ProcessResourceList.item(i).ObjectKey === 'ProcessSettings')//store the processSettings in the processSettingsList for all processes...
          {
            this.processSettingsList[this.ProcessResourceList.item(i).ProcessID] = JSON.parse(this.ProcessResourceList.item(i).Value);
            this.updateProcesses(true);
          }
        }
        resolve(scope);
      }, (error) => {
        console.log(error);
        reject(error);
      });
    });
    return promise;
  }


  /**
   * Get ProcessResources specified by id
   */
  getProcessResource(id) {
    var item;
    if (this.ProcessResourceList) {
      for (var i = 0; i < this.ProcessResourceList.length; i++) {
        if (this.ProcessResourceList.item(i).ProcessResourcesID === id) {
          item = this.ProcessResourceList.item(i);
          break;
        }
      }
    }
    return item;
  }


  /**
   * Getter for ProcessResourceList
   */
  returnAllProcessResourceList() {
    return this.ProcessResourceList;
  }
  /**
   * Getter for processSettingsList
   */
  getProcessSetting(id) {
    return this.processSettingsList[id];
  }
  /**
   * Getter for processSettingsList
   */
  getAllProcessesSettings() {
    return this.processSettingsList;
  }


  /**
   * Delete ProcessResource from the ProcessResources Table by id
   */
  deleteProcessResource(id) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM ProcessResources WHERE ProcessResourcesID = ?';
      this.clientDbProvider.runQuery(query, [id], (response) => {
        console.log(response);
        resolve(response);
        this.getAllProcessResources(this);
      }, (error) => {
        console.log(error);
        reject(error);
      });
    });
    return promise;
  }


  /**
   * Update ProcessResource in the ProcessResources Table by ProcessID
   */
  deleteByProcessId(ProcessID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM ProcessResources WHERE ProcessID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID], (response) => {
        console.log(response);
        resolve(response);
        this.getAllProcessResources(this);
      }, (error) => {
        console.log(error);
        resolve(error);
      });
    });
    return promise;
  }


  /**
   * Empty class variables
   */
  emptyLists() {
    this.ProcessResourceList = [];
    this.processSettingsList = [];
  }

}
