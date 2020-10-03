// import { BacknavigationProvider } from './../../providers/backnavigation/backnavigation';
// import { MSAdal } from '@ionic-native/ms-adal';
// import { ApplicationDataProvider } from './../../providers/application-data/application-data';
// import { CountServiceProvider } from './../../providers/count-service/count-service';

// import { SearchFilterPipe } from './../../pipes/search-filter/search-filter';
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
// import { Ng2SearchPipeModule } from 'ng2-search-filter';
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
// import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
// import { async, TestBed, ComponentFixture, inject, fakeAsync, tick } from '@angular/core/testing';
// import { IonicModule, Platform, NavController, NavParams, LoadingController } from 'ionic-angular';
// import { PlatformMock, StatusBarMock, SplashScreenMock, NavMock } from '../../../test-config/mocks-ionic';
// import { } from 'jasmine';
// import { By,by } from 'protractor';
// import * as jQuery from 'jquery';


// describe('Submissions page',() => {

//     let component: SubmissionsPage
//     let clientDBProcessWorkflows: ClientDbProcessWorkflowsProvider;
//     let socketspy:SocketProvider
//     let fixture: ComponentFixture<SubmissionsPage>;
//     let storageServiceProvider: StorageServiceProvider
//     let getAllSpy;
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
//             BacknavigationProvider,
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
//             {provide:LoadingProvider,useClass: mockLoadingClass},
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
//         fixture = TestBed.createComponent(SubmissionsPage);
//         component = fixture.componentInstance;
//         socketspy = TestBed.get(SocketProvider);
//         clientDBProcessWorkflows = TestBed.get(ClientDbProcessWorkflowsProvider);
//         storageServiceProvider = TestBed.get(StorageServiceProvider);

       

//     })
//     it('Submissions settings page is defined', () => {
//         expect(fixture).toBeDefined();
//     });

//     it('Should have Submitted by filter after ngOnIt', (done) => {

//         let mockuser = { Email: 'amir.hussain@abbvie.com', ManagerEmail: 'tariq.deenah@abbvie.com'}
//          getAllSpy = spyOn(storageServiceProvider,'getUser').and.returnValue(Promise.resolve(mockuser));
//         fixture.detectChanges();
  

//             component.ngOnInit();
//             getAllSpy.calls.mostRecent().returnValue.then(()=>{
//                 fixture.detectChanges();
//                 fixture.componentInstance;
//                 fixture.detectChanges();
//                 expect(component.SubmittedBy.length).toBeGreaterThan(0);
//                 done();
//             })
        
        
//     });
//     it('Should have workflows after ngOnIt', inject([ClientDbProcessWorkflowsProvider], fakeAsync(() => {
//         let compontmockservice = fixture.debugElement.injector.get(ClientDbProcessWorkflowsProvider)
//         let mockworkflows = [
//             { 
//                 WorkflowSettingsJSON: 
//                 [
//                     {
//                         Form_Header:
//                         {
//                             FormName:"dummyname"
//                         },
//                         Workflow_Status_Labels:
//                         {
//                             "key" : "vale"
//                         }
//                     }
//                 ]
//             }
//         ]
//         let spy = spyOn(compontmockservice,'getAllProcessWorkflows').and.returnValue(Promise.resolve(true))
//         let spy2 = spyOn(compontmockservice,'getProcessWorkflows').and.returnValue(mockworkflows);
//         let mockuser = { Email: 'amir.hussain@abbvie.com', ManagerEmail: 'tariq.deenah@abbvie.com'}
//         let workflowfromserverspy = spyOn(component,'getWorkflowsFromServer').and.returnValue(mockworkflows);
//          getAllSpy = spyOn(storageServiceProvider,'getUser').and.returnValue(Promise.resolve(mockuser));
//         fixture.detectChanges();
  

//             component.ngOnInit();
//             getAllSpy.calls.mostRecent().returnValue.then(()=>{
//                 fixture.detectChanges();
//                 fixture.componentInstance;
//                 fixture.detectChanges();
//                 expect(component.processWorkflows.length).toBeGreaterThan(0);
//                 //done();
//             })
        
        
//     })));

//     it('Should have Status after ngOnIt', inject([ClientDbProcessWorkflowsProvider], fakeAsync(() => {
//         let compontmockservice = fixture.debugElement.injector.get(ClientDbProcessWorkflowsProvider)
//         let mockworkflows = [
//             { 
//                 WorkflowSettingsJSON: 
//                 [
//                     {
//                         Form_Header:
//                         {
//                             FormName:"dummyname"
//                         },
//                         Workflow_Status_Labels:
//                         {
//                             "key" : "vale"
//                         }
//                     }
//                 ]
//             }
//         ]
//         let spy = spyOn(compontmockservice,'getAllProcessWorkflows').and.returnValue(Promise.resolve(true))
//         let spy2 = spyOn(compontmockservice,'getProcessWorkflows').and.returnValue(mockworkflows);
//         let mockuser = { Email: 'amir.hussain@abbvie.com', ManagerEmail: 'tariq.deenah@abbvie.com'}
//         let workflowfromserverspy = spyOn(component,'getWorkflowsFromServer').and.returnValue(mockworkflows);
//          getAllSpy = spyOn(storageServiceProvider,'getUser').and.returnValue(Promise.resolve(mockuser));
//         fixture.detectChanges();
  

//             component.ngOnInit();
//             getAllSpy.calls.mostRecent().returnValue.then(()=>{
//                 fixture.detectChanges();
//                 fixture.componentInstance;
//                 fixture.detectChanges();
//                 expect(component.Status.length).toBeGreaterThan(0);
//                 //done();
//             })
//         // workflowfromserverspy.calls.mostRecent().returnValue.then(()=>{
//         //     component.Submissions = [{Reference:'testReference'}]
//         //     fixture.detectChanges();
//         // })
        
//     })));

//     it('Should have submissions', inject([ClientDbProcessWorkflowsProvider,SocketProvider,LoadingProvider], fakeAsync(() => {
//         let compontmockservice = fixture.debugElement.injector.get(ClientDbProcessWorkflowsProvider)
//         let loadingmock = fixture.debugElement.injector.get(LoadingProvider);
//         let loadingmockspy = spyOn(loadingmock, 'presentLoading').and.returnValue(true);
//         let loadingmockspy2 = spyOn(loadingmock, 'hideLoading').and.returnValue(true);
//         let socketvar = fixture.debugElement.injector.get(SocketProvider)
//         let mockworkflows = [
//             { 
//                 WorkflowSettingsJSON: 
//                 [
//                     {
//                         Form_Header:
//                         {
//                             FormName:"dummyname"
//                         },
//                         Workflow_Status_Labels:
//                         {
//                             "key" : "vale"
//                         }
//                     }
//                 ]
//             }
//         ]
//         let submissionsmock = [
//             {
//                 FormTasks: "[{\"TaskName\":\"testtask\",\"AssignedToEmail\":\"h@HelperProvider.com\",\"AssignedToName\":\"test name\"}]",
//                 DefaultButtonsJSON: "{SUBMIT:{'outcome':'submitted','Result':'Pending'}",
//                 PendingTask:"[{\"TaskName\":\"testtask\",\"AssignedToEmail\":\"h@HelperProvider.com\",\"AssignedToName\":\"test name\"}]"
//             }
//         ]
//         let spy = spyOn(compontmockservice,'getAllProcessWorkflows').and.returnValue(Promise.resolve(true))
//         let spy2 = spyOn(compontmockservice,'getProcessWorkflows').and.returnValue(mockworkflows);
//         let mockuser = { Email: 'amir.hussain@abbvie.com', ManagerEmail: 'tariq.deenah@abbvie.com'}
//         let socketspy = spyOn(socketvar, 'callWebSocketService').and.returnValue(Promise.resolve(submissionsmock))
//         //let workflowfromserverspy = spyOn(component,'getWorkflowsFromServer').and.returnValue(mockworkflows);
//          getAllSpy = spyOn(storageServiceProvider,'getUser').and.returnValue(Promise.resolve(mockuser));
//         fixture.detectChanges();
  

//             component.ngOnInit();
//             getAllSpy.calls.mostRecent().returnValue.then(()=>{
//                 fixture.detectChanges();
//                 fixture.componentInstance;
//                 fixture.detectChanges();
//                 tick(1000);
//                 expect(component.Submissions.length).toBeGreaterThan(0);
//                 //done();
//             })
            
//         // workflowfromserverspy.calls.mostRecent().returnValue.then(()=>{
//         //     component.Submissions = [{Reference:'testReference'}]
//         //     fixture.detectChanges();
//         // })
        
//     })));


    



// });

// class MockNavParams{
//     data={};
//     get(param)
//     {
//         return this.data[param];
//     }
// }

// class mockLoadingClass
// {
//     presentLoading()
//     {

//     }
//     hideLoading()
//     {

//     }
// }