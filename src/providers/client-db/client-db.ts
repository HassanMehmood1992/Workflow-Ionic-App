/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbProvider
Description: Main service which executes all the other services sql operations.
Location: ./providers/ClientDbProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/


/**
* Importing neccassary libraries and modules for this class 
*/
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';

/*
  Generated class for the ClientDbProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbProvider {
  
  private db: SQLiteObject;//refernce of sqlite

  /**
   * Create the table
   */
  constructor(private sqlite: SQLite, private platform: Platform) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'rfng.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          this.db = db;
        })
        .catch(e => alert('Could not initilize the local database' + e));
    });
  }

  /**
   * Run the query with parameters
   */
  runQuery(query, dataArray, successCb, errorCb) {
    this.platform.ready().then(() => {
      this.db.executeSql(query, dataArray).then((res) => {
        successCb(res);
      }, (err) => {
        errorCb(err);
      });
    });
  }

  /**
   * Drop all db tables
   */
  deleteDBTables(): boolean {
    //drop the DBTables...
    var query = ('Drop table AppResources');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    query = ('Drop table MyProcesses');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    query = ('Drop table Notifications');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    query = ('Drop table ProcessResources');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    query = ('Drop table SynchronizationTasks');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    query = ('Drop table UserProfiles');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    query = ('Drop table ProcessWorkflows');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    query = ('Drop table WorkflowSubmissions');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    query = ('Drop table ProcessLookupObjects');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    query = ('Drop table ProcessLookupsData');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    query = ('Drop table ProcessObjects');
    this.runQuery(query, [], (response) => {
      response;
    }, (error) => {
      error;
    });
    return true;
  }

}
