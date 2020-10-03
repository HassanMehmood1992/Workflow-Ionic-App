import { PushProvider } from './../push/push';
import { LoadingProvider } from './../loading/loading';
import { DbDataDumpProvider } from './../db-data-dump/db-data-dump';
import { ClientDbSynchronizationTasksProvider } from './../client-db-synchronization-tasks/client-db-synchronization-tasks';
import { SocketProvider } from './../socket/socket';
import { ClientDbProcessObjectsProvider } from './../client-db-process-objects/client-db-process-objects';
import { ClientDbProcessLookupsDataProvider } from './../client-db-process-lookups-data/client-db-process-lookups-data';
import { ClientDbProcessLookupObjectsProvider } from './../client-db-process-lookup-objects/client-db-process-lookup-objects';
import { ClientDbWorkflowSubmissionsProvider } from './../client-db-workflow-submissions/client-db-workflow-submissions';
import { ClientDbProcessWorkflowsProvider } from './../client-db-process-workflows/client-db-process-workflows';
import { ClientDbProcessResourcesProvider } from './../client-db-process-resources/client-db-process-resources';
import { ClientDbUserProfilesProvider } from './../client-db-user-profiles/client-db-user-profiles';
import { ClientDbAppResourcesProvider } from './../client-db-app-resources/client-db-app-resources';
import { ClientDbNotificationsProvider } from './../client-db-notifications/client-db-notifications';
import { SynchronizationProvider } from './synchronization';
import { StorageServiceProvider } from './../storage-service/storage-service';
import { HelperProvider } from './../helper/helper';
import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';
import { ClientDbMyProcessesProvider } from '../client-db-my-processes/client-db-my-processes';
import { LoadingController } from 'ionic-angular';
import { App } from 'ionic-angular';

import { Config } from 'ionic-angular/config/config';
import { Events } from 'ionic-angular/util/events';
import { Badge } from '@ionic-native/badge';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ApplicationDataProvider } from '../application-data/application-data';
import { ErrorReportingProvider } from '../error-reporting/error-reporting';


describe('Service: SynchronizationProvider', () => {

    let synchronizationProvider: SynchronizationProvider;
    let clientDbProvider: ClientDbProvider;
    let clientDbSynchronizationTasksProvider: ClientDbSynchronizationTasksProvider;
    let clientDbNotificationsProvider: ClientDbNotificationsProvider;
    let clientDbMyProcessesProvider: ClientDbMyProcessesProvider;
    let clientDbAppResourcesProvider: ClientDbAppResourcesProvider;
    let clientDbUserProfilesProvider: ClientDbUserProfilesProvider;
    let clientDbProcessResourcesProvider: ClientDbProcessResourcesProvider;
    let clientDbProcessWorkflowsProvider: ClientDbProcessWorkflowsProvider;
    let clientDbWorkflowSubmissionsProvider: ClientDbWorkflowSubmissionsProvider;
    let clientDbProcessLookupObjectsProvider: ClientDbProcessLookupObjectsProvider;
    let clientDbProcessLookupsDataProvider: ClientDbProcessLookupsDataProvider;
    let clientDbProcessObjectsProvider: ClientDbProcessObjectsProvider;
    let dbDataDumpProvider: DbDataDumpProvider;

    let socket: SocketProvider;
    let storageService: StorageServiceProvider;

    class SQLiteStub {
        public create(params) {
            return new Promise((resolve) => {
                resolve(true);
            });
        }
    }

    class StroageServiceStub {
        getUser(): any {
            let promise = new Promise((resolve, reject) => {
                resolve({'AuthenticationToken': '3'});
            });
            return promise;
          };
    }

    class SocketStub {
        callWebSocketService(){

        }
    }

    beforeEach(() => {

        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                { provide: Platform, useClass: PlatformMock },
                { provide: SQLite, useClass: SQLiteStub },
                { provide: StorageServiceProvider, useClass: StroageServiceStub },
                SynchronizationProvider,
                ClientDbProvider,
                ClientDbSynchronizationTasksProvider,
                ClientDbNotificationsProvider,
                ClientDbMyProcessesProvider,
                ClientDbAppResourcesProvider,
                ClientDbUserProfilesProvider,
                ClientDbProcessResourcesProvider,
                ClientDbProcessWorkflowsProvider,
                ClientDbWorkflowSubmissionsProvider,
                ClientDbProcessLookupObjectsProvider,
                ClientDbProcessLookupsDataProvider,
                ClientDbProcessObjectsProvider,
                DbDataDumpProvider,
                LoadingProvider,
                LoadingController,
                PushProvider,
                { provide: SocketProvider, useClass: SocketStub },
                HelperProvider,
                App,
                Config,
                Events,
                Badge,
                AlertController,
                ApplicationDataProvider,
                ErrorReportingProvider
            ],
            imports: [

            ]
        });
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbSynchronizationTasksProvider = TestBed.get(ClientDbSynchronizationTasksProvider);
        clientDbNotificationsProvider = TestBed.get(ClientDbNotificationsProvider);
        clientDbMyProcessesProvider = TestBed.get(ClientDbMyProcessesProvider);
        clientDbAppResourcesProvider = TestBed.get(ClientDbAppResourcesProvider);
        clientDbUserProfilesProvider = TestBed.get(ClientDbUserProfilesProvider);
        clientDbProcessResourcesProvider = TestBed.get(ClientDbProcessResourcesProvider);
        clientDbProcessWorkflowsProvider = TestBed.get(ClientDbProcessWorkflowsProvider);
        clientDbWorkflowSubmissionsProvider = TestBed.get(ClientDbWorkflowSubmissionsProvider);
        clientDbProcessLookupObjectsProvider = TestBed.get(ClientDbProcessLookupObjectsProvider);
        clientDbProcessLookupsDataProvider = TestBed.get(ClientDbProcessLookupsDataProvider);
        clientDbProcessObjectsProvider = TestBed.get(ClientDbProcessObjectsProvider);
        dbDataDumpProvider = TestBed.get(DbDataDumpProvider);
        socket = TestBed.get(SocketProvider);
        storageService = TestBed.get(StorageServiceProvider);
        synchronizationProvider = TestBed.get(SynchronizationProvider);

    });

    it('should create an instance of synchronizationProvider', () => {
        expect(synchronizationProvider).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbSynchronizationTasksProvider', () => {
        expect(clientDbSynchronizationTasksProvider).toBeDefined();
    });
    it('should create an instance of clientDbNotificationsProvider', () => {
        expect(clientDbNotificationsProvider).toBeDefined();
    });
    it('should create an instance of clientDbMyProcessesProvider', () => {
        expect(clientDbMyProcessesProvider).toBeDefined();
    });
    it('should create an instance of clientDbAppResourcesProvider', () => {
        expect(clientDbAppResourcesProvider).toBeDefined();
    });
    it('should create an instance of clientDbUserProfilesProvider', () => {
        expect(clientDbUserProfilesProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessResourcesProvider', () => {
        expect(clientDbProcessResourcesProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessWorkflowsProvider', () => {
        expect(clientDbProcessWorkflowsProvider).toBeDefined();
    });
    it('should create an instance of clientDbWorkflowSubmissionsProvider', () => {
        expect(clientDbWorkflowSubmissionsProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessLookupObjectsProvider', () => {
        expect(clientDbProcessLookupObjectsProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessLookupsDataProvider', () => {
        expect(clientDbProcessLookupsDataProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessObjectsProvider', () => {
        expect(clientDbProcessObjectsProvider).toBeDefined();
    });
    it('should create an instance of socket', () => {
        expect(socket).toBeDefined();
    });
    it('should create an instance of storageService', () => {
        expect(storageService).toBeDefined();
    });


    it('isLoggedIn should return true', () => {
        let getUserSpy = spyOn(storageService, 'getUser').and.callFake(() => {
            let promise = new Promise((resolve, reject) => {
                resolve({'AuthenticationToken': '3'});
            });
            return promise;
        });

        synchronizationProvider.isLoggedIn().then((result)=>{
            expect(result).toEqual(true);
        });

        expect(getUserSpy).toHaveBeenCalled();
    });


    it('isLoggedIn should return false', () => {
        let getUserSpy = spyOn(storageService, 'getUser').and.callFake(() => {
            let promise = new Promise((resolve, reject) => {
                resolve({});
            });
            return promise;
        });

        synchronizationProvider.isLoggedIn().then((result)=>{
            expect(result).toEqual(false);
        });

        expect(getUserSpy).toHaveBeenCalled();
    });


    it('isLoggedIn should return false on error', () => {
        let getUserSpy = spyOn(storageService, 'getUser').and.callFake(() => {
            let promise = new Promise((resolve, reject) => {
                reject();
            });
            return promise;
        });

        synchronizationProvider.isLoggedIn().then((result)=>{
            expect(result).toEqual(false);
        });

        expect(getUserSpy).toHaveBeenCalled();
    });

    
    it('startUpSync should return if not logged in', () => {
        //isLoggedIn should be false
        let getUserSpy = spyOn(storageService, 'getUser').and.callFake(() => {
            let promise = new Promise((resolve, reject) => {
                resolve({});
            });return promise;
        });

        let getSyncTasksSpy = spyOn(clientDbSynchronizationTasksProvider, 'getAllSynchronizationTasks');

        synchronizationProvider.startUpSync();

        expect(getUserSpy).toHaveBeenCalled();
        expect(getSyncTasksSpy).toHaveBeenCalledTimes(0);
        
    });


    it('startUpSync should perform the up sync operations', () => {
        //isLoggedIn should be false
        let getUserSpy = spyOn(storageService, 'getUser').and.callFake(() => {
            let promise = new Promise((resolve, reject) => {
                resolve({'AuthenticationToken': 'testToken'});
            });return promise;
        });

        spyOn(clientDbSynchronizationTasksProvider, 'getAllSynchronizationTasks').and.callFake(() => {
            let promise = new Promise((resolve, reject) => {
                resolve();
            });return promise;
        });

        let returnAllSynchronizationTaskListSpy = spyOn(clientDbSynchronizationTasksProvider, 'returnAllSynchronizationTaskList').and.callFake(() => {
            var res = {item (param) {
                if(param === 0){
                    return{'TimeStamp':'Thu Jan 18 2018 13:28:25 GMT+0500 (PKT)', 'ProcessID':'2', 'ServerItemID':'123', 'SynchronizationTasksID':'1000', 'TableNames':'TestTable'};
                }
                if(param === 1){
                    return{'TimeStamp':'Thu Jan 18 2018 13:28:25 GMT+0500 (PKT)', 'ProcessID':'2', 'ServerItemID':'124', 'SynchronizationTasksID':'1001', 'TableNames':'TestTable'};
                }
                if(param === 2){
                    return{'TimeStamp':'Thu Jan 18 2018 13:28:25 GMT+0500 (PKT)', 'ProcessID':'2', 'ServerItemID':'125', 'SynchronizationTasksID':'1002', 'TableNames':'WorkflowSubmissions', 'TaskQuery':"{\"value\":\"{\\\"processId\\\":\\\"2\\\",\\\"workflowId\\\":\\\"2\\\",\\\"formId\\\":\\\"2-2\\\"}\"}"}
                }
            }, length: 3};//mock non-enpty response
            return res;
        });

        let socketCallSpy = spyOn(socket, 'callWebSocketService').and.callFake(() => {
            let promise = new Promise((resolve, reject) => {
                resolve(['1000', '1001', '1002']);
            });return promise;
        });


        let deleteSynchronizationTaskSpy = spyOn(clientDbSynchronizationTasksProvider, 'deleteSynchronizationTask').and.callFake((id, index) => {
            let promise = new Promise((resolve, reject) => {
                resolve(index);
            });return promise;
        });

        let deleteWorkflowSubmissionSpy = spyOn(clientDbWorkflowSubmissionsProvider, 'deleteWorkflowSubmission').and.callFake(() => {
            let promise = new Promise((resolve, reject) => {
                resolve();
            });return promise;
        });
        

        synchronizationProvider.startUpSync().then(() => {
            expect(getUserSpy).toHaveBeenCalled();
            expect(deleteSynchronizationTaskSpy).toHaveBeenCalled();
            expect(returnAllSynchronizationTaskListSpy).toHaveBeenCalled();
            expect(socketCallSpy).toHaveBeenCalled();
            expect(deleteSynchronizationTaskSpy).toHaveBeenCalledTimes(3);
            expect(deleteWorkflowSubmissionSpy).toHaveBeenCalledWith(2,2,'2-2');
        });
        
    });
    

});
