// /* Copyright (C) Abbvie Inc - All Rights Reserved
// * Unauthorized copying of this file, via any medium is strictly prohibited
// * Proprietary and confidential
// */

// /*
// ModuleID: page-app-settings 
// Description: Test script file for for app settings module.
// Location: ./pages/page-app-settings 
// Author: System Generated
// Version: 1.0.0
// Modification history: none
// */

// import { MSAdal } from '@ionic-native/ms-adal';
// import { ApplicationDataProvider } from './../../providers/application-data/application-data';
// import { CountServiceProvider } from './../../providers/count-service/count-service';

// import { PipesModule } from './../../pipes/pipes.module';
// import { ClientDbProcessObjectsProvider } from './../../providers/client-db-process-objects/client-db-process-objects';
// import { ClientDbProcessLookupsDataProvider } from './../../providers/client-db-process-lookups-data/client-db-process-lookups-data';
// import { ClientDbWorkflowSubmissionsProvider } from './../../providers/client-db-workflow-submissions/client-db-workflow-submissions';
// import { ClientDbProcessLookupObjectsProvider } from './../../providers/client-db-process-lookup-objects/client-db-process-lookup-objects';
// import { ClientDbProcessWorkflowsProvider } from './../../providers/client-db-process-workflows/client-db-process-workflows';
// import { ClientDbUserProfilesProvider } from './../../providers/client-db-user-profiles/client-db-user-profiles';
// import { ClientDbSynchronizationTasksProvider } from './../../providers/client-db-synchronization-tasks/client-db-synchronization-tasks';
// import { ClientDbProcessResourcesProvider } from './../../providers/client-db-process-resources/client-db-process-resources';
// import { ClientDbNotificationsProvider } from './../../providers/client-db-notifications/client-db-notifications';
// import { ClientDbMyProcessesProvider } from './../../providers/client-db-my-processes/client-db-my-processes';
// import { ClientDbAppResourcesProvider } from './../../providers/client-db-app-resources/client-db-app-resources';
// import { ProcessDataProvider } from './../../providers/process-data/process-data';
// import { NetworkInformationProvider } from './../../providers/network-information/network-information';
// import { SocketProvider } from './../../providers/socket/socket';
// import { PushProvider } from './../../providers/push/push';
// import { ClientDbProvider } from './../../providers/client-db/client-db';
// import { Device } from '@ionic-native/device';
// import { Badge } from '@ionic-native/badge';
// import { Push } from '@ionic-native/push';
// import { Network } from '@ionic-native/network';
// import { SocialSharing } from '@ionic-native/social-sharing';
// import { SplashScreen } from '@ionic-native/splash-screen';
// import { NativeStorage } from '@ionic-native/native-storage';
// import { ScreenOrientation } from '@ionic-native/screen-orientation';
// import { Deeplinks } from '@ionic-native/deeplinks';
// import { StatusBar } from '@ionic-native/status-bar';
// import { HttpModule } from '@angular/http';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { OrderModule } from 'ngx-order-pipe';
// import { BrowserModule } from '@angular/platform-browser';
// import { DirectoryPopupPage } from './../directory-popup/directory-popup';
// import { MyProcessesPendingApprovalPopupPage } from './../my-processes-pending-approval-popup/my-processes-pending-approval-popup';
// import { ShowHideSortSearchDirective } from './../../directives/show-hide-sort-search/show-hide-sort-search';
// import { Focuser } from './../../directives/focuser/focuser';
// import { FormPage } from './../form/form';

// import { ScrollableTabs } from './../../components/scrollable-tabs/scrollable-tabs';
// import { ProcessLookupsPage } from './../process-lookups/process-lookups';
// import { AddonsPage } from './../addons/addons';
// import { PivotsPage } from './../pivots/pivots';
// import { ProcessPage } from './../process/process';
// import { ReportsPage } from './../reports/reports';
// import { SubmissionsPage } from './../submissions/submissions';
// import { CreateNewPage } from './../create-new/create-new';
// import { PendingTasksPage } from './../pending-tasks/pending-tasks';
// import { DirectoryPage } from './../directory/directory';
// import { AppSettingsPage } from './../app-settings/app-settings';
// import { ProcesssettingsPage } from './../processsettings/processsettings';
// import { NotificationsPage } from './../notifications/notifications';
// import { LoginPage } from './../login/login';
// import { HelperProvider } from './../../providers/helper/helper';
// import { SynchronizationProvider } from './../../providers/synchronization/synchronization';
// import { DbDataDumpProvider } from './../../providers/db-data-dump/db-data-dump';
// import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
// import { EncryptionProvider } from './../../providers/encryption/encryption';
// import { LoadingProvider } from './../../providers/loading/loading';
// import { ErrorReportingProvider } from './../../providers/error-reporting/error-reporting';
// import { ApplicationTabsPage } from './../tabs-application/ApplicationTabs';
// import { NetworkComponent } from './../../components/network/network';
// import { AccessRequestPage } from './../access-request/access-request';
// import { MyApp } from './../../app/app.component';
// import { SQLite } from '@ionic-native/sqlite';
// import { TestBed,ComponentFixture } from '@angular/core/testing';
// import { IonicModule, NavController, NavParams } from 'ionic-angular';


// describe('App settings page',() => {

//     let component: AppSettingsPage
//     let clientDbAppResourcesProvider: ClientDbAppResourcesProvider;
//     let fixture: ComponentFixture<AppSettingsPage>;
//     let storageServiceProvider: StorageServiceProvider
//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             declarations: [
//             MyApp,
//             AccessRequestPage,
//             NetworkComponent,
//             ApplicationTabsPage,
//             LoginPage,
//             NotificationsPage,
//             ProcesssettingsPage,
//             AppSettingsPage,
//             DirectoryPage,
//             AppSettingsPage,
//             PendingTasksPage,
//             CreateNewPage,
//             SubmissionsPage,
//             ReportsPage,
//             ProcessPage,
//             PivotsPage,
//             AddonsPage,
//             ProcessLookupsPage,
//             ScrollableTabs,
//             FormPage,
//             Focuser,
//             ShowHideSortSearchDirective,
//             DirectoryPopupPage,
//             MyProcessesPendingApprovalPopupPage

//         ],
//         imports: [
//             BrowserModule,
//             IonicModule,
//             OrderModule,
//             PipesModule,
//             BrowserAnimationsModule,
//             Ng2SearchPipeModule,
//             IonicModule.forRoot(MyApp),
//             HttpModule
//         ],
//         providers: [
//             StatusBar,
//             Deeplinks,
//             MSAdal,
//             ScreenOrientation,
//             NativeStorage,
//             SplashScreen,
//             SQLite,
//             CountServiceProvider,
//             NavController,
//             {provide: NavParams, useValue : { data: {"key": 1}}},
//             SocialSharing,
//             Network,
//             Push,
//             Badge,
//             Device,
//             ClientDbProvider,
//             PushProvider,
//             SocketProvider,
//             NetworkInformationProvider,
//             ProcessDataProvider,
//             ClientDbAppResourcesProvider,
//             ClientDbMyProcessesProvider,
//             ClientDbNotificationsProvider,
//             ClientDbProcessResourcesProvider,
//             ClientDbSynchronizationTasksProvider,
//             ClientDbUserProfilesProvider,
//             ClientDbProcessWorkflowsProvider,
//             ClientDbWorkflowSubmissionsProvider,
//             ClientDbProcessLookupObjectsProvider,
//             ClientDbProcessLookupsDataProvider,
//             ClientDbProcessObjectsProvider,
//             HelperProvider,
//             SynchronizationProvider,
//             DbDataDumpProvider,
//             StorageServiceProvider,
//             EncryptionProvider,
//             LoadingProvider,
//             ApplicationDataProvider,
//             ErrorReportingProvider,
//             ErrorReportingProvider
//         ]
//         }).compileComponents();
//         fixture = TestBed.createComponent(AppSettingsPage);
//         component = fixture.componentInstance;
//         clientDbAppResourcesProvider = TestBed.get(ClientDbAppResourcesProvider);
//         storageServiceProvider = TestBed.get(StorageServiceProvider);

//     })
//     it('App settings page is defined', () => {
//         expect(fixture).toBeDefined();
//     });

//     it('Should initialize user from storage service and show on screen', (done) => {
//         fixture.detectChanges();
//         let mockuser = { Email: 'amir.hussain@abbvie.com', ManagerEmail: 'tariq.deenah@abbvie.com'}
//         let getAllSpy = spyOn(storageServiceProvider,'getUser').and.returnValue(Promise.resolve(mockuser));
//         component.ngOnInit();
//         getAllSpy.calls.mostRecent().returnValue.then(()=>{
//             fixture.detectChanges();
//             fixture.componentInstance;
//              expect('amir.hussain@abbvie.com').toEqual(document.getElementById('_AppSettingemail').innerHTML)
//             done();
//         })
//     });

//     it('Should contain PlateForm value from app config', (done) => {
//         fixture.detectChanges();
//         expect(document.getElementById('_AppSettingrapidFlowPlatform').innerHTML.length).toBeGreaterThan(0)
//         done();
//     });

//     it('Should contain Version value from app config', (done) => {
//         fixture.detectChanges();
//         expect(document.getElementById('_AppSettingrapidFlowapplicationVersion').innerHTML.length).toBeGreaterThan(0)
//         done();
//     });
//     it('Should contain Environment value from app config', (done) => {
//         fixture.detectChanges();
//         expect(document.getElementById('_AppSettingrapidFlowapplicationenvironment').innerHTML.length).toBeGreaterThan(0)
//         done();
//     });

//     it('Should contain out of office name from local sql', (done) => {
//         fixture.detectChanges();
//         let mockSettings = {
//             Email_Notification: true,
//             Out_of_Office: {
//                 Delegated_To: {DisplayName:'test'},
//                 Start_Date: '28-March-2018',
//                 End_Date: '1-April-2018'
//             },
//             Proxy_Approver:
//             {
//                 DisplayName: 'testproxy'
//             },
//             Push_Notification:
//             {
//                 Allow : true
//             }
//         }
//         let mockuser = { Email: 'amir.hussain@abbvie.com', ManagerEmail: 'tariq.deenah@abbvie.com'}
//         let getAllSpy = spyOn(storageServiceProvider,'getUser').and.returnValue(Promise.resolve(mockuser));
//         let midspy = spyOn(clientDbAppResourcesProvider, 'getAllAppResources').and.returnValue(Promise.resolve(true));
//         let getAllSpy2 = spyOn(clientDbAppResourcesProvider, 'getAppSettings').and.returnValue(mockSettings);
//         component.ngOnInit();
//         getAllSpy.calls.mostRecent().returnValue.then(()=>{
//             fixture.detectChanges();
//             fixture.componentInstance;
//             done();
//         })
//         midspy.calls.mostRecent().returnValue.then(()=>{
//             getAllSpy2.calls.mostRecent().returnValue.then((mocksettings)=>{

//                 fixture.detectChanges();
//                 fixture.componentInstance;
//                 expect('amir.hussain@abbvie.com').toEqual(document.getElementById('_AppSettingoutofofficename').innerHTML)
//                 done();
//             })
//         })
        
//     });

//     it('Should contain out of office dates from local sql', (done) => {
//         fixture.detectChanges();
//         let mockSettings = {
//             Email_Notification: true,
//             Out_of_Office: {
//                 Delegated_To: {DisplayName:'test'},
//                 Start_Date: '28-March-2018',
//                 End_Date: '1-April-2018'
//             },
//             Proxy_Approver:
//             {
//                 DisplayName: 'testproxy'
//             },
//             Push_Notification:
//             {
//                 Allow : true
//             }
//         }
//         let mockuser = { Email: 'amir.hussain@abbvie.com', ManagerEmail: 'tariq.deenah@abbvie.com'}
//         let getAllSpy = spyOn(storageServiceProvider,'getUser').and.returnValue(Promise.resolve(mockuser));
//         let midspy = spyOn(clientDbAppResourcesProvider, 'getAllAppResources').and.returnValue(Promise.resolve(true));
//         let getAllSpy2 = spyOn(clientDbAppResourcesProvider, 'getAppSettings').and.returnValue(mockSettings);
//         component.ngOnInit();
//         getAllSpy.calls.mostRecent().returnValue.then(()=>{
//             fixture.detectChanges();
//             fixture.componentInstance;
//             done();
//         })
//         midspy.calls.mostRecent().returnValue.then(()=>{
//             getAllSpy2.calls.mostRecent().returnValue.then((mocksettings)=>{

//                 fixture.detectChanges();
//                 fixture.componentInstance;
//                 expect(document.getElementById('_AppSettingoutofofficename').innerHTML.indexOf('28-March-2018')).toBeGreaterThan(1)
//                 done();
//             })
//         })
        
//     });

//      it('Should contain Proxy name from local sql ', (done) => {
//         fixture.detectChanges();
//         let mockSettings = {
//             Email_Notification: true,
//             Out_of_Office: {
//                 Delegated_To: {DisplayName:'test'},
//                 Start_Date: '28-March-2018',
//                 End_Date: '1-April-2018'
//             },
//             Proxy_Approver:
//             {
//                 DisplayName: 'testproxy'
//             },
//             Push_Notification:
//             {
//                 Allow : true
//             }
//         }
//         let mockuser = { Email: 'amir.hussain@abbvie.com', ManagerEmail: 'tariq.deenah@abbvie.com'}
//         let getAllSpy = spyOn(storageServiceProvider,'getUser').and.returnValue(Promise.resolve(mockuser));
//         let midspy = spyOn(clientDbAppResourcesProvider, 'getAllAppResources').and.returnValue(Promise.resolve(true));
//         let getAllSpy2 = spyOn(clientDbAppResourcesProvider, 'getAppSettings').and.returnValue(mockSettings);
//         component.ngOnInit();
//         getAllSpy.calls.mostRecent().returnValue.then(()=>{
//             fixture.detectChanges();
//             fixture.componentInstance;
//             done();
//         })
//         midspy.calls.mostRecent().returnValue.then(()=>{
//             getAllSpy2.calls.mostRecent().returnValue.then((mocksettings)=>{

//                 fixture.detectChanges();
//                 fixture.componentInstance;
//                 expect(document.getElementById('_AppSettingproxyname').innerHTML).toEqual('testproxy')
//                 done();
//             })
//         })
        
//     });

// });
