/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


import { AccessRequestPage } from './../pages/access-request/access-request';
import { ClientDbAppResourcesProvider } from './../providers/client-db-app-resources/client-db-app-resources';
import { ClientDbMyProcessesProvider } from './../providers/client-db-my-processes/client-db-my-processes';
import { FormPage } from './../pages/form/form';
import { ClientDbProcessResourcesProvider } from './../providers/client-db-process-resources/client-db-process-resources';
import { Badge } from '@ionic-native/badge';
import { CountServiceProvider } from './../providers/count-service/count-service';
import { ProcessDataProvider } from './../providers/process-data/process-data';
import { ApplicationTabsPage } from './../pages/tabs-application/ApplicationTabs';
import { StorageServiceProvider } from './../providers/storage-service/storage-service';
import { SynchronizationProvider } from './../providers/synchronization/synchronization';
import { NetworkInformationProvider } from './../providers/network-information/network-information';
import { SocketProvider } from './../providers/socket/socket';
import { MyProcessesPage } from './../pages/my-processes/my-processes';
import { ClientDbProvider } from './../providers/client-db/client-db';
import { PushProvider } from '../providers/push/push';
import { LoginPage } from './../pages/login/login';
import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Deeplinks } from '@ionic-native/deeplinks';
import { ENV } from './../config/environment.dev';
import { Network } from '@ionic-native/network';
import { Events } from 'ionic-angular'
import { App } from 'ionic-angular/components/app/app';
import { Subscription } from 'rxjs/Subscription';
import { ProcessPage } from '../pages/process/process';
import { ErrorReportingProvider } from '../providers/error-reporting/error-reporting';
import { LoadingProvider } from '../providers/loading/loading';


@Component({
  templateUrl: 'app.html'
})

/*
ModuleID: app.components
Description: Main component of app which is created when the app is lanuched
Location: ./app
Author: Hassan
Version: 1.0.0
Modification history: none
*/
export class MyApp {
  @ViewChild('myNav') navController: NavController;
  public rootPage: any = LoginPage;

  logoutSubscription: Subscription; // listener for logout event
  loginPageRedirectSubscription: Subscription; // listener for logout event
  countsSubscription: Subscription; // listener for process counts
  notificationNavSubscription: Subscription; // listener for notification
  appSettingsUpdate: Subscription;
  MyProcesses; // a list containing the favorites processes
  redirectedProcess; // to check if app is launched from URL for a process
  appsettings;
  constructor(public deeplinks: Deeplinks,
    public platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public ClientDBMyProcesses: ClientDbMyProcessesProvider,
    public clientDbProvider: ClientDbProvider,
    public pushProvider: PushProvider,
    public socket: SocketProvider,
    public network: Network,
    public networkInformationProvider: NetworkInformationProvider,
    private Synchronization: SynchronizationProvider,
    private storageServiceProvider: StorageServiceProvider,
    public events: Events,
    public globalservice: ProcessDataProvider,
    private app: App,
    private clientDbAppResourcesProvider: ClientDbAppResourcesProvider,
    private countServiceProvider: CountServiceProvider,
    private badge: Badge,
    private clientDbMyProcessesProvider: ClientDbMyProcessesProvider,
    private clientDBProcessResources: ClientDbProcessResourcesProvider,//linter warning - used in internal method not detected by tslint
    private errorReportingProvider: ErrorReportingProvider,
    private loading: LoadingProvider) {

    this.network.onConnect().subscribe(() => {
      this.events.publish('internetisonnow', { network: true });
    })
    this.network.onDisconnect().subscribe(() => {
      this.events.publish('internetisonnow', { network: false });
    })
    this.appSettingsUpdate = this.clientDbAppResourcesProvider.settingsUpdater$.subscribe(item => {
      this.updateUserSetting();
    })
    
    this.appsettings = [];

  /**
   * Ionic platform ready hook..
   */
    platform.ready().then(() => {
      //determine if logged in or not and set navigatation to MyProcesses or login Screen accordingly..
      this.storageServiceProvider.getUser().then(result => {
        if(result.hasOwnProperty('LoggedOff')){
          if(result.LoggedOff){
            this.rootPage = LoginPage;
          }
          else{
            this.rootPage = ApplicationTabsPage;
          }
        }
        else{
          this.rootPage = ApplicationTabsPage;
        }
      }).catch(error => {
        this.rootPage = LoginPage;
      })

      //Initialise the web socket..
      socket.setUrl(ENV.SERVER_SOCKET_URL);
      socket.start();

      //Configure the status bar..
      statusBar.styleDefault();

      statusBar.backgroundColorByHexString('#071D49');
      //statusBar.overlaysWebView(true);
      statusBar.styleBlackOpaque();

      //init push notifications and device information...
      pushProvider.initPushNotifications();

      //start down sync service..
      Synchronization.startDownSync(true);


      //handle URL Redirects.. checks if the process is already present else subsctibe it or launch an access request
      this.deeplinks.route({
        '/about-us': MyProcessesPage,
      }).subscribe((match) => {
        this.globalservice.navidata = match.$args;
        var self = this;
        if (self.globalservice.navidata) {
          self.storageServiceProvider.getUser().then(result => {
            //url share redirect//
            let present: boolean = false;
            self.ClientDBMyProcesses.getAllMyProcesses().then(() => {
              self.MyProcesses = self.ClientDBMyProcesses.returnAllMyProcessData();
              for (var i = 0; i < self.MyProcesses.length; i++) {
                if (self.MyProcesses[i].ProcessID.toString() === self.globalservice.navidata.processId) {
                  present = true;
                  self.redirectedProcess = self.MyProcesses[i];
                  break;
                }
              }
              //if process present in user's directory
              if (present) {
                self.storageServiceProvider.getUser().then((user) => {
                  self.clientDBProcessResources.getAllProcessResources(self).then((scope: any) => {
                    self.clientDbAppResourcesProvider.getAllAppResources().then(() => {
                      self.globalservice.platformsettings = self.clientDbAppResourcesProvider.getAllPlatformSettings();
                      self.globalservice.processpermissions = self.clientDBProcessResources.getProcessSetting(self.redirectedProcess.ProcessID);
                      self.globalservice.processDiagnosticLog = self.globalservice.getDiagnosticLoggingFlag(self.globalservice.processpermissions.processGlobalSettings.Process_Settings.DIAGNOSTIC_LOGGING).toString();
                      self.globalservice.user = user;
                      self.globalservice.processId = self.redirectedProcess.ProcessID;
                      self.globalservice.name = self.redirectedProcess.ProcessName;
                      self.globalservice.processOrganization = self.redirectedProcess.OrganizationName;
                      self.globalservice.processImg = self.redirectedProcess.ProcessImage;
                      self.globalservice.processToastShown = false;

                      if (self.globalservice.navidata.route == 'processRedirect') {
                        self.globalservice.navidata = null; // very important
                        self.app.getRootNav().push(ProcessPage);
                      }
                      else if (self.globalservice.navidata.route == 'formRedirect') {
                        this.globalservice.reference = decodeURI(self.globalservice.navidata.reference);
                        this.globalservice.workflowId = self.globalservice.navidata.workflowId.toString();
                        this.globalservice.actualFormId = self.globalservice.navidata.formId;
                        self.globalservice.navidata = null;
                        self.app.getRootNav().setRoot(ApplicationTabsPage);
                        self.app.getRootNav().push(ProcessPage);
                        this.app.getRootNav().push(FormPage);
                      }
                    });
                  });
                });
              }
              else {
                if (this.globalservice.navidata) {//url share redirect
                  this.storageServiceProvider.getUser().then((user) => {
                    var params = {
                      userToken: user.AuthenticationToken,
                      processId: this.globalservice.navidata.processId.toString(),
                      diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
                      operationType : 'USER'
                    };
                    this.loading.presentLoading("Checking Process Permissions...", 10000);
                    var DirectoryResult = this.socket.callWebSocketService('validateProcessForUser', params);
                    DirectoryResult.then((result) => {
                      try {
                        this.loading.hideLoading();
                        if (result.Status) {
                          if (result.Status === 'Subscribed' || result.Status === 'AlreadySubscribed') {
                            this.globalservice.navidata = null;
                            alert('Process is subscribed');
                          }
                          else if (result.Status === 'NoPermission') {
                            this.app.getRootNav().push(AccessRequestPage, params);
                          }
                        }
                        else {
                          this.globalservice.navidata = null;
                        }
                      }
                      catch (error) {
                        this.globalservice.navidata = null;
                        console.log(error);
                      }
                    }).catch(error => {
                      this.globalservice.navidata = null;
                      if (error != 'NoConnection') {
                        this.errorReportingProvider.logErrorOnAppServer('Directory Error',
                          'Error while retrieving directory',
                          user.AuthenticationToken,
                          '0',
                          'DirectoryPage(socket.validateProcessForUser)',
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
            });
          }, error => {
            this.app.getRootNav().setRoot(LoginPage)
          })
        }
      }, (nomatch) => {
      });

      //Event listener for logout..
      this.logoutSubscription = this.Synchronization.logout$.subscribe(item => {
        if (item) {
          this.logout();
        }
      })

      //Event listener for login page regirect(device auto logoff)..
      this.loginPageRedirectSubscription = this.Synchronization.loginRedirectSource$.subscribe(item => {
        if(item){
          this.app.getRootNav().setRoot(LoginPage);
        }
        
      })

      //counts change subscriber to set the application badge counts on counts changed through sync..
      this.countsSubscription = this.countServiceProvider.navItem$
        .subscribe(notificationCounts => {
          var applicationBadgeCount = 0, todocount = 0, inboxCount = 0;
          if (notificationCounts) {
            for (var ProcessID in notificationCounts) {
              if (notificationCounts[ProcessID]) {
                todocount += parseInt(notificationCounts[ProcessID].TaskCount);
                inboxCount += parseInt(notificationCounts[ProcessID].InboxCount);
              }
            }
            applicationBadgeCount = applicationBadgeCount + todocount + inboxCount;
            this.badge.set(applicationBadgeCount);
          }
        })

      //Push notification redirects subscriber
      this.notificationNavSubscription = this.pushProvider.navToNotification$
        .subscribe((notification: any) => {

          //For Navigation baseed on the NotificationTypes
          this.globalservice.navidata = notification;

          var self = this;
          let redirectedProcess: any;
          let present: boolean = false;
          //check if process present in the user's processes
          self.clientDbMyProcessesProvider.getAllMyProcesses().then(() => {
            var MyProcesses = self.clientDbMyProcessesProvider.returnAllMyProcessData();
            for (var i = 0; i < MyProcesses.length; i++) {
              if (MyProcesses[i].ProcessID.toString() === notification.additionalData.ProcessId) {
                redirectedProcess = MyProcesses[i];
                present = true;
                break;
              }
            }
            //navigate to the process
            if (present) {
              self.storageServiceProvider.getUser().then((user) => {
                self.clientDBProcessResources.getAllProcessResources(self).then((scope: any) => {
                  self.clientDbAppResourcesProvider.getAllAppResources().then(() => {
                    self.globalservice.platformsettings = self.clientDbAppResourcesProvider.getAllPlatformSettings();
                    self.globalservice.processpermissions = self.clientDBProcessResources.getProcessSetting(redirectedProcess.ProcessID);
                    self.globalservice.processDiagnosticLog = self.globalservice.getDiagnosticLoggingFlag(self.globalservice.processpermissions.processGlobalSettings.Process_Settings.DIAGNOSTIC_LOGGING).toString();
                    self.globalservice.user = user;
                    self.globalservice.processId = redirectedProcess.ProcessID;
                    self.globalservice.name = redirectedProcess.ProcessName;
                    self.globalservice.processOrganization = redirectedProcess.OrganizationName;
                    self.globalservice.processImg = redirectedProcess.ProcessImage;
                    self.globalservice.processToastShown = false;

                    if (self.globalservice.navidata.additionalData.NotificationType === 'TaskAlert') {
                      self.app.getRootNav().setRoot(ApplicationTabsPage);
                      self.app.getRootNav().push(ProcessPage, { tabIndex: 0 });
                    }
                    else if (self.globalservice.navidata.additionalData.NotificationType === 'NotificationAlert') {
                      self.app.getRootNav().setRoot(ApplicationTabsPage);
                      self.app.getRootNav().push(ProcessPage, { tabIndex: 3 });
                    }
                  });
                });
              });
            }
            else {
              this.app.getRootNav().setRoot(ApplicationTabsPage, { tabIndex: 0 });
            }
          });
        })
      splashScreen.hide();
    });

  }

   updateUserSetting() {
    this.platform.ready().then(() => {
      try {
        var temp = this.clientDbAppResourcesProvider.getAllPlatformSettings();
        this.appsettings;
        for(var i = 0; i < temp.length; i++)
        {
          if (temp[i].SettingName == 'DIAGNOSTIC_LOGGING') {
            this.appsettings = temp[i]
            break;
          }
        }
        if(this.appsettings.Value)
        {
          this.globalservice.appDiagnosticLog = this.globalservice.getDiagnosticLoggingFlag(this.appsettings.Value).toString()
        }
        //this.userSetting = this.clientDbAppResourcesProvider.getAppSettings();
  
        //Cater for user Setting Completely Empty.. During flush on full data load..
      }
      catch (error) {
        this.storageServiceProvider.getUser().then((user) => {
          this.errorReportingProvider.logErrorOnAppServer('App Settings Error',
            'Error while loading application settings',
            user.AuthenticationToken,
            '',
            'AppSettingsPage.updateUserSetting',
            error.message ? error.message : '',
            error.stack ? error.stack : '',
            new Date().toTimeString(),
            'open',
            'Platform',
            '');
        });
      }
    });
  }

  /**
   *Logout event handler flushses data and clears all services and logs out
   */
  logout() {
    if (this.Synchronization.isLoggedIn()) {
      this.Synchronization.setLogout(false);
      this.storageServiceProvider.getUser().then(result => {
        if (result.hasOwnProperty('AuthenticationToken')) {
          //call webServer for graceful logout..
          var socketParameters = {
            userToken: result.AuthenticationToken,
            diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
            operationType : 'APPLICATION'
          };
          this.socket.callWebSocketService('logoutDevice', socketParameters).then((response) => {
            response;
          }).catch(error => {
            if (error != 'NoConnection') {
              this.errorReportingProvider.logErrorOnAppServer('Logoff Error',
                'Error while loging off',
                result.AuthenticationToken,
                '0',
                'MyApp(socket.logOffDevice)',
                error.message ? error.message : '',
                error.stack ? error.stack : '',
                new Date().toTimeString(),
                'open',
                'Platform',
                '');
            }
          });
          this.clientDbProvider.deleteDBTables();
          this.storageServiceProvider.removeUser();
          this.storageServiceProvider.removeNotificationCounts();
          this.storageServiceProvider.removeAllTasks();
          this.badge.clear();
          this.Synchronization.clearValuesInDBServices();
          this.app.getRootNav().setRoot(LoginPage);
        }
      });
    }
  }

}
