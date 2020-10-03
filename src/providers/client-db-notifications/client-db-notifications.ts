
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ClientDbNotificationsProvider
Description: Service to perform CRUD operations on notification table
Location: ./providers/ClientDbNotificationsProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/


/**
* Importing neccassary libraries and modules for this class 
*/
import { ClientDbMyProcessesProvider } from './../client-db-my-processes/client-db-my-processes';
import { StorageServiceProvider } from './../storage-service/storage-service';
import { Platform } from 'ionic-angular/index';
import { ClientDbProvider } from './../client-db/client-db';
import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { ProcessDataProvider } from '../process-data/process-data';

import { BehaviorSubject } from 'rxjs'
/*
  Generated class for the ClientDbNotificationsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ClientDbNotificationsProvider {

  private NotificationList;
  private tasksList = [];
  private notificationsList = [];

  private _notificationsUpdater = new BehaviorSubject(false);
  notificationsUpdater$ = this._notificationsUpdater.asObservable();
  updateNotifications(val) {
    this._notificationsUpdater.next(val);
  }

  /**
   * Class constructor
   */
  constructor(private clientDbProvider: ClientDbProvider, private platform: Platform, private storageServiceProvider: StorageServiceProvider, private ClientDBMyProcesses: ClientDbMyProcessesProvider,
    private globalservice: ProcessDataProvider) {
  }

  /**
   * Create the table
   */
  initDB() {
    this.platform.ready().then(() => {
      var createTable = 'CREATE TABLE IF NOT EXISTS Notifications' + ' (NotificationID INTEGER, ProcessID INTEGER, Value NVARCHAR(32), NotificationType NVARCHAR(32), LastModified DATETIME)';
      this.clientDbProvider.runQuery(createTable, [], (res) => {
        return;
      }, (err) => {
        alert(err);
      });
    });
  }

  /**
   * Insert Notification in the Notifications Table
   */
  insertNotification(NotificationID, ProcessID, Value, NotificationType, reload) {
    let promise = new Promise((resolve, reject) => {
      var query = 'INSERT INTO Notifications (NotificationID, ProcessID, Value, NotificationType, LastModified) VALUES (?,?,?,?,?)';
      this.clientDbProvider.runQuery(query, [NotificationID, ProcessID, Value, NotificationType, moment(JSON.parse(Value).DateCreatedProcessOffset).format('YYYY-MM-DD HH:mm:ss.SSSSSS')], (response) => {
        this.updateRecentNotificationMessage(ProcessID);
        resolve(response);
        if (reload) {//reload false for batch updates
          this.getAllNotifications();
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update Notification in the Notifications Table
   */
  updateNotification(NotificationID, ProcessID, Value, NotificationType, reload) {
    let promise = new Promise((resolve, reject) => {
      var query = 'UPDATE Notifications SET ProcessID = ?, Value = ?, LastModified = ? WHERE NotificationID = ? and NotificationType = ?';
      this.clientDbProvider.runQuery(query, [ProcessID, Value, moment(JSON.parse(Value).DateCreatedProcessOffset).format('YYYY-MM-DD HH:mm:ss.SSSSSS'), NotificationID, NotificationType], (response) => {
        resolve(response);
        if (reload) {//reload false for batch updates
          this.getAllNotifications();
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Insert else update Notification in the Notifications Table
   * if not already exists
   */
  insertElseUpdateNotification(NotificationID, ProcessID, Value, NotificationType, reload, index) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from Notifications where NotificationID = ? and NotificationType = ?';
      this.clientDbProvider.runQuery(query, [NotificationID, NotificationType], (response) => {
        if (response.rows.length === 1) {//update
          this.updateNotification(NotificationID, ProcessID, Value, NotificationType, reload).then(() => {
            resolve(index);
          });
        }
        else {//insert
          this.insertNotification(NotificationID, ProcessID, Value, NotificationType, reload).then(() => {
            resolve(index);
          });
        }
        //Update the LastModified of the Process..
        var recentMessage = '';
        if (NotificationType === 'Task')//show the subject in task as recent notification message...
        {
          recentMessage = JSON.parse(Value).Subject;
        }
        else if (NotificationType === 'Notification')//show the Message as recent notification message...
        {
          recentMessage = JSON.parse(Value).Message;
        }
        let processOffsetDate = this.transformDateProcessOffset(moment(JSON.parse(Value).DateCreated), JSON.parse(Value).ProcessOffset);
        this.ClientDBMyProcesses.updateLastModified(ProcessID, processOffsetDate, recentMessage);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Convert Date to process offsete
   * @param date
   * @param args 
   */
  transformDateProcessOffset(date: any, args?: any): any {
    if (date) {
      var targetTime = new Date(date);//time to convert
      var timeZoneFromDB = args;//time zone value from database

      //get the timezone offset from local time in minutes
      var tzDifference = parseFloat(timeZoneFromDB) * 60;

      //convert the offset to milliseconds, add to targetTime, and make a new Date
      var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);

      //return datetime according to the new timezone
      return moment(offsetTime);
    }
    return null;
  }

  /**
   * Get all Notification in the Notifications Table
   * and populate the class variables
   */
  getAllNotifications() {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from Notifications where ProcessID = ?';
      this.clientDbProvider.runQuery(query, [this.globalservice.processId], (response) => {
        this.NotificationList = response.rows;
        this.tasksList = [];
        this.notificationsList = [];

        if (this.NotificationList.length !== 0) {
          for (var i = 0; i < this.NotificationList.length; i++) {
            var data = JSON.parse(this.NotificationList.item(i).Value);
            //data.DateCreated = moment(this.NotificationList.item(i).LastModified);

            if (this.NotificationList.item(i).NotificationType === 'Task') {//task
              this.tasksList.push(data);
            }
            else if (this.NotificationList.item(i).NotificationType === 'Notification') {//notification
              this.notificationsList.push(data);
            }
          }
          this.updateNotifications(true);
          resolve(response.rows);
        }
        else {
          this.updateNotifications(true);
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Get Notification in the Notifications Table
   * specified by id
   */
  getNotification(id) {
    var item;
    if (this.NotificationList) {
      for (var i = 0; i < this.NotificationList.length; i++) {
        if (this.NotificationList.item(i).NotificationID === id) {
          item = this.NotificationList.item(i);
          break;
        }
      }
    }
    return item;
  }

  /**
   * Getter for NotificationList
   */
  returnAllNotificationList() {
    return this.NotificationList;
  }
  /**
   * Getter for tasksList
   */
  getTasksList() {
    return this.tasksList;
  }
  /**
   * Getter for notificationsList
   */
  getNotificationsList() {
    return this.notificationsList;
  }

  /**
   * Get Process Tasks list for the process speified by processid
   */
  getProcessTasksList(processId) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from Notifications where ProcessID = ? and NotificationType = ?';
      this.clientDbProvider.runQuery(query, [processId, 'Task'], (response) => {
        this.NotificationList = response.rows;
        var processTasksList = [];

        for (var i = 0; i < this.NotificationList.length; i++) {
          processTasksList.push(JSON.parse(this.NotificationList.item(i).Value));
        }
        resolve(processTasksList);
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Delete Notification from the Notifications Table
   */
  deleteNotification(NotificationID, NotificationType) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM Notifications WHERE NotificationID = ? and NotificationType = ?';
      this.clientDbProvider.runQuery(query, [NotificationID, NotificationType], (response) => {
        resolve(response);
        this.getAllNotifications();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Delete Notification from the Notifications Table
   * specified by processID
   */
  deleteTasksByProcessId(ProcessID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM Notifications WHERE ProcessID = ? and NotificationType = ?';
      this.clientDbProvider.runQuery(query, [ProcessID, 'Task'], (response) => {
        resolve(response);
        this.getAllNotifications();
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Delete all Notification from the Notifications Table
   * for a process
   */
  deleteAllNotificationsByProcessId(ProcessID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'DELETE FROM Notifications WHERE ProcessID = ?';
      this.clientDbProvider.runQuery(query, [ProcessID], (response) => {
        resolve(response);
        this.getAllNotifications();
      }, (error) => {
        resolve(error);
      });
    });
    return promise;
  }


  /** Retrieve most recent notification
   *  Notifications and update accordingly
   * in MyProcesses Table called on delete notification
   * as well as read notification to point to the second
   * most latest in case the latest is deleted or read
   * */
  updateRecentNotificationMessage(processId) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * FROM Notifications where ProcessID = ? and JSON_EXTRACT(Value,\'$.NotificationAction\') = \'Pending\' ORDER BY NotificationID DESC LIMIT 1';
      this.clientDbProvider.runQuery(query, [processId], (response) => {
        if (response.rows.length > 0) {
          var notification = JSON.parse(response.rows.item(0).Value);
          if (response.rows.item(0).NotificationType === 'Task')//show the subject in task as recent notification message...
          {
            if (notification.TaskType === 'TaskAssignment') {
              if (typeof notification.Subject != 'undefined') {
                this.ClientDBMyProcesses.updateRecentNotificationMessage(processId, notification.Subject);
              }
            }
            else {
              if (typeof notification.Message != 'undefined') {
                this.ClientDBMyProcesses.updateRecentNotificationMessage(processId, notification.Message);
              }
            }
          }
          else if (response.rows.item(0).NotificationType === 'Notification')//show the Message as recent notification message...
          {
            if (typeof notification.Message != 'undefined') {
              this.ClientDBMyProcesses.updateRecentNotificationMessage(processId, notification.Message);
            }
          }
        }
        else {
          this.ClientDBMyProcesses.updateRecentNotificationMessage(processId, '');
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Mark the Notification from the Notifications Table
   * as read
   */
  readNotification(NotificationID, NotificationType) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from Notifications where NotificationID = ? and NotificationType = ?';
      this.clientDbProvider.runQuery(query, [NotificationID, NotificationType], (response) => {
        if (response.rows.length === 1) {//notification exists
          var task = JSON.parse(response.rows.item(0).Value);

          if (task.NotificationAction === 'Pending')//task not already marked as read
          {
            //Update the NotificationCount
            this.storageServiceProvider.getNotificationCounts().then(notificationCounts => {
              if (notificationCounts[task.ProcessID]) {
                notificationCounts[task.ProcessID].InboxCount = (parseInt(notificationCounts[task.ProcessID].InboxCount) - 1).toString();
                this.storageServiceProvider.setNotificationCounts(notificationCounts);
              }
            }, error => {
              console.error(error)
            });
            //mark the task as read in sqlite
            task.NotificationAction = 'Read';
            this.updateNotification(NotificationID, response.rows.item(0).ProcessID, JSON.stringify(task), 'Notification', true).then(() => {
              //update the most recent notification message for my processes..
              this.updateRecentNotificationMessage(task.ProcessID);
              resolve('true');
            });
          }
          else {
            resolve('false');
          }
        }
        else {
          resolve('false');
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Update Notification from the Notifications Table
   */
  unReadNotification(NotificationID, NotificationType) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from Notifications where NotificationID = ? and NotificationType = ?';
      this.clientDbProvider.runQuery(query, [NotificationID, NotificationType], (response) => {
        if (response.rows.length === 1) {//notification exists
          var task = JSON.parse(response.rows.item(0).Value);

          if (task.NotificationAction === 'Read')//task not already marked as unRead
          {
            //Update the NotificationCount
            this.storageServiceProvider.getNotificationCounts().then(notificationCounts => {
              if (notificationCounts[task.ProcessID]) {
                notificationCounts[task.ProcessID].InboxCount = (parseInt(notificationCounts[task.ProcessID].InboxCount) + 1).toString();
                this.storageServiceProvider.setNotificationCounts(notificationCounts);
              }
            }, error => {
              reject(error);
            });

            //mark the task as read in sqlite
            task.NotificationAction = 'Pending';
            this.updateNotification(NotificationID, response.rows.item(0).ProcessID, JSON.stringify(task), 'Notification', true).then(() => {
              //update the most recent notification message for my processes..
              this.updateRecentNotificationMessage(task.ProcessID);
              resolve('true');
            });
          }
          else {
            resolve('false');
          }
        }
        else {
          resolve('false');
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Remove task from the the Notifications Table
   */
  removeTask(ProcessID: number, WorkFlowID: number, FormID) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * FROM Notifications where ProcessID = ? and JSON_EXTRACT(Value,\'$.WorkflowID\') = ? and JSON_EXTRACT(Value,\'$.FormID\') = ?';
      this.clientDbProvider.runQuery(query, [ProcessID, WorkFlowID, FormID], (response) => {
        if (response.rows.length === 1) {//notification exists
          var task = JSON.parse(response.rows.item(0).Value);

          this.storageServiceProvider.getNotificationCounts().then(notificationCounts => {
            //Update the NotificationCount...for Tasks
            if (notificationCounts[parseInt(task.ProcessID)]) {
              notificationCounts[parseInt(task.ProcessID)].TaskCount = (parseInt(notificationCounts[parseInt(task.ProcessID)].TaskCount) - 1).toString();
              if (notificationCounts[parseInt(task.ProcessID)].TaskCount < 0) {
                notificationCounts[parseInt(task.ProcessID)].TaskCount = 0;
              }
            }
            else {//non process specific Task
              notificationCounts[0].TaskCount = (parseInt(notificationCounts[0].TaskCount) - 1).toString();
              if (notificationCounts[0].TaskCount < 0) {
                notificationCounts[0].TaskCount = 0;
              }
            }
            this.storageServiceProvider.setNotificationCounts(notificationCounts);
            this.deleteNotification(response.rows.item(0).NotificationID, response.rows.item(0).NotificationType).then(() => {
              //update the most recent notification message for my processes..
              this.updateRecentNotificationMessage(task.ProcessID);
              resolve();
            });
          }, error => {
            reject(error);
          });
        }
        else {
          resolve('false');
        }
      }, (error) => {
        reject(error);
      });
    });
    return promise;
  }

  /**
   * Remove Notification from the Notifications Table
   * and update the process accordingly
   */
  removeNotification(NotificationID, NotificationType) {
    let promise = new Promise((resolve, reject) => {
      var query = 'SELECT * from Notifications where NotificationID = ? and NotificationType = ?';
      this.clientDbProvider.runQuery(query, [NotificationID, NotificationType], (response) => {
        if (response.rows.length === 1) {//notification exists
          var task = JSON.parse(response.rows.item(0).Value);

          this.storageServiceProvider.getNotificationCounts().then(notificationCounts => {

            if (NotificationType === 'Notification')//deleting the notification
            {
              if (task.NotificationAction === 'Pending')//task not already marked as read.. update the badge count
              {
                //Update the NotificationCount....for notifications
                notificationCounts[parseInt(task.ProcessID)].InboxCount = (parseInt(notificationCounts[parseInt(task.ProcessID)].InboxCount) - 1).toString();
                if (notificationCounts[parseInt(task.ProcessID)].InboxCount < 0) {
                  notificationCounts[parseInt(task.ProcessID)].InboxCount = 0;
                }
                this.storageServiceProvider.setNotificationCounts(notificationCounts);

                this.deleteNotification(NotificationID, NotificationType).then(() => {
                  //update the most recent notification message for my processes..
                  this.updateRecentNotificationMessage(task.ProcessID);
                  resolve();
                });
              }
              else {
                this.deleteNotification(NotificationID, NotificationType).then(() => {
                  //update the most recent notification message for my processes..
                  this.updateRecentNotificationMessage(task.ProcessID);
                  resolve();
                });
              }
            }
            else//deleting the task.. upon completion..
            {
              //Update the NotificationCount...for Tasks
              if (notificationCounts[parseInt(task.ProcessID)]) {
                notificationCounts[parseInt(task.ProcessID)].TaskCount = (parseInt(notificationCounts[parseInt(task.ProcessID)].TaskCount) - 1).toString();
                if (notificationCounts[parseInt(task.ProcessID)].TaskCount < 0) {
                  notificationCounts[parseInt(task.ProcessID)].TaskCount = 0;
                }
              }
              else {//non process specific Task
                notificationCounts[0].TaskCount = (parseInt(notificationCounts[0].TaskCount) - 1).toString();
                if (notificationCounts[0].TaskCount < 0) {
                  notificationCounts[0].TaskCount = 0;
                }
              }
              this.storageServiceProvider.setNotificationCounts(notificationCounts);
              this.deleteNotification(NotificationID, NotificationType).then(() => {
                //update the most recent notification message for my processes..
                this.updateRecentNotificationMessage(task.ProcessID);
                resolve();
              });
            }

          }, error => {
            reject(error);
          });
        }
        else {
          resolve('false');
        }
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
    this.NotificationList = [];
    this.tasksList = [];
    this.notificationsList = [];
  }


}
