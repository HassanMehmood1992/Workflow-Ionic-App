/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: OutOfOfficeModalPageModule
Description: Module for out of office modal to add any additional dependencies.
Location: ./pages/OutOfOfficeModalPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/


import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OutOfOfficeModalPage } from './out-of-office-modal';

@NgModule({
  declarations: [
    OutOfOfficeModalPage
  ],
  imports: [
    IonicPageModule.forChild(OutOfOfficeModalPage)
  ],
})
export class OutOfOfficeModalPageModule {}
