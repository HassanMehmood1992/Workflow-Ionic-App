/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AppProcessDblookupPopupPageModule
Description: Module for process database lookup popup to add any additional dependencies.
Location: ./pages/AppProcessDblookupPopupPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppProcessDblookupPopupPage } from './app-process-dblookup-popup';

@NgModule({
  declarations: [
   // AppProcessDblookupPopupPage,
  ],
  imports: [
    IonicPageModule.forChild(AppProcessDblookupPopupPage),
  ],
})
export class AppProcessDblookupPopupPageModule {}
