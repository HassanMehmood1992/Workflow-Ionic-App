/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbProcessLookupsDataProvider
Description: Service to perform CRUD operations on process lookup data table.
Location: ./providers/ClientDbProcessLookupsDataProvider
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
  Generated class for the ClientDbProcessLookupsDataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbProcessLookupsDataProvider {

  private ProcessLookupsDataList;

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
      var createTable = 'CREATE TABLE IF NOT EXISTS ProcessLookupsData' + ' (LookupDataID INTEGER UNIQUE, LookupID INTEGER, Value NVARCHAR(32), LastModified DATETIME)';
      this.clientDbProvider.runQuery(createTable, [], (res) => {
        return;
      }, (err) => {
        alert(err);
      });
    });
  }

  /**
   * Insert ProcessLookupsData in the ProcessLookupsData Table
   */
  insertProcessLookupsData(LookupDataID, LookupID, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT INTO ProcessLookupsData (LookupDataID, LookupID, Value, LastModified) VALUES (?,?,?,?)';
      this.clientDbProvider.runQuery(query, [LookupDataID, LookupID, Value, this.helperProvider.convertDateToUTC(new Date())], (response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update ProcessLookupsData in the ProcessLookupsData Table
   */
  updateProcessLookupsData(LookupDataID, LookupID, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE ProcessLookupsData SET LookupID = ?, Value = ?, LastModified = ? WHERE LookupDataID = ?';
      this.clientDbProvider.runQuery(query, [LookupID, Value, this.helperProvider.convertDateToUTC(new Date()), LookupDataID], (response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Insert else Updare ProcessLookupsData in the ProcessLookupsData Table
   * if not already exists
   */
  insertElseUpdateProcessLookupData(LookupDataID, LookupID, Value, index) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessLookupsData where LookupDataID = ?';
      this.clientDbProvider.runQuery(query, [LookupDataID], (response) => {
        if (response.rows.length === 1) {//update
          this.updateProcessLookupsData(LookupDataID, LookupID, Value).then(() => {
            resolve(index);
          });
        }
        else {//insert
          this.insertProcessLookupsData(LookupDataID, LookupID, Value).then(() => {
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
   * Insert else Updare ProcessLookupsData in the ProcessLookupsData Table
   * if not already exists
   */
  bulkInsertElseUpdateProcessLookupData(processLookupsData) {
    let promise = new Promise((resolve, reject) => {

      let chunks = Math.ceil(processLookupsData.length/100);

      for(let i = 0; i < chunks; i++){
        var query = 'INSERT INTO ProcessLookupsData (LookupDataID, LookupID, Value, LastModified) VALUES ';

        let values = [];
        for (let j = (i*100); j < ((100*(i+1))-1); j++) {
          if(j == processLookupsData.length){
            break;
          }
          let lookupData = processLookupsData[j];
    
          query = query + '(' +
          '?' + ',' + 
          '?' + ',' +
          '?' + ',' +
          '?' + '),';
    
           values = values.concat([parseInt(lookupData.LookupDataID), parseInt(lookupData.LookupID), JSON.stringify(lookupData.Value), this.helperProvider.convertDateToUTC(new Date())]);
        }
        query = query.slice(0, -1);
        
          
          this.clientDbProvider.runQuery(query, values, (response) => {
            if(i == chunks-1){
              resolve(response);
            }
          }, (error) => {
            reject(error);
          });
      }
    });
    return promise;
  }

  /**
   * Get all ProcessLookupsData in the ProcessLookupsData Table
   * and populate the lists
   */
  getAllProcessLookupsData(LookupID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from ProcessLookupsData where LookupID = ?';
      this.clientDbProvider.runQuery(query, [LookupID], (response) => {
        this.ProcessLookupsDataList = response.rows;
        var lookupData = [];
        for (var i = 0; i < this.ProcessLookupsDataList.length; i++) {
          lookupData.push(this.ProcessLookupsDataList.item(i));
        }
        resolve(lookupData);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get ProcessLookupsData in the ProcessLookupsData Table
   * specified by LookupID
   */
  getProcessLookupsData(LookupID) {
    var item;
    if (this.ProcessLookupsDataList) {
      for (var i = 0; i < this.ProcessLookupsDataList.length; i++) {
        if (this.ProcessLookupsDataList.item(i).LookupID === LookupID) {
          item = this.ProcessLookupsDataList.item(i);
          break;
        }
      }
    }
    return item;
  }

  /**
   * Getter for ProcessLookupsDataList
   */
  returnAllProcessLookupsDataList() {
    return this.ProcessLookupsDataList;
  }

  /**
   * Delete ProcessLookupsData from the ProcessLookupsData Table
   */
  deleteProcessLookupsData(LookupID, index) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM ProcessLookupsData WHERE LookupID = ?';
      this.clientDbProvider.runQuery(query, [LookupID], (response) => {
        resolve(index);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Delete ProcessLookupsData from the ProcessLookupsData Table
   */
  deleteProcessLookupsDataByLookupDataID(LookupDataID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM ProcessLookupsData WHERE LookupDataID = ?';
      this.clientDbProvider.runQuery(query, [LookupDataID], (response) => {
        resolve();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get ProcessLookupsData from the ProcessLookupsData Table
   */
  getProcessLookupFormData(LookupName, ProcessID, LookupColumns, ConditionalStatement, SortQuery) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT ' + LookupColumns + ' FROM ProcessLookupsData PLD' + ' Inner Join ProcessLookupObjects PLO on PLO.LookupID = PLD.LookupID' + ' WHERE' + ' JSON_EXTRACT(PLO.Value, \'$.LookupName\') = ' + '\'' + LookupName + '\'' + ' and PLO.ProcessID = ' + ProcessID + ' ' + ConditionalStatement + ' ' + SortQuery;
      var lookupItems = [];

      query = encodeURI(query);
      query = query.replace(new RegExp('%C2%A0', 'g'), '%20');
      query = decodeURI(query);

      this.clientDbProvider.runQuery(query, [], (response) => {
        for (var i = 0; i < response.rows.length; i++) {
          lookupItems[i] = response.rows.item(i);
        }
        resolve(lookupItems);
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
    this.ProcessLookupsDataList = [];
  }


}
