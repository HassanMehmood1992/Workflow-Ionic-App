/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ReportsPageModule
Description: Module for report page to add any additional dependencies.
Location: ./pages/ReportsPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportsPage } from './reports';

@NgModule({
  declarations: [
   // ReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportsPage),
  ],
})
export class ReportsPageModule {}
