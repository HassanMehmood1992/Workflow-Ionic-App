/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: NotificationsPageModule
Description: Module for notification to add any additional dependencies.
Location: ./pages/NotificationsPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationsPage } from './notifications';

@NgModule({
  declarations: [
   // NotificationsPage,
  ],
  imports: [
    IonicPageModule.forChild(NotificationsPage),
  ],
})
export class NotificationsPageModule {}
