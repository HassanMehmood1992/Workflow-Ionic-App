/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: LookupDetailsModalPageModule
Description: Module for lookup details modal page to add any additional dependencies.
Location: ./pages/LookupDetailsModalPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LookupDetailsModalPage } from './lookup-details-modal';

@NgModule({
  declarations: [
    LookupDetailsModalPage,
  ],
  imports: [
    IonicPageModule.forChild(LookupDetailsModalPage),
  ],
})
export class LookupDetailsModalPageModule {}
