/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: LookupActionModalPageModule
Description: Module for lookup action modal to add any additional dependencies.
Location: ./pages/LookupActionModalPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LookupActionModalPage } from './lookup-action-modal';

@NgModule({
  declarations: [
    LookupActionModalPage,
  ],
  imports: [
    IonicPageModule.forChild(LookupActionModalPage),
  ],
})
export class LookupActionModalPageModule {}
