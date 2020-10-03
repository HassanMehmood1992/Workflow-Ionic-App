/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: components.module
Description: Contains the information about components which can be imported to RapidFlow App
Location: ./components
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { NgModule } from '@angular/core';
import { NetworkComponent } from './network/network';
import { AppProcessLookupComponent } from './app-process-lookup/app-process-lookup';
import { AppPeoplePickerComponent } from './app-people-picker/app-people-picker';
import { AppRepeatingTableComponent } from './app-repeating-table/app-repeating-table';
import { AppDatabaseLookupComponent } from './app-database-lookup/app-database-lookup';
import { AppFileAttachmentComponent } from './app-file-attachment/app-file-attachment';
import { AppNumberFieldComponent } from './app-number-field/app-number-field';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker';
import { AppUrlComponent } from './app-url/app-url';
import { ListItemComponent } from './list-item/list-item';
import { FormListItemComponent } from './form-list-item/form-list-item';
import { CustomDialogComponent } from './custom-dialog/custom-dialog';
@NgModule({
	declarations: [ListItemComponent,
    FormListItemComponent,
    CustomDialogComponent
    ],
	imports: [],
	exports: [ListItemComponent,
    FormListItemComponent,
    CustomDialogComponent]
})
export class ComponentsModule {}
