
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessMetricsPageModule
Description: Module for process metrics page to add any additional dependencies.
Location: ./pages/ProcessMetricsPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProcessMetricsPage } from './process-metrics';

@NgModule({
  declarations: [
   // ProcessMetricsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProcessMetricsPage),
  ],
})
export class ProcessMetricsPageModule {}
