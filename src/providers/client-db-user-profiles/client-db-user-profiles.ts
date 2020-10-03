/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbUserProfilesProvider
Description: Service to perform CRUD operations on user profile table.
Location: ./providers/ClientDbUserProfilesProvider
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
  Generated class for the ClientDbUserProfilesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbUserProfilesProvider {

  private UserProfileList;

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
      var createTable = 'CREATE TABLE IF NOT EXISTS UserProfiles' + ' (UserID INTEGER PRIMARY KEY NOT NULL, Value NVARCHAR(32), LastModified DATETIME)';
      this.clientDbProvider.runQuery(createTable, [], (res) => {
        return;
      }, (err) => {
        alert(err);
      });
    });
  }

  /**
   * Insert UserProfile in the UserProfiles table
   */
  insertUserProfile(UserID, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT OR IGNORE INTO UserProfiles (UserID, Value, LastModified) VALUES (?,?,?)';
      this.clientDbProvider.runQuery(query, [UserID, Value, this.helperProvider.convertDateToUTC(new Date())], (response) => {
        resolve(response);
        this.getAllUserProfiles();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update UserProfile in the UserProfiles table
   */
  updateUserProfile(UserID, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE UserProfiles SET Value = ?, LastModified = ? WHERE UserID = ?';
      this.clientDbProvider.runQuery(query, [Value, this.helperProvider.convertDateToUTC(new Date()), UserID], (response) => {
        resolve(response);
        this.getAllUserProfiles();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Insert else update UserProfile in the UserProfiles table if not
   * already exists
   */
  insertElseUpdateUserProfile(UserID, Value) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from UserProfiles where UserID = ?';
      this.clientDbProvider.runQuery(query, [UserID, Value], (response) => {
        if (response.rows.length === 1) {//update
          this.updateUserProfile(UserID, Value).then(() => {
            resolve();
          });
        }
        else {//insert
          this.insertUserProfile(UserID, Value).then(() => {
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
   * get all UserProfile from the UserProfiles table
   * and populate the class variable
   */
  getAllUserProfiles() {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from UserProfiles';
      this.clientDbProvider.runQuery(query, [], (response) => {
        this.UserProfileList = response.rows;
        resolve(response.rows);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * retrieve UserProfile from the UserProfiles table
   * specified by id
   */ 
  getUserProfile(id) {
    var item;
    if (this.UserProfileList) {
      for (var i = 0; i < this.UserProfileList.length; i++) {
        if (this.UserProfileList.item(i).UserID === id) {
          item = this.UserProfileList.item(i);
          break;
        }
      }
    }
    return item;
  }

  /**
   * Getter for UserProfileList
   */
  returnAllUserProfileList() {
    return this.UserProfileList;
  }

  /**
   * Delete UserProfile from the UserProfiles table
   * specified by id
   */
  deleteUserProfile(id) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM UserProfiles WHERE UserID = ?';
      this.clientDbProvider.runQuery(query, [id], (response) => {
        resolve(response);
        this.getAllUserProfiles();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Empty the class lists
   */
  emptyLists() {
    this.UserProfileList = [];
  }


}
