
import { CustomDialogComponent } from './../components/custom-dialog/custom-dialog';
import { FormListItemComponent } from './../components/form-list-item/form-list-item';
import { ListItemComponent } from './../components/list-item/list-item';

/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: app.module
Description: Main module of app which is contains all the imports of components/directives/pipes etc.
Location: ./app
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { DateTimePickerComponent } from './../components/date-time-picker/date-time-picker';
import { AppNumberFieldComponent } from './../components/app-number-field/app-number-field';
import { AppDynamicNumberDirective } from './../directives/app-dynamic-number/app-dynamic-number';
import { ProcessMetricsPage } from './../pages/process-metrics/process-metrics';
import { AppAutosizeDirective } from './../directives/app-autosize/app-autosize';
import { KeysPipe } from './../pipes/keys/keys';
import { AppProcessDblookupPopupPage } from './../pages/app-process-dblookup-popup/app-process-dblookup-popup';
import { AppFileAttachmentComponent } from './../components/app-file-attachment/app-file-attachment';
import { AppDatabaseLookupComponent } from './../components/app-database-lookup/app-database-lookup';
import { AppRepeatingTableComponent } from './../components/app-repeating-table/app-repeating-table';
import { AppPeoplePickerComponent } from './../components/app-people-picker/app-people-picker';
import { AppProcessLookupPopupPage } from './../pages/app-process-lookup-popup/app-process-lookup-popup';
import { AppProcessLookupComponent } from './../components/app-process-lookup/app-process-lookup';
import { NgIf,NgFor} from '@angular/common';
import { PipesModule } from './../pipes/pipes.module';
import { BacknavigationProvider } from './../providers/backnavigation/backnavigation';
import { AddonPage } from './../pages/addon/addon';
import { NotificationpopupPage } from './../pages/notificationpopup/notificationpopup';
import { LookupPage } from './../pages/lookup/lookup';
import { MyProcessesPendingApprovalPopupPage } from './../pages/my-processes-pending-approval-popup/my-processes-pending-approval-popup';
import { DirectoryPopupPage } from './../pages/directory-popup/directory-popup';
import { ShowHideSortSearchDirective } from './../directives/show-hide-sort-search/show-hide-sort-search';
import { Focuser } from './../directives/focuser/focuser';
import { FormPage } from './../pages/form/form';
import { AccessRequestPage } from './../pages/access-request/access-request';
import { NetworkComponent } from './../components/network/network';
import { Badge } from '@ionic-native/badge';
import { MSAdal } from '@ionic-native/ms-adal';
import { SynchronizationProvider } from './../providers/synchronization/synchronization';
import { ProcesssettingsPage } from './../pages/processsettings/processsettings';
import { NotificationsPage } from './../pages/notifications/notifications';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { ProcessPage } from './../pages/process/process';
import { ProcessLookupsPage } from './../pages/process-lookups/process-lookups';
import { AddonsPage } from './../pages/addons/addons';
import { PivotsPage } from './../pages/pivots/pivots';
import { ReportsPage } from './../pages/reports/reports';
import { SubmissionsPage } from './../pages/submissions/submissions';
import { CreateNewPage } from './../pages/create-new/create-new';
import { PendingTasksPage } from './../pages/pending-tasks/pending-tasks';
import { MyProcessesPage } from './../pages/my-processes/my-processes';
import { DirectoryPage } from './../pages/directory/directory';
import { AppSettingsPage } from './../pages/app-settings/app-settings';
import { LoginPage } from './../pages/login/login';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler, IonicPageModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { ApplicationTabsPage } from '../pages/tabs-application/ApplicationTabs';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { Push } from '@ionic-native/push';
import { Device } from '@ionic-native/device';
import { ClientDbProvider } from '../providers/client-db/client-db';
import { PushProvider } from '../providers/push/push';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing'
import { NativeStorage } from '@ionic-native/native-storage';
import { Deeplinks } from '@ionic-native/deeplinks';
import { SocketProvider } from '../providers/socket/socket';
import { ScrollableTabs } from './../components/scrollable-tabs/scrollable-tabs';
import { HttpModule } from '@angular/http';
import { NetworkInformationProvider } from '../providers/network-information/network-information';
import { ProcessDataProvider } from '../providers/process-data/process-data';
import { ClientDbAppResourcesProvider } from '../providers/client-db-app-resources/client-db-app-resources';
import { ClientDbMyProcessesProvider } from '../providers/client-db-my-processes/client-db-my-processes';
import { ClientDbNotificationsProvider } from '../providers/client-db-notifications/client-db-notifications';
import { ClientDbProcessResourcesProvider } from '../providers/client-db-process-resources/client-db-process-resources';
import { ClientDbSynchronizationTasksProvider } from '../providers/client-db-synchronization-tasks/client-db-synchronization-tasks';
import { ClientDbUserProfilesProvider } from '../providers/client-db-user-profiles/client-db-user-profiles';
import { ClientDbProcessWorkflowsProvider } from '../providers/client-db-process-workflows/client-db-process-workflows';
import { ClientDbWorkflowSubmissionsProvider } from '../providers/client-db-workflow-submissions/client-db-workflow-submissions';
import { ClientDbProcessLookupObjectsProvider } from '../providers/client-db-process-lookup-objects/client-db-process-lookup-objects';
import { ClientDbProcessLookupsDataProvider } from '../providers/client-db-process-lookups-data/client-db-process-lookups-data';
import { ClientDbProcessObjectsProvider } from '../providers/client-db-process-objects/client-db-process-objects';
import { HelperProvider } from '../providers/helper/helper';
import { DbDataDumpProvider } from '../providers/db-data-dump/db-data-dump';
import { StorageServiceProvider } from '../providers/storage-service/storage-service';
import { EncryptionProvider } from '../providers/encryption/encryption';
import { LoadingProvider } from '../providers/loading/loading';
import { ErrorReportingProvider } from '../providers/error-reporting/error-reporting';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OrderModule } from 'ngx-order-pipe';
import { CountServiceProvider } from '../providers/count-service/count-service';
import { SortProvider } from '../providers/sort/sort';
import { PivotPage } from '../pages/pivot/pivot';
import { ReportPage } from '../pages/report/report';
import { FlexLayoutModule } from "@angular/flex-layout";
import { ProcessFormProvider } from '../providers/process-form/process-form';
import { WorkflowRoutingProvider } from '../providers/workflow-routing/workflow-routing';
import { ApplicationDataProvider } from '../providers/application-data/application-data';
import { ChartsModule} from 'ng2-charts'
import { CurrencyMaskModule } from 'ng2-currency-mask'
import { AppUrlPopupPage } from './../pages/app-url-popup/app-url-popup';
import { AppUrlComponent } from './../components/app-url/app-url';
import { FileprogressbarPage } from './../pages/fileprogressbar/fileprogressbar';
import { PeoplePickerPage } from './../pages/people-picker/people-picker';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

@NgModule({
  declarations: [
    MyApp,
    NotificationpopupPage,
    AccessRequestPage,
    NetworkComponent,
    ApplicationTabsPage,
    LoginPage,
    NotificationsPage,
    ProcesssettingsPage,
    AppSettingsPage,
    DirectoryPage,
    MyProcessesPage,
    PendingTasksPage,
    CreateNewPage,
    SubmissionsPage,
    ReportsPage,
    ProcessPage,
    PivotsPage,
    AddonsPage,
    ProcessLookupsPage,
    ScrollableTabs,
    FormPage,
    Focuser,
    ShowHideSortSearchDirective,
    DirectoryPopupPage,
    MyProcessesPendingApprovalPopupPage,AppUrlPopupPage,AppUrlComponent,CustomDialogComponent,FileprogressbarPage,PeoplePickerPage,AppRepeatingTableComponent,AppDatabaseLookupComponent,AppFileAttachmentComponent,AppProcessDblookupPopupPage,AppNumberFieldComponent,DateTimePickerComponent,ListItemComponent,FormListItemComponent,
    LookupPage,
    PivotPage,
    ReportPage,
    AddonPage,
    AppProcessLookupComponent,
    AppProcessLookupPopupPage,
    AppPeoplePickerComponent,
    ProcessMetricsPage,
    AppAutosizeDirective,
    AppDynamicNumberDirective
  ],
  imports: [
    BrowserModule,
    ChartsModule,
    CurrencyMaskModule,
    OrderModule,
    PipesModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp, {
      scrollAssist:false, autoFocusAssist:false,
      platforms: {
        ios: {
          backButtonText: ''
        },
        android: {
          backButtonText: '',
          activator: 'none'
        }
      }
    }),
    HttpModule,
    IonicPageModule.forChild(PeoplePickerPage),
    VirtualScrollModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    NotificationpopupPage,
    AppProcessLookupPopupPage,
    MyProcessesPendingApprovalPopupPage,
    DirectoryPopupPage,
    FormPage,
    AccessRequestPage,
    NetworkComponent,AppProcessLookupComponent,AppUrlPopupPage,CustomDialogComponent, AppUrlComponent,FileprogressbarPage,PeoplePickerPage,AppPeoplePickerComponent,AppRepeatingTableComponent,AppDatabaseLookupComponent,AppFileAttachmentComponent,AppProcessDblookupPopupPage,AppNumberFieldComponent,DateTimePickerComponent,ListItemComponent,FormListItemComponent,
    NotificationsPage,
    ProcesssettingsPage,
    PendingTasksPage,
    CreateNewPage,
    SubmissionsPage,
    ReportsPage,
    ProcessPage,
    PivotsPage,
    AddonsPage,
    ProcessLookupsPage,
    ApplicationTabsPage,
    LoginPage,
    AppSettingsPage,
    DirectoryPage,
    MyProcessesPage,
    LookupPage,
    PivotPage,
    ReportPage,
    ProcessMetricsPage,
    AddonPage
  ],
  providers: [
    StatusBar,
    Deeplinks,
    ScreenOrientation,
    NativeStorage,
    SplashScreen,
    SQLite,
    SocialSharing,
    Network,
    Push,
    Badge,
    MSAdal,
    Device,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ClientDbProvider,
    PushProvider,
    SocketProvider,
    NetworkInformationProvider,
    NetworkInformationProvider,
    ProcessDataProvider,
    ClientDbAppResourcesProvider,
    ClientDbMyProcessesProvider,
    ClientDbNotificationsProvider,
    ClientDbProcessResourcesProvider,
    ClientDbSynchronizationTasksProvider,
    ClientDbUserProfilesProvider,
    ClientDbProcessWorkflowsProvider,
    ClientDbWorkflowSubmissionsProvider,
    ClientDbProcessLookupObjectsProvider,
    ClientDbProcessLookupsDataProvider,
    ClientDbProcessObjectsProvider,
    HelperProvider,
    SynchronizationProvider,
    DbDataDumpProvider,
    StorageServiceProvider,
    EncryptionProvider,
    LoadingProvider,
    ErrorReportingProvider,
    ErrorReportingProvider,
    CountServiceProvider,
    BacknavigationProvider,
    SortProvider,
    ProcessFormProvider,
    WorkflowRoutingProvider,
    ApplicationDataProvider
  ],
  exports:[IonicApp, IonicModule,
 NgIf,NgFor,AppUrlComponent,AppUrlPopupPage, AppProcessDblookupPopupPage,CustomDialogComponent,FileprogressbarPage,KeysPipe,PipesModule,AppNumberFieldComponent, AppDatabaseLookupComponent, AppProcessLookupComponent,AppRepeatingTableComponent,AppProcessLookupPopupPage,AppPeoplePickerComponent,AppFileAttachmentComponent,DateTimePickerComponent]
})
export class AppModule { }
