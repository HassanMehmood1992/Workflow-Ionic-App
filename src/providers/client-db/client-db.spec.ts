import { SQLite } from '@ionic-native/sqlite';
import { async, TestBed } from '@angular/core/testing';
import { ClientDbProvider } from './client-db';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';




describe('Service: ClientDbProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let platform: Platform;

    class SQLiteStub {
        public create(params) {
            return new Promise((resolve) => {
                resolve(true);
            });
        }
    }


    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                ClientDbProvider,
                { provide: Platform, useClass: PlatformMock },
                { provide: SQLite, useClass: SQLiteStub }
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);4
        clientDbProvider = TestBed.get(ClientDbProvider);
    }));

    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });

    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });


    it('should call runQuery with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProvider.runQuery('Test Query', [], jasmine.any(Function), jasmine.any(Function));

        expect(runQuerySpy).toHaveBeenCalledWith('Test Query', [], jasmine.any(Function), jasmine.any(Function));
    });


    it('should call runQuery with correct parameters on calling deleteDBTables', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        var result = clientDbProvider.deleteDBTables();

        expect(runQuerySpy).toHaveBeenCalledWith('Drop table AppResources', [], jasmine.any(Function), jasmine.any(Function));
        expect(runQuerySpy).toHaveBeenCalledWith('Drop table MyProcesses', [], jasmine.any(Function), jasmine.any(Function));
        expect(runQuerySpy).toHaveBeenCalledWith('Drop table Notifications', [], jasmine.any(Function), jasmine.any(Function));
        expect(runQuerySpy).toHaveBeenCalledWith('Drop table ProcessResources', [], jasmine.any(Function), jasmine.any(Function));
        expect(runQuerySpy).toHaveBeenCalledWith('Drop table SynchronizationTasks', [], jasmine.any(Function), jasmine.any(Function));
        expect(runQuerySpy).toHaveBeenCalledWith('Drop table UserProfiles', [], jasmine.any(Function), jasmine.any(Function));
        expect(runQuerySpy).toHaveBeenCalledWith('Drop table ProcessWorkflows', [], jasmine.any(Function), jasmine.any(Function));
        expect(runQuerySpy).toHaveBeenCalledWith('Drop table WorkflowSubmissions', [], jasmine.any(Function), jasmine.any(Function));
        expect(runQuerySpy).toHaveBeenCalledWith('Drop table ProcessLookupObjects', [], jasmine.any(Function), jasmine.any(Function));
        expect(runQuerySpy).toHaveBeenCalledWith('Drop table ProcessLookupsData', [], jasmine.any(Function), jasmine.any(Function));
        expect(runQuerySpy).toHaveBeenCalledWith('Drop table ProcessObjects', [], jasmine.any(Function), jasmine.any(Function));

        expect(result).toBe(true);
    });

});
