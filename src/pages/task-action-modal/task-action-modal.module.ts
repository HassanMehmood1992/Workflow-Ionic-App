/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: TaskActionModalPageModule
Description: Module for task action modal page to add any additional dependencies.
Location: ./pages/TaskActionModalPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TaskActionModalPage } from './task-action-modal';

@NgModule({
  declarations: [
    TaskActionModalPage
  ],
  imports: [
    IonicPageModule.forChild(TaskActionModalPage),
    PipesModule
  ],
})
export class TaskActionModalPageModule {}
