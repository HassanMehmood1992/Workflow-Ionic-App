
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbProcessLookupObjectsProvider
Description: Service to perform CRUD operations on process lookup objects table.
Location: ./providers/ClientDbProcessLookupObjectsProvider
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
import { ProcessDataProvider } from './../process-data/process-data';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs';

/*
  Generated class for the ClientDbProcessLookupObjectsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbProcessLookupObjectsProvider {

  private ProcessLookupObjectList;//process lookup objects
  private processLookupDefinitions = [];//process lookup definitions

  //behaviour subject and subscriber object for other classes to subscribe change events
  private _lookupsUpdater = new BehaviorSubject(false);
  lookupsUpdater$ = this._lookupsUpdater.asObservable();
  updateLookups(val) {
    this._lookupsUpdater.next(val);
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
      var createTable = 'CREATE TABLE IF NOT EXISTS ProcessLookupObjects' + ' (LookupID INTEGER UNIQUE, ProcessID INTEGER, Value NVARCHAR(32), LastModified DATETIME)';
      this.clientDbProvider.runQuery(createTable, [], (res) => {
        return;
      }, (err) => {
        alert(err)
      });
    });
  }

  /**
   * Insert ProcessLookupObject in the ProcessLookupObjects table
   */
  insertProcessLookupObject(LookupID, ProcessID, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT OR IGNORE INTO ProcessLookupObjects (LookupID, ProcessID, Value, LastModified) VALUES (?,?,?,?)';
      this.clientDbProvider.runQuery(query, [LookupID, ProcessID, Value, this.helperProvider.convertDateToUTC(new Date())], (response) => {
        resolve(response);
        this.getAllProcessLookupObjects();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update ProcessLookupObject in the ProcessLookupObjects table
   */
  updateProcessLookupObject(LookupID, ProcessID, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE ProcessLookupObjects SET Value = ?, LastModified = ? WHERE LookupID = ? and ProcessID = ?';
      this.clientDbProvider.runQuery(query, [Value, this.helperProvider.convertDateToUTC(new Date()), LookupID, ProcessID], (response) => {
        resolve(response);
        this.getAllProcessLookupObjects();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Insert else Update ProcessLookupObject in the ProcessLookupObjects table
   */
  insertElseUpdateProcessLookupObject(LookupID, ProcessID, Value, index) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessLookupObjects where LookupID = ?';
      this.clientDbProvider.runQuery(query, [LookupID], (response) => {
        if (response.rows.length === 1) {//update
          this.updateProcessLookupObject(LookupID, ProcessID, Value).then(() => {
            resolve(index);
          });
        }
        else {//insert
          this.insertProcessLookupObject(LookupID, ProcessID, Value).then(() => {
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
   * Get all ProcessLookupObject in the ProcessLookupObjects table
   * and populate class variables
   */
  getAllProcessLookupObjects() {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessLookupObjects where ProcessID = ?';
      this.clientDbProvider.runQuery(query, [this.globalservice.processId], (response) => {
        this.ProcessLookupObjectList = response.rows;
        this.processLookupDefinitions = [];
        if (this.ProcessLookupObjectList.length !== 0) {
          for (var i = 0; i < this.ProcessLookupObjectList.length; i++) {
            if (this.processLookupDefinitions[this.ProcessLookupObjectList.item(i).ProcessID]) {
              this.processLookupDefinitions[this.ProcessLookupObjectList.item(i).ProcessID].push(JSON.parse(this.ProcessLookupObjectList.item(i).Value));
            }
            else {
              var lookup = [];
              lookup.push(JSON.parse(this.ProcessLookupObjectList.item(i).Value));
              this.processLookupDefinitions[this.ProcessLookupObjectList.item(i).ProcessID] = lookup;
            }
          }
          this.updateLookups(true);
        }
        else{
          this.updateLookups(true);
        }
        resolve(response.rows);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get ProcessLookupObject from the ProcessLookupObjects table
   */
  getProcessLookupObject(LookupID, ProcessID) {
    var item;
    if (this.ProcessLookupObjectList) {
      for (var i = 0; i < this.ProcessLookupObjectList.length; i++) {
        if (this.ProcessLookupObjectList.item(i).LookupID === LookupID && this.ProcessLookupObjectList.item(i).ProcessID === ProcessID) {
          item = this.ProcessLookupObjectList.item(i);
          break;
        }
      }
    }
    return item;
  }

  /**
   * Getter for ProcessLookupObjectList
   */
  returnAllProcessLookupObjectList() {
    return this.ProcessLookupObjectList;
  }

  /**
   * Delete ProcessLookupObject from the ProcessLookupObjects table
   */
  deleteProcessLookupObject(LookupID, ProcessID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM ProcessLookupObjects WHERE LookupID = ? and ProcessID = ?';

      this.clientDbProvider.runQuery(query, [LookupID, ProcessID], (response) => {
        resolve(response);
        this.getAllProcessLookupObjects();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Getter for processLookupDefinitions index specified by proessID
   */
  getprocessLookupDefinitions(processId) {
    return  this.processLookupDefinitions[processId];
  }

  /**
   * Empty the lists
   */
  emptyLists() {
    this.ProcessLookupObjectList = [];
    this.processLookupDefinitions = [];
  }


}
