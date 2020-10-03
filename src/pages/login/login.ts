import { AlertController } from 'ionic-angular';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-login
Description: Renders login page. Contains methods to authenticate user and store user in local storage. 
Location: ./pages/page-login
Author: Hassan
Version: 1.0.0
Modification history: none
*/


/**
 * Importing neccassary liberaries and modules for this class 
 */
import { ErrorReportingProvider } from './../../providers/error-reporting/error-reporting';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { LoadingProvider } from './../../providers/loading/loading';
import { DbDataDumpProvider } from './../../providers/db-data-dump/db-data-dump';
import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
import { EncryptionProvider } from './../../providers/encryption/encryption';
import { NetworkInformationProvider } from './../../providers/network-information/network-information';
import { SocketProvider } from './../../providers/socket/socket';
import { ApplicationTabsPage } from './../tabs-application/ApplicationTabs';
import { Component } from '@angular/core';
import { IonicPage, NavController, Events, Platform } from 'ionic-angular';
import { PushProvider } from './../../providers/push/push';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
/**
 * 
 * Implements login page that is displayed as default page of the app when app is launched
 * @export
 * @class LoginPage
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  loginForm: FormGroup; // Form controls group of login form controls
  username: AbstractControl; // 511 ID of AbbVie internal users
  password: AbstractControl; // password of the user
  attempts: number = 0; // Number of attempts stored locally to check if user has tried for three times with invalid password

/**
 * Creates an instance of LoginPage.
 * @param {LoadingProvider} loading 
 * @param {NavController} navCtrl 
 * @param {PushProvider} pushProvider 
 * @param {SocketProvider} socket 
 * @param {FormBuilder} formBuilder 
 * @param {EncryptionProvider} encryptionProvider 
 * @param {SynchronizationProvider} Synchronization 
 * @param {DbDataDumpProvider} DBDataDump 
 * @param {StorageServiceProvider} storageServiceProvider 
 * @param {ErrorReportingProvider} errorReportingProvider 
 * @param {NetworkInformationProvider} networkservice 
 * @param {Events} events 
 * @memberof LoginPage
 */
constructor(
    private loading: LoadingProvider,
    private navCtrl: NavController,
    private pushProvider: PushProvider,
    private socket: SocketProvider,
    private formBuilder: FormBuilder,
    private encryptionProvider: EncryptionProvider,
    private Synchronization: SynchronizationProvider,
    private DBDataDump: DbDataDumpProvider,
    private storageServiceProvider: StorageServiceProvider,
    private errorReportingProvider: ErrorReportingProvider,
    public networkservice: NetworkInformationProvider,
    public events: Events,
    public alertCtrl: AlertController,
    public platform: Platform) {


    this.loginForm = this.formBuilder.group({
      'username': ['', Validators.compose([Validators.required])],
      'password': ['', [Validators.required]]
    });
    this.username = this.loginForm.controls['username'];
    this.password = this.loginForm.controls['password'];
  }

  ionViewDidLoad() {
  }
  ionViewDidEnter() {
    this.networkservice.appAlert = '';
  }

  /**
   * Login the user
   */
  login() {
    if (!this.loginForm.valid) {
      this.username;
      for (var i in this.loginForm.controls) {
        this.loginForm.controls[i].markAsTouched();
      }
    }
    else {
      var username: string = this.username.value.toString().toLowerCase();
      if (username.substring(0, 10) !== 'abbvienet\\') {
        username = 'abbvienet\\' + this.username.value.toString();
      }

      this.platform.ready().then(() => {
        //if device auto logged off, determine if user is same
        this.storageServiceProvider.getUser().then(result => {
          if(result.hasOwnProperty('LoginID')){
            if(result.LoginID.toLowerCase() === username.toLowerCase()){//same user logging in..
              this.existingUserLogin(username, result.AuthenticationToken);
            }
            else{//logoff
              this.logoff();
            }
          }
          else{//logoff
            this.logoff();
          }
        }).catch(error => {//user not present
          this.newUserLogin(username);
        })
      });
    }
  }

  /**
   * Re-Login Existing User Session
   * @param username
   */
  existingUserLogin(username, authenticationToken){

    let authenticateUser = {
      logOnId: this.encryptionProvider.encryptData(username.toLowerCase()),
      password: this.encryptionProvider.encryptData(this.password.value.toString()),
      deviceId: this.pushProvider.uuid,
      authenticationToken: authenticationToken,
      diagnosticLogging: "false",
      operationType : 'USER'
    };

    this.loading.presentLoading("Logging in please wait...", 20000);

    var loginResult = this.socket.callWebSocketService('reLoginUser', authenticateUser);

    loginResult.then((result) => {
      try {
        this.loading.hideLoading();
        if(result.Error){
          this.errorReportingProvider.logErrorOnAppServer('Login Error',
          'Error while logging in with server',
          '',
          '0',
          'LoginPage(socket.AuthenticateUser)',
          result.Error,
          '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');

        }
        else if (result === 'InvalidCredentials'){
          alert('Invalid Username or Password');
        }
        else if(result === 'true'){
          this.Synchronization.stopSync = false;
          this.storageServiceProvider.getUser().then(user => {
            user.LoggedOff = false;
            this.storageServiceProvider.setUser(user);
            this.navCtrl.setRoot(ApplicationTabsPage);
          });
        }
        else {
          this.logoff();
        }
      }
      catch (error) {
        this.errorReportingProvider.logErrorOnAppServer('Login Error',
        'Error while logging in with server',
        '',
        '0',
        'LoginPage(socket.AuthenticateUser)',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
      }
    }).catch(error => {
      this.loading.hideLoading();
      if (error != 'NoConnection') {
        this.errorReportingProvider.logErrorOnAppServer('Login Error',
          'Error while logging in with server',
          '',
          '0',
          'LoginPage(socket.AuthenticateUser)',
          error.message ? error.message : '',
          error.stack ? error.stack : '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');
      }
    });
  }

  /**
   * Login new User
   * @param username
   */
  newUserLogin(username){
    var deviceInformation = {
      Model: this.pushProvider.model,
      Manufacturer: this.pushProvider.manufacturer,
      PushNotificationToken: this.pushProvider.registrationId
    };

    var authenticateUser = {
      logOnId: this.encryptionProvider.encryptData(username.toLowerCase()),
      password: this.encryptionProvider.encryptData(this.password.value.toString()),
      deviceId: this.pushProvider.uuid,
      platform: this.pushProvider.platform,
      deviceInformation: JSON.stringify(deviceInformation),
      diagnosticLogging: 'false',
      operationType : 'APPLICATION'
    };

    this.loading.presentLoading("Logging in please wait...", 20000);

    var loginResult = this.socket.callWebSocketService('AuthenticateUser', authenticateUser);

    loginResult.then((result) => {
      try {
        this.loading.hideLoading();
        if(result.Error){
          this.errorReportingProvider.logErrorOnAppServer('Login Error',
          'Error while logging in with server',
          '',
          '0',
          'LoginPage(socket.AuthenticateUser)',
          result.Error,
          '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');
        }
        else if(result === 'UserInvalid'){
          alert('Your user account is invalid. Please contact Service Desk for Support.');
        }
        else if (result === '') {
          this.attempts++;
          if (this.attempts < 4) {
            alert('Invalid Username or Password');
          }
          else {
            alert('Your user might be disabled or password has been expired.. please contact service desk ');
            this.networkservice.appAlert = 'Your account has been disabled. Please contact the service desk or your local support';
          }
        }
        else if (typeof result === 'object') {
          //Get the user here and match with the logging in user..
          if (result[0].Active === 'False') {
            alert('Your user might be disabled or password has been expired.. please contact service desk ');
            this.networkservice.appAlert = 'Your account has been disabled. Please contact the service desk or your local support';
          }
          else {
            this.networkservice.appAlert = '';
            this.storageServiceProvider.getUser().then(user => {
              if (result[0].Email === user.Email) {
                this.storageServiceProvider.setUser(result[0]);
                this.navCtrl.setRoot(ApplicationTabsPage);
              }
              else {
                //clear local data.. set new user and call full data load..
              }
            }).catch(error => {
              this.Synchronization.stopSync = false;
              this.Synchronization.setFullDataLoad(true);
              this.Synchronization.initDB();
              this.storageServiceProvider.setUser(result[0]);
              /** Dump Data in SQLite */
              this.DBDataDump.dumpData().then(() => {
                /** Initiiate synchronization Routine */
                this.Synchronization.setFullDataLoad(false);
                this.Synchronization.startFullDataLoad().then(() => {
                }).catch((e) => {
                  this.errorReportingProvider.logErrorOnAppServer('Login Error',
                  'There was an error while performing fullDataLoad',
                  '',
                  '0',
                  'Synchronization.startFullDataLoad',
                  e.message ? e.message : '',
                  e.stack ? e.stack : '',
                  new Date().toTimeString(),
                  'open',
                  'Platform',
                  '');
                });
              }).catch(error => {
              });
              this.navCtrl.setRoot(ApplicationTabsPage);
            });
          }
        }
        else {
          alert('Error in login result')
        }
      }
      catch (error) {
        this.errorReportingProvider.logErrorOnAppServer('Login Error',
        'Error while logging in with server',
        '',
        '0',
        'LoginPage(socket.AuthenticateUser)',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
      }
    }).catch(error => {
      this.loading.hideLoading();
      if (error != 'NoConnection') {
        this.errorReportingProvider.logErrorOnAppServer('Login Error',
          'Error while logging in with server',
          '',
          '0',
          'LoginPage(socket.AuthenticateUser)',
          error.message ? error.message : '',
          error.stack ? error.stack : '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');
      }
    });
  }

  /**
   * Flush local data and redirect to
   * login screen
   */
  logoff(){
    this.alertCtrl.create({
      title: '',
      subTitle: 'Your session has expired, please login again',
      buttons: [
        {
          text: 'OK',
          role: 'ok',
          handler: () => {
          }
        }
      ]
    }).present();
    this.Synchronization.setLogout(true);
  }

}
