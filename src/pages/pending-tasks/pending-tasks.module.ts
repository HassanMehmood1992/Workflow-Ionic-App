/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PendingTasksPageModule
Description: Module for pending tasks to add any additional dependencies.
Location: ./pages/PendingTasksPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/


import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PendingTasksPage } from './pending-tasks';

@NgModule({
  declarations: [
  //  PendingTasksPage,
  ],
  imports: [
    IonicPageModule.forChild(PendingTasksPage),
  ],
})
export class PendingTasksPageModule {}
