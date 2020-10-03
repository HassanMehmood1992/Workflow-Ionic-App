/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: MyProcessesPageModule
Description: Module for my processes page to add any additional dependencies.
Location: ./pages/MyProcessesPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyProcessesPage } from './my-processes';

@NgModule({
  declarations: [
  //  MyProcessesPage,
  ],
  imports: [
    IonicPageModule.forChild(MyProcessesPage),
  ],
})
export class MyProcessesPageModule {}
