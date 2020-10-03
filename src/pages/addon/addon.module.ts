/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AddonPageModule
Description: Module for addon page to add any additional dependencies.
Location: ./pages/AddonPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddonPage } from './addon';

@NgModule({
  declarations: [
   // AddonPage,
  ],
  imports: [
    IonicPageModule.forChild(AddonPage),
  ],
})
export class AddonPageModule {}
