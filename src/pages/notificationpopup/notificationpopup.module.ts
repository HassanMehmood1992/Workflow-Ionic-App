/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: NotificationpopupPageModule
Description: Module for notification popup to add any additional dependencies.
Location: ./pages/NotificationpopupPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationpopupPage } from './notificationpopup';

@NgModule({
  declarations: [
   // NotificationpopupPage,
  ],
  imports: [
    IonicPageModule.forChild(NotificationpopupPage),
  ],
})
export class NotificationpopupPageModule {}
