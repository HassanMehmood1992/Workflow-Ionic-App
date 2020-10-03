/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProxyApproverModalPageModule
Description: Module for proxy approver modal to add any additional dependencies.
Location: ./pages/ProxyApproverModalPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProxyApproverModalPage } from './proxy-approver-modal';

@NgModule({
  declarations: [
    ProxyApproverModalPage
  ],
  imports: [
    IonicPageModule.forChild(ProxyApproverModalPage)
    
  ],
})
export class ProxyApproverModalPageModule {}
