/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DirectivesModule
Description: Package all directives in a single module to be included in App
Location: ./directives
Author: Hassan
Version: 1.0.0
Modification history: none
*/


//required imports
import { NgModule } from '@angular/core';
import { Focuser } from './focuser/focuser';
import { ShowHideSortSearchDirective } from './show-hide-sort-search/show-hide-sort-search';
import { AppAutosizeDirective } from './app-autosize/app-autosize';
@NgModule({//module delcaration
	declarations: [],
	imports: [],
	exports: []
})
export class DirectivesModule {}
