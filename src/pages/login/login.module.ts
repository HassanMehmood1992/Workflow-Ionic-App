/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: LoginPageModule
Description: Module for login page to add any additional dependencies.
Location: ./pages/LoginPageModule
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';

@NgModule({
  declarations: [
   // LoginPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
  ],
})
export class LoginPageModule {}
