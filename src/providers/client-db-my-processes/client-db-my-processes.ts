import { BehaviorSubject } from 'rxjs';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbMyProcessesProvider
Description: Service to perform CRUD operations on My Processes(favorite screen) table
Location: ./providers/ClientDbMyProcessesProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { Platform } from 'ionic-angular/index';
import { ClientDbProvider } from './../client-db/client-db';
import { Injectable } from '@angular/core';

import * as moment from 'moment';


/*
  Generated class for the ClientDbMyProcessesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbMyProcessesProvider {

  private MyProcessList;
  private myProcessesData = [];
  //private lastModified = moment('7/5/1999 8:04:15 AM');
  private lastModified = [];

  //behaviour subject and subscriber object for other classes to subscribe change events
  private _processesUpdater = new BehaviorSubject(false);
  processesUpdater$ = this._processesUpdater.asObservable();
  updateProcesses(val) {
    this._processesUpdater.next(val);
  }


  /**
   * Class constructor
   */
  constructor(private clientDbProvider: ClientDbProvider, private platform: Platform) {
  }

  /**
   * Initialize the Table
   */
  initDB() {
    this.platform.ready().then(() => {
      var createTable = 'CREATE TABLE IF NOT EXISTS MyProcesses' + ' (ProcessID INTEGER PRIMARY KEY NOT NULL, ProcessData NVARCHAR(32), RecentNotification NVARCHAR(32), LastModified DATETIME)';

      this.clientDbProvider.runQuery(createTable, [], (res) => {
        return;
      }, (err) => {
        alert(err);
      });
    });
  }

  /**
   * Insert MyProcesses in the MyProcesses table
   */
  insertMyProcess(ProcessID, ProcessData) {
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT INTO MyProcesses (ProcessID, ProcessData, RecentNotification, LastModified) VALUES (?,?,?,?)';

      this.lastModified[ProcessID] = moment(JSON.parse(ProcessData).MyProcessLastModifiedProcessOffset);
      this.clientDbProvider.runQuery(query, [ProcessID, ProcessData, JSON.parse(ProcessData).RecentNotification, this.lastModified[ProcessID]], (response) => {
        resolve(response);
        this.getAllMyProcesses();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update MyProcesses in the MyProcesses table
   */
  updateMyProcess(ProcessID, ProcessData) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE MyProcesses SET ProcessData = ?, RecentNotification = ?, LastModified = ? WHERE ProcessID = ?';
      this.clientDbProvider.runQuery(query, [ProcessData, JSON.parse(ProcessData).RecentNotification, moment(JSON.parse(ProcessData).MyProcessLastModifiedProcessOffset), ProcessID], (response) => {
        resolve(response);
        this.getAllMyProcesses();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update MyProcesses last modified date
   */
  updateLastModified(ProcessID, date, recentNotification) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE MyProcesses SET LastModified = ?, RecentNotification = ? WHERE ProcessID = ?';
      if(!this.lastModified[ProcessID]){
        this.lastModified[ProcessID] = moment('7/5/1999 8:04:15 AM');
      }
      if (this.lastModified[ProcessID] < date) {
        this.lastModified[ProcessID] = date;
        this.clientDbProvider.runQuery(query, [date, recentNotification, ProcessID], (response) => {
          resolve(response);
          this.getAllMyProcesses();
        }, (error) => {
          reject(error);
        });
      }
      else {
        resolve();
      }
    });
    return promise;
  }

  /**
   * Update recent notification message in MyProcesses
   */
  updateRecentNotificationMessage(ProcessID, recentNotification) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE MyProcesses SET RecentNotification = ? WHERE ProcessID = ?';
      this.clientDbProvider.runQuery(query, [recentNotification, ProcessID], (response) => {
        resolve(response);
        this.getAllMyProcesses();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Insert else update MyProcesses in the MyProcesses table
   */
  insertElseUpdateProcess(processID, processData) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from MyProcesses where ProcessID = ?';
      this.clientDbProvider.runQuery(query, [processID], (response) => {
        if (response.rows.length === 1) {//update
          this.updateMyProcess(processID, processData).then(() => {
            resolve();
          });
        }
        else {//insert
          this.insertMyProcess(processID, processData).then(() => {
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
   * Get all Processes from MyProcesses table and
   * populate class variables
   */
  getAllMyProcesses() {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from MyProcesses';

      this.clientDbProvider.runQuery(query, [], (response) => {
        this.MyProcessList = response.rows;
        this.myProcessesData = [];
        if (this.MyProcessList.length !== 0) {
          for (var i = 0; i < this.MyProcessList.length; i++) {
            this.myProcessesData.push(JSON.parse(this.MyProcessList.item(i).ProcessData));
            this.myProcessesData[i].LastModified = moment(this.MyProcessList.item(i).LastModified);
            if(this.MyProcessList.item(i).RecentNotification != null){
              this.myProcessesData[i].RecentNotification = this.MyProcessList.item(i).RecentNotification;
            }
            else{
              this.myProcessesData[i].RecentNotification = '';
            }
          }
          this.updateProcesses(true);
        }
        else{
          this.updateProcesses(true);
        }
        resolve(response.rows);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get Process from MyProcessList by id
   */
  getMyProcess(id) {
    var item;
    if (this.MyProcessList) {
      for (var i = 0; i < this.MyProcessList.length; i++) {
        if (this.MyProcessList.item(i).ProcessID === id) {
          item = this.MyProcessList.item(i);
          break;
        }
      }
    }
    return item;
  }

  /**
   * Getter for MyProcessList
   */
  returnAllMyProcessList() {
    return this.MyProcessList;
  }

  /**
   * Getter for myProcessesData
   */
  returnAllMyProcessData() {
    return this.myProcessesData;
  }

  /**
   * Delete MyProcesses specified by ProcessID
   */
  deleteMyProcess(id) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM MyProcesses WHERE ProcessID = ?';
      this.clientDbProvider.runQuery(query, [id], (response) => {
        resolve(response);
        this.getAllMyProcesses();
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
    this.MyProcessList = [];
    this.myProcessesData = [];
    //this.lastModified = moment('7/5/1999 8:04:15 AM');
    this.lastModified = [];
  }

}
