/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


/**
 * Importing neccassary liberaries and modules for this class 
 */
import { FormControl } from '@angular/forms';
import { ENV } from './../../config/environment.prod';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { DirectoryPopupPage } from './../directory-popup/directory-popup';
import { ClientDbMyProcessesProvider } from './../../providers/client-db-my-processes/client-db-my-processes';
import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { AccessRequestPage } from './../access-request/access-request';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { SocketProvider } from './../../providers/socket/socket';
import { LoadingProvider } from './../../providers/loading/loading';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController, Content } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';

/*
ModuleID: page-directory
Description: Renders process directory page and uses socket to retrieve processes from server.
Location: ./pages/page-directory
Author: Hassan
Version: 1.0.0
Modification history: none
*/


@IonicPage()
@Component({
  selector: 'page-directory',
  templateUrl: 'directory.html',
})
export class DirectoryPage {
  @ViewChild(Content) content: Content;

  searchControl: FormControl;//search control for directory
  Processes; // list for getting processes
  user; // current loggedin user
  toggleSearch; // toggle search on directory view
  pageSize; // initial page size to get from server
  pageNumber; // current page number in the call
  searchValue; // search value to be added in query 
  alphaSort; // check if sorting is on or off
  noMore; // check if there is no more data coming from server
  Organizations; // List of organization
  searchQuery; // search query to be added in server call
  selectedOrg; // currently selected organiztion
  searchField; // input field model for search input

  organizationChange: boolean;

  /**
   * Creates an instance of DirectoryPage.
   * @param {LoadingProvider} loading 
   * @param {SocketProvider} socket 
   * @param {NavController} navCtrl 
   * @param {App} app 
   * @param {SocialSharing} socialsharing 
   * @param {ProcessDataProvider} globalservice 
   * @param {ModalController} modalCtrl 
   * @param {ClientDbMyProcessesProvider} ClientDbMyProcesses 
   * @param {SynchronizationProvider} synchronization 
   * @param {StorageServiceProvider} storageServiceProvider 
   * @param {NavParams} navParams 
   * @param {ErrorReportingProvider} errorReportingProvider 
   * @memberof DirectoryPage
   */
  constructor(private loading: LoadingProvider,
    private socket: SocketProvider,
    public navCtrl: NavController,
    private app: App,
    private socialsharing: SocialSharing,
    public globalservice: ProcessDataProvider,
    public modalCtrl: ModalController,
    private ClientDbMyProcesses: ClientDbMyProcessesProvider,
    private synchronization: SynchronizationProvider,
    private storageServiceProvider: StorageServiceProvider,
    public navParams: NavParams,
    private errorReportingProvider: ErrorReportingProvider) {

    this.Processes = [];
    this.noMore = false;
    this.searchControl = new FormControl();
    this.searchQuery = "";
    this.searchField = "";
    this.Organizations = [];
    this.selectedOrg = {};

    this.organizationChange = false;

    this.searchControl.valueChanges.debounceTime(1200).subscribe(search => {
      if (this.searchQuery != search) {
        if (search.length > 0) {

          this.getprocesseswithoutloading(search);
        }
        else if (search.length <= 0 && this.searchQuery.length > 0) {

          this.getprocesseswithoutloading(search);
        }
        else {
          this.searchQuery = "";
        }
      }
    })
  }


  /**
  * Called on pull to refresh list of directory. Uses socket to get fresh data.
  */
  doRefresh(refresher) {
    refresher.complete();
    if(this.Organizations.length > 0){
      this.selectedOrg = this.Organizations[0];
      this.organizationChange = false;
      this.organizationChanged();
    }
    else{
      this.loadDirectory();
    }
  }

  /**
   * Load organizations and processes
   * on view load
   */
  ngOnInit(){
    //this.loadDirectory();
  }

  /**
  * Called whenever a user switch to this tab. Uses socket to get organizations from the server.
  */
  ionViewWillEnter() {
    if(this.Organizations.length > 0){
      this.selectedOrg = this.Organizations[0];
      this.organizationChanged();
    }
    else{
      this.loadDirectory();
    }
  }

  /**
   * Initialise the view
   */
  loadDirectory(){
    this.pageSize = 10;
    this.pageNumber = 1;
    this.toggleSearch = false;
    this.Organizations = [];
    this.Processes = [];

    var self = this;
    this.storageServiceProvider.getUser().then((user) => {
      self.user = user;
      var authenticateUser = {
        userToken: self.user.AuthenticationToken,
        diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
        operationType : 'APPLICATION'
      };
      self.loading.presentLoading("Loading organizations...", 20000);
      self.socket.callWebSocketService('retrieveAllProcessOrganizations', authenticateUser)
        .then((result) => {
          self.loading.hideLoading();
          self.Organizations = result;
          self.Organizations = [{ OrganizationName: "All" }].concat(self.Organizations);
          if (self.Organizations) {
            self.selectedOrg = self.Organizations[0];
          }
          
        }).catch(error => {
          self.loading.hideLoading();
          if (error != 'NoConnection') {
            self.errorReportingProvider.logErrorOnAppServer('Directory Error',
              'Error while retrieving directory',
              self.user.AuthenticationToken,
              '0',
              'DirectoryPage(socket.retrieveAllProcesses)',
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
  * resize the current ViewChild.
  */
  ngDoCheck() {
    this.content.resize();
  }

  /**
  * called on share button is clicked. Uses social sharing plugin to get messages apps and share links
  */
  share(process, slidingitem) {
    var weblink = ENV.WEB_SERVER_URL + "sharedurl?route=process&processID=" + process.ProcessID
    this.socialsharing.share(weblink).then((val) => {
      slidingitem.close();
    });
  }

  /**
  * Opens directory popup to show details of a process
  */
  openModal(process) {
    let directoryModal = this.modalCtrl.create(DirectoryPopupPage, { params: process }, { enableBackdropDismiss: true });
    directoryModal.onDidDismiss(data => {
      if (data != null) {
        if (data.isSubscribed) {
          var processIndex = this.Processes.findIndex(function (item) {
            return item.ProcessID === process.ProcessID;
          });
          this.Processes[processIndex].IsSubscribed = 'Active';
        }
      }
    });
    directoryModal.present();

  }

  /**
  * go to access page where a user can submit a request if the process is not directory
  */
  goToAccess() {
    this.app.getRootNav().push(AccessRequestPage);
  }

  /**
  * Called when the organization is changed from the dropdown. Uses socket call and loads data from the server
  */
  organizationChanged() {
    if(!this.organizationChange){
      this.organizationChange = true;
      this.pageSize = 10;
      this.pageNumber = 1;
      this.noMore = false;
  
      this.storageServiceProvider.getUser().then((user) => {
        this.user = user;
        var authenticateUser = {
          userToken: this.user.AuthenticationToken,
          numberOfRows: this.pageSize.toString(),
          desiredPageNumber: this.pageNumber.toString(),
          searchValue: this.searchQuery,
          organizationNames: (this.selectedOrg.OrganizationName == 'All') ? "" : this.selectedOrg.OrganizationName,
          sorting: 'ASC',
          diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
          operationType : 'APPLICATION'
        };
        this.loading.presentLoading("Loading process directory...", 20000);
        this.socket.callWebSocketService('retrieveAllProcesses', authenticateUser)
          .then((result) => {
  
            this.loading.hideLoading();
            this.Processes = result;
            this.organizationChange = false;

          }).catch(error => {
            this.loading.hideLoading();
            this.organizationChange = false;
            if (error != 'NoConnection') {
              this.errorReportingProvider.logErrorOnAppServer('Directory Error',
                'Error while retrieving directory',
                this.user.AuthenticationToken,
                '0',
                'DirectoryPage(socket.retrieveAllProcesses)',
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
  }

  /**
  * subscribe a process if it is not already subscribed
  * uses socket and synchronization service to sync devices and add to favorites
  */
  subscribe(process, slidingitem) {
    this.storageServiceProvider.getUser().then((user) => {
      this.user = user;
      var subcribeporcess = {
        userToken: this.user.AuthenticationToken,
        processId: process.ProcessID.toString(),
        diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
        operationType : 'APPLICATION'
      };
      this.loading.presentLoading("Adding to Favorites", 20000);
      this.socket.callWebSocketService('subscribeProcess', subcribeporcess)
        .then((result) => {
          this.loading.hideLoading();
          this.synchronization.startDownSync(false);
          process.Status = 'Pending Update';
          this.ClientDbMyProcesses.insertMyProcess(parseInt(process.ProcessID), JSON.stringify(process));
          var processIndex = this.Processes.findIndex(function (item) {
            return item.ProcessID === process.ProcessID;
          });
          this.Processes[processIndex].IsSubscribed = 'Active';
          slidingitem.close();

        }).catch(error => {
          this.loading.hideLoading();
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('Directory Error',
              'Error while adding process',
              this.user.AuthenticationToken,
              process.ProcessID.toString(),
              'DirectoryPage(socket.subscribeProcess)',
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
  * socket call to load data from server for this view
  */
  getProcessesFromServer(infiniteScroll) {
    this.storageServiceProvider.getUser().then((user) => {
      this.user = user;
      var authenticateUser = {
        userToken: this.user.AuthenticationToken,
        numberOfRows: this.pageSize.toString(),
        desiredPageNumber: this.pageNumber.toString(),
        searchValue: this.searchQuery,
        organizationNames: (this.selectedOrg.OrganizationName == 'All') ? "" : this.selectedOrg.OrganizationName,
        sorting: 'ASC',
        diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
        operationType : 'APPLICATION'
      };

      this.socket.callWebSocketService('retrieveAllProcesses', authenticateUser)
        .then((result) => {
          infiniteScroll.complete();

          if (result.length == 0) {
            this.noMore = true;
            return;
          }
          for (var i = 0; i < result.length; i++) {
            this.Processes.push(result[i]);
          }

        }).catch(error => {

          infiniteScroll.complete();
          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('Directory Error',
              'Error while retrieving directory',
              this.user.AuthenticationToken,
              '0',
              'DirectoryPage(socket.retrieveAllProcesses)',
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
  * called when the user scroll to the end of the page
  */
  doInfinite(infiniteScroll) {
    if (!this.noMore) {
      this.pageNumber++;
      this.getProcessesFromServer(infiniteScroll);
    }
    else {
      infiniteScroll.complete();
    }
  }

  /**
  * Called on scroll at the end of the page. No need to add extra loading dialogs.
  */
  getprocesseswithoutloading(search) {
    if (this.searchQuery == search) {
      return;
    }
    this.searchQuery = search;

    this.pageSize = 10;
    this.pageNumber = 1;
    this.storageServiceProvider.getUser().then((user) => {
      this.user = user;
      var authenticateUser = {
        userToken: this.user.AuthenticationToken,
        numberOfRows: this.pageSize.toString(),
        desiredPageNumber: this.pageNumber.toString(),
        organizationNames: (this.selectedOrg.OrganizationName == 'All') ? "" : this.selectedOrg.OrganizationName,
        searchValue: search,
        sorting: 'ASC',
        diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
        operationType : 'APPLICATION'
      };
      this.loading.presentLoading("Filtering process directory...", 20000);
      this.socket.callWebSocketService('retrieveAllProcesses', authenticateUser)
        .then((result) => {
          this.loading.hideLoading();

          this.Processes = result;

        }).catch(error => {

          if (error != 'NoConnection') {
            this.errorReportingProvider.logErrorOnAppServer('Directory Error',
              'Error while retrieving directory',
              this.user.AuthenticationToken,
              '0',
              'DirectoryPage(socket.retrieveAllProcesses)',
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

}
