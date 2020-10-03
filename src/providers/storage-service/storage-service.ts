/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: StorageServiceProvider
Description: Provide functionality to use local storage of app.
Location: ./providers/StorageServiceProvider
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { CountServiceProvider } from './../count-service/count-service';
import { NativeStorage } from '@ionic-native/native-storage';
import { Injectable } from '@angular/core';

/*
  Generated class for the StorageServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageServiceProvider {

  processCounts: any[] = [];//holds the process counts for a user

  /**
  * class constructor
  */
  constructor(private storage: NativeStorage, private countsservice: CountServiceProvider) {
    
  }


  /**
  * Set user object in localstorage
  */
  setUser(user) {
    this.storage.setItem('User', user);
  };

  /**
  * Get user object from localstorage
  */
  getUser(): any {
    let promise = new Promise((resolve, reject) => {
      this.storage.getItem('User').then(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
    return promise;
  };

  /**
  * Remove user object from localstorage
  */
  removeUser() {
    let promise = new Promise((resolve, reject) => {
      this.storage.remove('User').then(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
    return promise;
  };

  /**
  * Set NotificationCounts object in localstorage
  */
  setNotificationCounts(notificationCounts) {
    this.storage.setItem('NotificationCounts', notificationCounts).then(() => {
      this.processCounts = notificationCounts;
      this.getNotificationCounts().then( (result)=> {
        this.countsservice.changeNav(result);
      })
    }, error => console.error('Error storing item', error));
  };

  /**
  * Get NotificationCounts object from localstorage
  */
  getNotificationCounts(): any {
    let promise = new Promise((resolve, reject) => {
      this.storage.getItem('NotificationCounts').then(result => {
        this.processCounts = result;
        resolve(result);
      }, error => {
        this.processCounts = [];
        reject(error);
      });
    });
    return promise;
  };

  /**
  * Remove NotificationCounts object from localstorage
  */
  removeNotificationCounts() {
    let promise = new Promise((resolve, reject) => {
      this.storage.remove('NotificationCounts').then(result => {
        this.processCounts = [];
        resolve(result);
      }, error => {
        reject(error);
      });
    });
    return promise;
  };

  /**
  * Getter for processCounts
  */
  getProcessCounts() {
    return this.processCounts;
  }

  /**
  * Remove NotificationCounts object from localstorage
  */
  removeProcessNotificationCounts(processId) {
    //set task count of process to zero
    let promise = new Promise((resolve, reject) => {
      this.storage.getItem('NotificationCounts').then(result => {
        if(result[processId]){
          result[processId].TaskCount = 0;
          this.storage.setItem('NotificationCounts', result).then(() => {
          }, error => {});
        }
      }, error => {
        reject(error);
      });
    });
    return promise;
  };

  /**
  * Set LastSynced in localstorage
  */
  setLastSynced(lastSynced) {
    this.storage.setItem('LastSynced', lastSynced);
  };
  setLockedProcess(lockedProcess) {
    this.storage.setItem('LockedProcess', lockedProcess).then(() => {

    }, error => console.error('Error storing item LockedProcess', error));
  };

  getLockedProcess()
  {
    let promise = new Promise((resolve, reject) => {
      this.storage.getItem('LockedProcess').then(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
    return promise;
  }

  /**
  * Get LastSynced object from localstorage
  */
  getLastSynced(): any {
    let promise = new Promise((resolve, reject) => {
      this.storage.getItem('LastSynced').then(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
    return promise;
  };

  /**
  * Remove LastSynced object from localstorage
  */
  removeLastSynced() {
    let promise = new Promise((resolve, reject) => {
      this.storage.remove('LastSynced').then(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
    return promise;
  };

  /**
  * Add new sync task in FailedSyncTasks for failed tasks to avoid showing dialogue for the task in next iteration
  */
  addNewTask(taskID) {
    this.storage.getItem('FailedSyncTasks').then(result => {
      result.push(taskID);
      this.storage.setItem('FailedSyncTasks', result);
    }, error => {
      var result = [taskID];
      this.storage.setItem('FailedSyncTasks', result);
    });
  };

  /**
  * Get FailedSyncTasks object from localstorage
  */
  getAllTasks(): any {
    let promise = new Promise((resolve, reject) => {
      this.storage.getItem('FailedSyncTasks').then(result => {
        resolve(result);
      }, error => {
        resolve([]);
      });
    });
    return promise;
  };

  /**
  * Remove FailedSyncTasks object from localstorage
  */
  removeAllTasks() {
    let promise = new Promise((resolve, reject) => {
      this.storage.remove('FailedSyncTasks').then(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
    return promise;
  };


}
