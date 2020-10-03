/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AccessRequestPageModule
Description: Module for access request to add any additional dependencies.
Location: ./pages/AccessRequestPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccessRequestPage } from './access-request';

@NgModule({
  declarations: [
  //  AccessRequestPage,
  ],
  imports: [
    IonicPageModule.forChild(AccessRequestPage),
  ],
})
export class AccessRequestPageModule {}
