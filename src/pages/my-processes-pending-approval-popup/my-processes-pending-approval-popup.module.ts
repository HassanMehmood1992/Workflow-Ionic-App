/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: MyProcessesPendingApprovalPopupPageModule
Description: Module for pending approval popup to add any additional dependencies.
Location: ./pages/MyProcessesPendingApprovalPopupPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/


import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyProcessesPendingApprovalPopupPage } from './my-processes-pending-approval-popup';

@NgModule({
  declarations: [
  //  MyProcessesPendingApprovalPopupPage,
  ],
  imports: [
    IonicPageModule.forChild(MyProcessesPendingApprovalPopupPage),
  ],
})
export class MyProcessesPendingApprovalPopupPageModule {}
