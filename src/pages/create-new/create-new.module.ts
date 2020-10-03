/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: CreateNewPageModule
Description: Module for create new page to add any additional dependencies.
Location: ./pages/CreateNewPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateNewPage } from './create-new';

@NgModule({
  declarations: [
   // CreateNewPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateNewPage),
  ],
})
export class CreateNewPageModule {}
