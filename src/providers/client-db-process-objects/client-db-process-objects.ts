import { BehaviorSubject } from 'rxjs';
import { ProcessDataProvider } from './../process-data/process-data';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbProcessObjectsProvider
Description: Service to perform CRUD operations on process object data table.
Location: ./providers/ClientDbProcessObjectsProvider
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
  Generated class for the ClientDbProcessObjectsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbProcessObjectsProvider {

  private ProcessObjectsList;//List of all process objects
  private processObjects = [];//List of specific process objects in indexes

  //behaviour subject and subscriber object for other classes to subscribe change events
  private _objectsUpdater = new BehaviorSubject(false);
  objectsUpdater$ = this._objectsUpdater.asObservable();
  updateObjects(val) {
    this._objectsUpdater.next(val);
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
      var createTable = 'CREATE TABLE IF NOT EXISTS ProcessObjects' + ' (ProcessObjectID INTEGER PRIMARY KEY NOT NULL, ProcessID INTEGER, ObjectDescription NVARCHAR(32), Value NVARCHAR(32), LastModified DATETIME)';
      this.clientDbProvider.runQuery(createTable, [], (res) => {
        return;
      }, (err) => {
        alert(err);
      });
    });
  }

  /**
   * Insert ProcessObject in ProcessObjects table
   */
  insertProcessObject(ProcessObjectID, ProcessID, ObjectDescription, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT OR IGNORE INTO ProcessObjects (ProcessObjectID, ProcessID, ObjectDescription, Value, LastModified) VALUES (?,?,?,?,?)';
      this.clientDbProvider.runQuery(query, [ProcessObjectID, ProcessID, ObjectDescription, Value, this.helperProvider.convertDateToUTC(new Date())], (response) => {
        resolve(response);
        this.getAllProcessObjects();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update ProcessObject in ProcessObjects table
   */
  updateProcessObject(ProcessObjectID, ProcessID, ObjectDescription, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE ProcessObjects SET Value = ?, LastModified = ? WHERE ProcessObjectID = ? and ProcessID = ? and ObjectDescription = ?';
      this.clientDbProvider.runQuery(query, [Value, this.helperProvider.convertDateToUTC(new Date()), ProcessObjectID, ProcessID, ObjectDescription], (response) => {
        resolve(response);
        this.getAllProcessObjects();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Insert else update ProcessObject in ProcessObjects table
   * if not already exists
   */
  insertElseUpdateProcessObject(ProcessObjectID, ProcessID, ObjectDescription, Value, index) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessObjects where ProcessObjectID = ?';
      this.clientDbProvider.runQuery(query, [ProcessObjectID], (response) => {
        if (response.rows.length === 1) {//update
          this.updateProcessObject(ProcessObjectID, ProcessID, ObjectDescription, Value).then(() => {
            resolve(index);
          });
        }
        else {//insert
          this.insertProcessObject(ProcessObjectID, ProcessID, ObjectDescription, Value).then(() => {
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
   * Get all ProcessObjects from ProcessObjects table
   * and populate the lists
   */
  getAllProcessObjects() {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessObjects where ProcessID = ?';
      this.clientDbProvider.runQuery(query, [this.globalservice.processId], (response) => {
        this.ProcessObjectsList = response.rows;
        this.processObjects = [];
        if (this.ProcessObjectsList.length !== 0) {
          for (var i = 0; i < this.ProcessObjectsList.length; i++) {
            var object = [];
            object.push(JSON.parse(this.ProcessObjectsList.item(i).Value));

            if (this.processObjects[this.ProcessObjectsList.item(i).ProcessID])//list not empty
            {
              this.processObjects[this.ProcessObjectsList.item(i).ProcessID].push(JSON.parse(this.ProcessObjectsList.item(i).Value));
            }
            else//list empty
            {
              this.processObjects[this.ProcessObjectsList.item(i).ProcessID] = object;
            }
          }
          this.updateObjects(true);
        }
        else{
          this.updateObjects(true);
        }
        resolve(response.rows);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Retrieve ProcessObject from the ProcessObjects table
   */
  getProcessObject(ProcessObjectID) {
    var item;
    if (this.ProcessObjectsList) {
      for (var i = 0; i < this.ProcessObjectsList.length; i++) {
        if (this.ProcessObjectsList.item(i).ProcessObjectID === ProcessObjectID) {
          item = this.ProcessObjectsList.item(i);
          break;
        }
      }
    }
    return item;
  }

  /**
   * Return the ProcessObjectsList
   */
  returnAllProcessObjectsList() {
    return this.ProcessObjectsList;
  }

  /**
   * Delete the ProcessObject from the ProcessObjects table
   */
  deleteProcessObject(ProcessObjectID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM ProcessObjects WHERE ProcessObjectID = ?';
      this.clientDbProvider.runQuery(query, [ProcessObjectID], (response) => {
        resolve(response);
        this.getAllProcessObjects();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Delete the ProcessObject from the ProcessObjects table
   * specified by processid
   */
  deleteByProcessId(ProcessID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM ProcessObjects WHERE ProcessID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID], (response) => {
        resolve(response);
        this.getAllProcessObjects();
      }, (error) => {
        resolve(error);
      });
    });
    return promise;
  }

  /**
   * Get the ProcessObject from the ProcessObjects table specified by processId, objectDescription
   */
  getProcessObjects(processId, objectDescription) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessObjects where ProcessID = ? and ObjectDescription = ?';
      var processObjects = [];
      this.clientDbProvider.runQuery(query, [processId, objectDescription], (response) => {
        var addons = response.rows;
        for (var i = 0; i < addons.length; i++) {
          processObjects.push(JSON.parse(addons.item(i).Value));
        }
        resolve(processObjects);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get the ProcessObject from the ProcessObjects table specified by
   * processId, objectDescription, ProcessObjectID
   */
  getSingleProcessObject(processId, objectDescription, ProcessObjectID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessObjects where ProcessID = ? and ObjectDescription = ? and ProcessObjectID = ?';
      var processObjects = [];
      this.clientDbProvider.runQuery(query, [processId, objectDescription, ProcessObjectID], (response) => {
        var addons = response.rows;
        for (var i = 0; i < addons.length; i++) {
          processObjects.push(JSON.parse(addons.item(i).Value));
        }
        resolve(processObjects);
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
    this.ProcessObjectsList = [];
    this.processObjects = [];
  }


}
