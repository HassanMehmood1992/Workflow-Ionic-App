/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ErrorReportingProvider
Description: Service configured to report app level errors. Presents a dialog from where a user can report
Location: ./providers/ErrorReportingProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/


/**
* Importing neccassary libraries and modules for this class 
*/
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Injectable } from '@angular/core';
import { SocketProvider } from '../socket/socket';

/*
  Generated class for the ErrorReportingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ErrorReportingProvider {

  /**
   * Class constructor
   */
  constructor(private alertController: AlertController,
    private socket: SocketProvider) {
  }

  /**
   * Log the error specified by the arguments on the App Server
   */
  logErrorOnAppServer (alertTitle, alertMessage, authenticationToken, processId, method, logs, stackTrace, eventDateTime, status, category, diagnosticLog) {
    let promise = new Promise((resolve, reject) => {
      var errorLog = {
        authenticationToken: authenticationToken,
        processId: processId,
        method: method,
        logs: logs,
        stackTrace: stackTrace,
        eventDateTime: new Date().toISOString(),
        status: status,
        category: category,
        diagnosticLog: diagnosticLog,
        operationType : 'APPLICATION'
      }
      this.alertController.create({
        title: alertTitle,
        message: alertMessage,
        buttons: [
           {
            text: 'Create Support Ticket',
            role: 'error report',
            handler: () =>{
              this.socket.callWebSocketService('addLog', errorLog).then(
                (result) => {
                    if (result === 'True') {
                      alert('Error reported successfully...');
                    }
                    else {
                      alert('Error in creating support ticket...');
                    }
                }
              ).catch((error) => {
                alert('Error in creating support ticket...');
              });
            }
           },
           {
            text: 'Close',
            role: 'Close',
            handler: () =>{
              resolve();
            }
          }
        ]
      }).present();
    });
    return promise;
  }

}
