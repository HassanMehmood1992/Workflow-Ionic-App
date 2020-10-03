/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


/**
 * Importing neccassary liberaries and modules for this class 
 */
import { ENV } from './../../config/environment.prod';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { ClientDbMyProcessesProvider } from './../../providers/client-db-my-processes/client-db-my-processes';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { SocialSharing } from '@ionic-native/social-sharing';
import { SocketProvider } from './../../providers/socket/socket';
import { LoadingProvider } from './../../providers/loading/loading';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';

/*
ModuleID: page-directory-popup
Description: Renders process directory popup to show details of a process.
Location: ./pages/page-directory-popup
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@IonicPage()
@Component({
  selector: 'page-directory-popup',
  templateUrl: 'directory-popup.html',
})
export class DirectoryPopupPage {
  process; // process whose popup is opened
  user; // current loggedIn user
  data: Mydata; // data which this popup sends back to caller component
  constructor(private loading: LoadingProvider,
    private socket: SocketProvider,
    public navCtrl: NavController,
    private socialsharing: SocialSharing,
    public globalservice: ProcessDataProvider,
    private ClientDbMyProcesses: ClientDbMyProcessesProvider,
    private synchronization: SynchronizationProvider,
    private storageServiceProvider: StorageServiceProvider,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private errorReportingProvider: ErrorReportingProvider) {
    this.process = this.navParams.get('params');
    this.data = new Mydata();
  }

  /**
  * Called whenever is popup opened. Retrieves the parameters supplied this popup
  */
  ionViewDidEnter() {
    this.process = this.navParams.get('params');
  }


  /**
  * subscribe a process if it is not already subscribed
  * uses socket and synchronization service to sync devices and add to favorites
  */
  subscribe() {
    this.storageServiceProvider.getUser().then((user) => {
      this.user = user;
      var subcribeporcess = {
        userToken: this.user.AuthenticationToken,
        processId: this.process.ProcessID.toString(),
        diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
        operationType : 'APPLICATION'
      };
      this.loading.presentLoading("Adding process to favorites", 20000);
      var subscribedResult = this.socket.callWebSocketService('subscribeProcess', subcribeporcess);
      subscribedResult.then((result) => {
        this.loading.hideLoading();
        this.synchronization.startDownSync(false);
        this.process.Status = 'Pending Update';
        this.ClientDbMyProcesses.insertMyProcess(parseInt(this.process.ProcessID), JSON.stringify(this.process));
        this.data.isSubscribed = true;
        this.viewCtrl.dismiss(this.data);
        
      }).catch(error => {
        this.loading.hideLoading();
        if (error != 'NoConnection') {
          this.errorReportingProvider.logErrorOnAppServer('Directory Error',
            'Error while adding process',
            this.user.AuthenticationToken,
            this.process.ProcessID.toString(),
            'DirectoryPopupPage(socket.subscribeProcess)',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        }
      });
    });
  }
  /**
  * called on share button is clicked. Uses social sharing plugin to get messages apps and share links
  */
  share() {
    var weblink = ENV.WEB_SERVER_URL + "sharedurl?route=process&processID=" + this.process.ProcessID
    this.socialsharing.share(weblink).then((val) => {
      this.viewCtrl.dismiss(this.data);
    });
  }

  /**
  * Called after constructor. Retrieves the parameters supplied this popup
  */
  ngOnInit() {
    this.process = this.navParams.get('params');
  }

  /**
  * closes the popup
  */
  close() {
    this.viewCtrl.dismiss(this.data);
  }


}

  /**
  * Used as an interface to send data back to the caller component
  */
export class Mydata {
  isSubscribed: boolean
  constructor() {
    this.isSubscribed = false;
  }
}