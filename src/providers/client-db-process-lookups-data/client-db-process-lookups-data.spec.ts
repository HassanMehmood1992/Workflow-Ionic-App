import { ClientDbProcessLookupsDataProvider } from './client-db-process-lookups-data';
import { HelperProvider } from './../helper/helper';
import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';



describe('Service: ClientDbProcessLookupsDataProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let clientDbProcessLookupsDataProvider: ClientDbProcessLookupsDataProvider;
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
                ClientDbProcessLookupsDataProvider
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbProcessLookupsDataProvider = TestBed.get(ClientDbProcessLookupsDataProvider);

    });

    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessObjectsProvider', () => {
        expect(clientDbProcessLookupsDataProvider).toBeDefined();
    });


    it('insertProcessLookupsData should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessLookupsDataProvider.insertProcessLookupsData(123, 2, '{\"key\": \"Value\"}');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'INSERT INTO ProcessLookupsData (LookupDataID, LookupID, Value, LastModified) VALUES (?,?,?,?)',
            [123, 2, '{\"key\": \"Value\"}', jasmine.any(Object)],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('updateProcessLookupsData should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessLookupsDataProvider.updateProcessLookupsData(123, 2, '{\"key\": \"Value\"}');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE ProcessLookupsData SET LookupID = ?, Value = ?, LastModified = ? WHERE LookupDataID = ?',
            [2, '{\"key\": \"Value\"}', jasmine.any(Object), 123],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('insertElseUpdateProcessLookupData should call insert and other method calls with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = { rows: [] };//mock empty response... object not present
            successCb(res);
        });

        spyOn(clientDbProcessLookupsDataProvider, 'insertProcessLookupsData').and.callThrough();

        clientDbProcessLookupsDataProvider.insertElseUpdateProcessLookupData(123, 2, '{\"key\": \"Value\"}', 0).then(() => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'INSERT INTO ProcessLookupsData (LookupDataID, LookupID, Value, LastModified) VALUES (?,?,?,?)',
                [123, 2, '{\"key\": \"Value\"}', jasmine.any(Object)],
                jasmine.any(Function),
                jasmine.any(Function)
            );
        });
    });


    it('insertElseUpdateProcessLookupData should call insert and other method calls with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = { rows: [123] };//mock object alredy present
            successCb(res);
        });

        spyOn(clientDbProcessLookupsDataProvider, 'updateProcessLookupsData').and.callThrough();

        clientDbProcessLookupsDataProvider.insertElseUpdateProcessLookupData(123, 2, '{\"key\": \"Value\"}', 0).then(() => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'UPDATE ProcessLookupsData SET LookupID = ?, Value = ?, LastModified = ? WHERE LookupDataID = ?',
                [2, '{\"key\": \"Value\"}', jasmine.any(Object), 123],
                jasmine.any(Function),
                jasmine.any(Function)
            );
        });

    });


    it('deleteProcessLookupsData should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessLookupsDataProvider.deleteProcessLookupsData(123, 2);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM ProcessLookupsData WHERE LookupID = ?',
            [123],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('getProcessLookupFormData should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        var LookupColumns = 'Col1, Col2';
        var LookupTitle = 'TestTitle';
        var ProcessID = 2;
        var ConditionalStatement = 'Col1 < 10';
        var SortQuery = 'Order by Col2 ASC';

        clientDbProcessLookupsDataProvider.getProcessLookupFormData(LookupTitle, ProcessID, LookupColumns, ConditionalStatement, SortQuery);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'SELECT ' + LookupColumns + ' FROM ProcessLookupsData PLD' + ' Inner Join ProcessLookupObjects PLO on PLO.LookupID = PLD.LookupID' + ' WHERE' + ' JSON_EXTRACT(PLO.Value, \'$.LookupTitle\') = ' + '\'' + LookupTitle + '\'' + ' and PLO.ProcessID = ' + ProcessID + ' ' + ConditionalStatement + ' ' + SortQuery,
            [],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });



});
