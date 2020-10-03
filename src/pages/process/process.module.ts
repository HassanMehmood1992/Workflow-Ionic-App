/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessPageModule
Description: Module for process page to add any additional dependencies.
Location: ./pages/ProcessPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProcessPage } from './process';

@NgModule({
  declarations: [
   // ProcessPage,
  ],
  imports: [
    IonicPageModule.forChild(ProcessPage),
  ]
})
export class ProcessPageModule {}
