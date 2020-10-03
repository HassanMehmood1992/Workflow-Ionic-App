/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: LookupPageModule
Description: Module for lookup page to add any additional dependencies.
Location: ./pages/LookupPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LookupPage } from './lookup';

@NgModule({
  declarations: [
   // LookupPage,
  ],
  imports: [
    IonicPageModule.forChild(LookupPage),
  ],
})
export class LookupPageModule {}
