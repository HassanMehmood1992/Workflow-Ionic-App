/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DirectoryPopupPageModule
Description: Module for directory popup page to add any additional dependencies.
Location: ./pages/DirectoryPopupPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DirectoryPopupPage } from './directory-popup';

@NgModule({
  declarations: [
   // DirectoryPopupPage,
  ],
  imports: [
    IonicPageModule.forChild(DirectoryPopupPage),
  ],
})
export class DirectoryPopupPageModule {}
