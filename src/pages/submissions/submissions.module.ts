/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: SubmissionsPageModule
Description: Module for submissions page to add any additional dependencies.
Location: ./pages/SubmissionsPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SubmissionsPage } from './submissions';

@NgModule({
  declarations: [
  //  SubmissionsPage,
  ],
  imports: [
    IonicPageModule.forChild(SubmissionsPage),
  ],
})
export class SubmissionsPageModule {}
