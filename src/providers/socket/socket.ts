import { Subscription } from 'rxjs/Subscription';
import { FormControl } from '@angular/forms';

/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: SocketProvider
Description: Provides functionality to connect to App Server via socket.
Location: ./providers/SocketProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/

import { ENV } from './../../config/environment.prod';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs'

/*
  Generated class for the SocketProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SocketProvider {

  private static callbacks = {};//store callbacks for all socket calls made to the server
  private static appServer: string = '';//url of app server
  private static ws = null;//socket object containing reference of the websocket
  static showbar = "";
  static message = "";//message to show on the application header for socket disconnections

  private currentCallbackId: number = 0;//store the current callbackid for a message currently being sent

  private static messageShowControl = new FormControl();
  private static messageShowCtrlSub: Subscription;

  /**
   * Class constructor
   */
  constructor() {
    //call check periodically and try establishing connection if not connected
    setInterval(SocketProvider.check, 5000);

    SocketProvider.messageShowCtrlSub = SocketProvider.messageShowControl.valueChanges
    .debounceTime(10000)
    .subscribe(newValue => SocketProvider.message = SocketProvider.showbar);
  }


  /**
   * Try establishing connection if not connected
   */
  static check() {
    SocketProvider.releaseMissedResponses();
    if (!SocketProvider.ws || SocketProvider.ws.readyState === 3) {
      SocketProvider.start();
    }
    else if (SocketProvider.ws.readyState === 1){
      SocketProvider.showbar = '';
      SocketProvider.message = '';
      SocketProvider.messageShowControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }
  };

  

  /**
   * Release the callbackIDs of synchronization socket calls whose responses are not recieved 
   */
  static releaseMissedResponses() {
    Object.keys(SocketProvider.callbacks).forEach(function(key:any, index) {
      // key: the name of the object key
      // index: the ordinal position of the key within the object
      if(SocketProvider.callbacks[key].method === 'getUserSyncTasksString' || SocketProvider.callbacks[key].method === 'UpSync'){
        let diff:any = Math.floor((Math.abs( Date.parse(new Date(SocketProvider.callbacks[key].time).toString()) - Date.parse(new Date().toString()))/1000));
        if(diff >= 60){
          SocketProvider.callbacks[key].reject('NoConnection');
          delete SocketProvider.callbacks[key];
          SocketProvider.start();
        }
      }
      else if((SocketProvider.callbacks[key].method === 'getADUsers' || 
      SocketProvider.callbacks[key].method === 'socketFileSave' || 
      SocketProvider.callbacks[key].method === 'workflowAssesment' ||
      SocketProvider.callbacks[key].method === 'validateCredentials' ||
      SocketProvider.callbacks[key].method === 'pingAppServer')
      && !navigator.onLine){
        let diff:any = Math.floor((Math.abs( Date.parse(new Date(SocketProvider.callbacks[key].time).toString()) - Date.parse(new Date().toString()))/1000));
        if(diff > 15){
          SocketProvider.callbacks[key].reject('NoConnection');
          delete SocketProvider.callbacks[key];
          SocketProvider.start();
        }
      }
  });
  }

  /**
   * Set appServer
   */
  setUrl(serverSocketURL) {
    SocketProvider.appServer = serverSocketURL;
  };

  /**
   * Get ws
   */
  returnsocket() {
    return SocketProvider.ws;
  };
  getAppServer() {
    return SocketProvider.appServer;
  };

  start() {
    SocketProvider.start();
  };

  /**
   * Start the web socket
   */
  static start() {
    if (this.appServer !== '') {
      try {
        SocketProvider.ws = new WebSocket(this.appServer);
      } catch (ex) {
        return;
      }

      //on-open event listener..
      SocketProvider.ws.onopen = () => {
        SocketProvider.showbar = '';
        SocketProvider.message = '';
        SocketProvider.messageShowControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
      };

      //on-message event listener..
      SocketProvider.ws.onmessage = function (message) {
        SocketProvider.listener(message.data);
      };

      //on-close event listener..
      SocketProvider.ws.onclose = function () {
        //Upon closing, resolve all callbacks to avoid a socket call promise not resolving...
        //resolve as 'NoConnection' and deletes 20 previous socket calls with sent = true..
        for (var i = this.currentCallbackId; i >= (this.currentCallbackId - 20); i--) {
          if (i < 0) {
            break;
          }
          if (this.callbacks[i])//if not undefined..
          {
            if (this.callbacks[i].sent === true) {
              this.callbacks[i].reject('NoConnection');
              delete this.callbacks[i];
            }
          }
        }
      };

      //on-error event listener..
      SocketProvider.ws.onerror = function () {
        
      };
    }
  };

  /**
   * Send message over the socket
   * @param request 
   */
  sendRequest(request) {
    let promise = new Promise((resolve, reject) => {
      var callbackId = this.getCallbackId();
      SocketProvider.callbacks[callbackId] = {
        time: new Date(),
        resolve: resolve,
        reject: reject,
        sent: false,
        method: request.methodName
      };
      request.callBackId = callbackId;

      SocketProvider.waitForSocketConnection(SocketProvider.ws, 0, callbackId, (socketConnected, callBackId) => {
        try {

          if (!socketConnected || !navigator.onLine) {
            if(SocketProvider.showbar != 'RapidFlow Server Unreachable'){
              SocketProvider.showbar = 'RapidFlow Server Unreachable';
              SocketProvider.messageShowControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
            }
            SocketProvider.callbacks[callBackId].reject('NoConnection');
            delete SocketProvider.callbacks[callBackId];
          }
          else {
            SocketProvider.showbar = '';
            SocketProvider.message = '';
            SocketProvider.messageShowControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
            SocketProvider.ws.send(JSON.stringify(request));
            SocketProvider.callbacks[callbackId].sent = true;
          }
        } catch (e) {
          SocketProvider.callbacks[callBackId].reject('NoConnection');
          delete SocketProvider.callbacks[callBackId];
        }
      });
    });
    return promise;
  };

  /**
   * Handler for incoming messages
   * @param payload 
   */
  static listener(payload) {
    //extract the callbackId from string in case the json is malformed
    var callbackId = payload.match(/\[{"callBackId":"(\d+)/i)[1];

    try {
      var data = JSON.parse(payload.replace(/\n/g, ""));
      var messageObj = data[0];

      //If an object exists with callback_id in our callbacks object, resolve it
      if(SocketProvider.callbacks[messageObj.callBackId]){
        SocketProvider.callbacks[messageObj.callBackId].resolve(messageObj.data);
        delete SocketProvider.callbacks[messageObj.callBackId];
      }

    } catch (e) {
      if(SocketProvider.callbacks[callbackId]){
        SocketProvider.callbacks[callbackId].reject(e); //callback id cannot be extracted..
        delete SocketProvider.callbacks[callbackId];
      }
    }
  };

  /**
   * Create a new callback ID for a request
   */
  getCallbackId() {
    this.currentCallbackId += 1;
    //flush the callbackids..
    if (this.currentCallbackId > 10000) {
      this.currentCallbackId = 0;
    }
    return this.currentCallbackId;
  };

  /**
   * Call the websocket service
   * with the provided payload
   * @param methodName 
   * @param parameterObj 
   */
  callWebSocketService(methodName, parameterObj): any {
    var request = {
      operationType: parameterObj.operationType,
      methodName: methodName,
      parameterObj: JSON.stringify(parameterObj)
    };
    var promise = this.sendRequest(request);
    return promise;
  };

  /**
   * Wait until the connection is made. Resolve with
   * error if connection attempts exceed the number
   * specified in 'ENV.SOCKET_CONNECTION_RETRIES'
   * @param socket 
   * @param retries 
   * @param callBackId 
   * @param callback 
   */
  static waitForSocketConnection(socket, retries, callBackId, callback) {
    setTimeout(
      function () {
        if (socket) {
          if (socket.readyState === 1) {
            if (callback !== null) {
              callback(true, callBackId);
            }
            return;
          }
          else {
            if (retries >= ENV.SOCKET_CONNECTION_RETRIES) {
              callback(false, callBackId);
              return;
            }
            SocketProvider.check();
            retries++;
            SocketProvider.waitForSocketConnection(socket, retries, callBackId, callback);
          }
        }
      }, 1000); // wait 5 milisecond for the connection...
  };

}
