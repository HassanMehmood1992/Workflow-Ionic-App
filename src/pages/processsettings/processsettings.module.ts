/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcesssettingsPageModule
Description: Module for process settings to add any additional dependencies.
Location: ./pages/ProcesssettingsPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProcesssettingsPage } from './processsettings';

@NgModule({
  declarations: [
   // ProcesssettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProcesssettingsPage),
  ],
})
export class ProcesssettingsPageModule {}
