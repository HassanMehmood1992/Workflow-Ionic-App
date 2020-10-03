/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ReportPageModule
Description: Module for report page to add any additional dependencies.
Location: ./pages/ReportPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportPage } from './report';

@NgModule({
  declarations: [
   // ReportPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportPage),
  ],
})
export class ReportPageModule {}
