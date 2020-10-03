/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AddonsPageModule
Description: Module for addons page to add any additional dependencies.
Location: ./pages/AddonsPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddonsPage } from './addons';

@NgModule({
  declarations: [
    //AddonsPage,
  ],
  imports: [
    IonicPageModule.forChild(AddonsPage),
  ],
})
export class AddonsPageModule {}
