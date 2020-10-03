/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DirectoryPageModule
Description: Module for directory page to add any additional dependencies.
Location: ./pages/DirectoryPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DirectoryPage } from './directory';

@NgModule({
  declarations: [
    //DirectoryPage,
  ],
  imports: [
    IonicPageModule.forChild(DirectoryPage),
  ],
})
export class DirectoryPageModule {}
