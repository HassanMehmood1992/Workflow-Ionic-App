/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PivotPageModule
Description: Module for pivot page to add any additional dependencies.
Location: ./pages/ReportPageModule
Author: Hassan
Version: 1.0.0
Modification history: PivotPageModule
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PivotPage } from './pivot';

@NgModule({
  declarations: [
   // PivotPage,
  ],
  imports: [
    IonicPageModule.forChild(PivotPage),
  ],
})
export class PivotPageModule {}
