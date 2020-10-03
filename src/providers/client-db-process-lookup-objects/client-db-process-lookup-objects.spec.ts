import { ClientDbProcessLookupObjectsProvider } from './client-db-process-lookup-objects';
import { HelperProvider } from './../helper/helper';
import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';



describe('Service: ClientDbProcessLookupObjectsProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let clientDbProcessLookupObjectsProvider: ClientDbProcessLookupObjectsProvider;
    let platform: Platform;

    class SQLiteStub {
        public create(params) {
            return new Promise((resolve) => {
                resolve(true);
            });
        }
    }


    beforeEach(() => {

        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                { provide: Platform, useClass: PlatformMock },
                { provide: SQLite, useClass: SQLiteStub },
                ClientDbProvider,
                HelperProvider,
                ClientDbProcessLookupObjectsProvider
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbProcessLookupObjectsProvider = TestBed.get(ClientDbProcessLookupObjectsProvider);

    });

    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessObjectsProvider', () => {
        expect(clientDbProcessLookupObjectsProvider).toBeDefined();
    });


    it('insertProcessLookupObject should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessLookupObjectsProvider.insertProcessLookupObject(123, 2, '{\"key\": \"Value\"}');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'INSERT OR IGNORE INTO ProcessLookupObjects (LookupID, ProcessID, Value, LastModified) VALUES (?,?,?,?)',
            [123, 2, '{\"key\": \"Value\"}', jasmine.any(Object)],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('updateProcessLookupObject should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessLookupObjectsProvider.updateProcessLookupObject(123, 2, '{\"key\": \"Value\"}');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE ProcessLookupObjects SET Value = ?, LastModified = ? WHERE LookupID = ? and ProcessID = ?',
            ['{\"key\": \"Value\"}', jasmine.any(Object), 123, 2],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('insertElseUpdateProcessLookupObject should call insert and other method calls with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = { rows: [] };//mock empty response... object not present
            successCb(res);
        });

        spyOn(clientDbProcessLookupObjectsProvider, 'insertProcessLookupObject').and.callThrough();

        clientDbProcessLookupObjectsProvider.insertElseUpdateProcessLookupObject(123, 2, '{\"key\": \"Value\"}', 0).then(() => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'INSERT OR IGNORE INTO ProcessLookupObjects (LookupID, ProcessID, Value, LastModified) VALUES (?,?,?,?)',
                [123, 2, '{\"key\": \"Value\"}', jasmine.any(Object)],
                jasmine.any(Function),
                jasmine.any(Function)
            );
        });
    });


    it('insertElseUpdateProcessLookupObject should call insert and other method calls with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = { rows: [123] };//mock object alredy present
            successCb(res);
        });

        spyOn(clientDbProcessLookupObjectsProvider, 'updateProcessLookupObject').and.callThrough();

        clientDbProcessLookupObjectsProvider.insertElseUpdateProcessLookupObject(123, 2, '{\"key\": \"Value\"}', 0).then(() => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'UPDATE ProcessLookupObjects SET Value = ?, LastModified = ? WHERE LookupID = ? and ProcessID = ?',
                ['{\"key\": \"Value\"}', jasmine.any(Object), 123, 2],
                jasmine.any(Function),
                jasmine.any(Function)
            );
        });

    });


    it('deleteProcessLookupObject should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessLookupObjectsProvider.deleteProcessLookupObject(123, 2);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM ProcessLookupObjects WHERE LookupID = ? and ProcessID = ?',
            [123, 2],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

});
