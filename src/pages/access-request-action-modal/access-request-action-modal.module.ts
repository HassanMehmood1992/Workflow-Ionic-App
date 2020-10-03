/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AccessRequestActionModalPageModule
Description: Module for access request pop up to add any additional dependencies.
Location: ./pages/AccessRequestActionModalPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccessRequestActionModalPage } from './access-request-action-modal';

@NgModule({
  declarations: [
    AccessRequestActionModalPage
  ],
  imports: [
    PipesModule,
    IonicPageModule.forChild(AccessRequestActionModalPage),
  ],
})
export class AccessRequestActionModalPageModule {}
