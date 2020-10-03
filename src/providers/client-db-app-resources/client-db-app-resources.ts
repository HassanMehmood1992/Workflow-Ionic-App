import { BehaviorSubject } from 'rxjs';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbAppResourcesProvider
Description: Service to perform CRUD operations on App Resource table
Location: ./providers/ClientDbAppResourcesProvider
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
  Generated class for the ClientDbAppResourcesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbAppResourcesProvider {

  private AppResourceList;
  private AppSettings = {};
  private PlatformSettings = {};
  private AllPlatformSettings = [];

  //behaviour subject and subscriber object for other classes to subscribe change events
  private _settingsUpdater = new BehaviorSubject(false);
  settingsUpdater$ = this._settingsUpdater.asObservable();
  updateProcesses(val) {
    this._settingsUpdater.next(val);
  }

  /**
   * Class constructor
   */
  constructor(private clientDbProvider: ClientDbProvider, private platform: Platform, private helperProvider: HelperProvider) {
  }


  /**
   * Initialize the Table
   */
  initDB() {
    let promise = new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        var createTable = 'CREATE TABLE IF NOT EXISTS AppResources' + ' (AppResourceID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, Identifier INTEGER, ResourceKey NVARCHAR(32), ResourceValue NVARCHAR(32), LastModified DATETIME)';
        this.clientDbProvider.runQuery(createTable, [], (res) => {
          resolve();
        }, (err) => {
          reject();
        });
      });
    });
    return promise;
  }

  /**
   * Insert AppResources in the AppResources table
   */
  insertAppResource(Identifier, ResourceKey, ResourceValue) {
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT INTO AppResources (Identifier, ResourceKey, ResourceValue, LastModified) VALUES (?,?,?,?)';

      this.clientDbProvider.runQuery(query, [Identifier, ResourceKey, ResourceValue, this.helperProvider.convertDateToUTC(new Date())], (response) => {
        resolve(response);
        this.getAllAppResources();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update AppResources in the AppResources table
   */
  updateAppResource(ResourceKey, ResourceValue) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE AppResources SET ResourceValue = ?, LastModified = ? WHERE ResourceKey = ?';
      this.clientDbProvider.runQuery(query, [ResourceValue, this.helperProvider.convertDateToUTC(new Date()), ResourceKey], (response) => {
        this.getAllAppResources()
          .then(() => {
            resolve(response);
          });
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get all AppResources from the AppResources table
   */
  getAllAppResources() {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from AppResources';

      this.clientDbProvider.runQuery(query, [], (response) => {
        this.AppResourceList = response.rows;
        if (this.AppResourceList.length !== 0) {
          for (var i = 0; i < this.AppResourceList.length; i++) {
            if (this.AppResourceList.item(i).ResourceKey === 'AppSettings') {
              this.AppSettings = JSON.parse(this.AppResourceList.item(i).ResourceValue);
            }
            if (this.AppResourceList.item(i).ResourceKey === 'PlatformSettings') {
              this.PlatformSettings = JSON.parse(this.AppResourceList.item(i).ResourceValue);
              var temp = JSON.parse(this.AppResourceList.item(i).ResourceValue);
              this.AllPlatformSettings = temp;
              for (var j = 0; j < temp.length; j++) {
                if (temp[j].SettingName == 'APPLICATION_ALERT') {
                  this.PlatformSettings = temp[j];
                  break;
                }
              }
            }
          }
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
   * Get AppResources from the AppResources table
   */
  getAppResource(id) {
    var item;
    if (this.AppResourceList) {
      for (var i = 0; i < this.AppResourceList.length; i++) {
        if (this.AppResourceList.item(i).AppResourceID === id) {
          item = this.AppResourceList.item(i);
          break;
        }
      }
    }
    return item;
  }

  /**
   * Getter for AppResourceList
   */
  returnAllAppResourceList() {
    return this.AppResourceList;
  }

  /**
   * Delete AppResources from the AppResources table
   */
  deleteAppResource(id) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM AppResources WHERE AppResourceID = ?';

      this.clientDbProvider.runQuery(query, [id], (response) => {
        resolve(response);
        this.getAllAppResources();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Getter for AppSettings
   */
  getAppSettings(): any {
    return this.AppSettings;
  }

  /**
   * Getter for AllPlatformSettings
   */
  getAllPlatformSettings(): any {
    return this.AllPlatformSettings;
  }

  /**
   * Getter for PlatformSettings
   */
  getPlatformSettings(): any {
    return this.PlatformSettings;
  }

  /**
   * Empty the lists
   */
  emptyLists() {
    this.AppResourceList = [];
    this.AppSettings = {};
    this.PlatformSettings = {};
    this.AllPlatformSettings = [];
  }

}
