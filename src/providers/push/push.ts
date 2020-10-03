/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PushProvider
Description: Provides functionality to configure a push notification received on device.
Location: ./providers/PushProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { ReplaySubject } from 'rxjs';
import { ApplicationDataProvider } from './../application-data/application-data';
import { SynchronizationProvider } from './../synchronization/synchronization';
import { Injectable } from '@angular/core';
import { Push, PushObject } from '@ionic-native/push';
import { Device } from '@ionic-native/device';



/*
  Generated class for the PushProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PushProvider {

  private _navToNotification = new ReplaySubject;//Replay Subject to emitt push notification events
  navToNotification$ = this._navToNotification.asObservable();//observable to observe push notification events

  private _registrationId: string = '';//device push notification registration id 
  private _registrationType: string = '';//device push notification registration type
  private _manufacturer: string = '';//device manufacturer
  private _model: string = '';//device model
  private _platform: string = '';//device platform type
  private _uuid: string = '';//device uuid

  /**
   * Class constructor
   */
  constructor(private push: Push,
    private device: Device,
    private ApplicationDataProvider: ApplicationDataProvider,
    private Synchronization: SynchronizationProvider) {
  }

  /**
   * Getters
   */
  public get registrationId(): string {
    return this._registrationId;
  }
  get registrationType(): string {
    return this._registrationType;
  }
  get manufacturer(): string {
    return this._manufacturer;
  }
  get model(): string {
    return this._model;
  }
  get platform(): string {
    return this._platform;
  }
  get uuid(): string {
    return this._uuid;
  }

  /**
   * Initialise the device information and init 
   */
  initPushNotifications() {
    //init device information..
    this._manufacturer = this.device.manufacturer;
    this._model = this.device.model;
    this._platform = this.device.platform;
    this._uuid = this.device.uuid;

    this.ApplicationDataProvider.manufacturer = this.device.manufacturer;
    this.ApplicationDataProvider.model = this.device.model;
    this.ApplicationDataProvider.platform = this.device.platform;
    this.ApplicationDataProvider.uuid = this.device.uuid;


    // init push notifications
    const options: any = {
      android: {},
      ios: {
        alert: 'true',
        badge: true,
        sound: 'true'
      },
      windows: {},
      browser: {
        pushServiceURL: 'http://push.api.phonegap.com/v1/push'
      }
    };

    const pushObject: PushObject = this.push.init(options);

    //listener of push notifications
    pushObject.on('notification').subscribe((notification: any) => {
      //start up and down sync
      this.Synchronization.startUpSync();
      this.Synchronization.startDownSync(false);

      if (notification.additionalData.foreground === false) {
        this._navToNotification.next(notification);
      }
    });

    //listener for successful push registration event
    pushObject.on('registration').subscribe((registration: any) => {
      this._registrationId = registration.registrationId;
      this._registrationType = registration.registrationType;
    });
  }

}
