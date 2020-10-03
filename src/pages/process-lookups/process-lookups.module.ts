
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessLookupsPageModule
Description: Module for process lookups page to add any additional dependencies.
Location: ./pages/ProcessLookupsPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProcessLookupsPage } from './process-lookups';

@NgModule({
  declarations: [
   // ProcessLookupsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProcessLookupsPage),
  ],
})
export class ProcessLookupsPageModule {}
