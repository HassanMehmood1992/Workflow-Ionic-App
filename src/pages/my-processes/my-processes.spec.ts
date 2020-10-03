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
// import { MyProcessesPage } from './my-processes';
// import { SQLite } from '@ionic-native/sqlite';
// import { TestBed,ComponentFixture } from '@angular/core/testing';
// import { IonicModule, NavController, NavParams } from 'ionic-angular';



// describe('Favorites page',() => {

//     let component: MyProcessesPage
//     let clientDbMyProcessesProvider: ClientDbMyProcessesProvider;
//     let fixture: ComponentFixture<MyProcessesPage>;
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
//             MyProcessesPage,
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
//         fixture = TestBed.createComponent(MyProcessesPage);
//         component = fixture.componentInstance;
//         clientDbMyProcessesProvider = TestBed.get(ClientDbMyProcessesProvider);

//     })
//     it('Favorites page is defined', () => {
//         expect(fixture).toBeDefined();
//     });

//     it('Should define my processes from local database', () => {
//         spyOn(clientDbMyProcessesProvider, 'getAllMyProcesses').and.callFake(() => {});
//         spyOn(clientDbMyProcessesProvider, 'returnAllMyProcessData').and.callFake(() => {

//             return [{ProcessName:'Test',OrganizationName:'Hassan',Status : 'Active'}];
//         });
//         fixture.detectChanges();
//         expect(component.MyProcesses.length).toBeGreaterThan(0);
//     });

//     it('Should populate active process', () => {
//         spyOn(clientDbMyProcessesProvider, 'getAllMyProcesses').and.callFake(() => {});
//         spyOn(clientDbMyProcessesProvider, 'returnAllMyProcessData').and.callFake(() => {

//             return [{ProcessName:'UDA',OrganizationName:'ADSC',Status : 'Active'}];
//         });
//         fixture.detectChanges();
//         expect('ADSC').toEqual(document.getElementsByTagName('h3')[0].innerHTML);
//     });

//     it('Should populate processes with pending status process', () => {
//         spyOn(clientDbMyProcessesProvider, 'getAllMyProcesses').and.callFake(() => {});
//         spyOn(clientDbMyProcessesProvider, 'returnAllMyProcessData').and.callFake(() => {

//             return [{ProcessName:'UDA',OrganizationName:'ADSC',Status : 'Pending Access'}];
//         });
//         fixture.detectChanges();
//         expect('Pending Approval').toEqual(document.getElementsByTagName('h3')[1].innerHTML);
//     });

//     it('Should populate processes with update status process', () => {
//         spyOn(clientDbMyProcessesProvider, 'getAllMyProcesses').and.callFake(() => {});
//         spyOn(clientDbMyProcessesProvider, 'returnAllMyProcessData').and.callFake(() => {

//             return [{ProcessName:'UDA',OrganizationName:'ADSC',Status : 'Pending Update'}];
//         });
//         fixture.detectChanges();
//         expect('Pending Update').toEqual(document.getElementsByTagName('h3')[1].innerHTML);
//     });

    



// });
