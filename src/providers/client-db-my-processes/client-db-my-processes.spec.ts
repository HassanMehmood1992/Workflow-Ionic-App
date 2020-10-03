import { ClientDbMyProcessesProvider } from './client-db-my-processes';
import { HelperProvider } from './../helper/helper';
import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';
import * as moment from 'moment';



describe('Service: ClientDbMyProcessesProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let clientDbMyProcessesProvider: ClientDbMyProcessesProvider;
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
                ClientDbMyProcessesProvider
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbMyProcessesProvider = TestBed.get(ClientDbMyProcessesProvider);

    });

    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessObjectsProvider', () => {
        expect(clientDbMyProcessesProvider).toBeDefined();
    });


    it('insertMyProcess should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbMyProcessesProvider.insertMyProcess(2, '{\"RecentNotification\": \"Test Notification\", \"MyProcessLastModified\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'INSERT INTO MyProcesses (ProcessID, ProcessData, RecentNotification, LastModified) VALUES (?,?,?,?)',
            [2, '{\"RecentNotification\": \"Test Notification\", \"MyProcessLastModified\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}', 'Test Notification', jasmine.any(Object)],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('updateMyProcess should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbMyProcessesProvider.updateMyProcess(2, '{\"RecentNotification\": \"Test Notification\", \"MyProcessLastModified\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE MyProcesses SET ProcessData = ?, RecentNotification = ?, LastModified = ? WHERE ProcessID = ?',
            ['{\"RecentNotification\": \"Test Notification\", \"MyProcessLastModified\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}', 'Test Notification', jasmine.any(Object), 2],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('updateLastModified should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        var date = moment.utc('Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)').local();
        clientDbMyProcessesProvider.updateLastModified(2, date, 'Test Notification');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE MyProcesses SET LastModified = ?, RecentNotification = ? WHERE ProcessID = ?',
            [date, 'Test Notification', 2],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('updateRecentNotificationMessage should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbMyProcessesProvider.updateRecentNotificationMessage(2, 'Test Notification');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE MyProcesses SET RecentNotification = ? WHERE ProcessID = ?',
            ['Test Notification', 2],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

    
    it('insertElseUpdateProcess should call insert with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: []};//mock empty response... object not present
            successCb(res);
        });

        let insertSpy = spyOn(clientDbMyProcessesProvider, 'insertMyProcess').and.callThrough();
        spyOn(clientDbMyProcessesProvider, 'getAllMyProcesses').and.callFake(() => {});

        clientDbMyProcessesProvider.insertElseUpdateProcess(2, '{\"key\": \"Value\"}').then(() => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from MyProcesses where ProcessID = ?',
                [2],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(insertSpy).toHaveBeenCalledWith(
                2, '{\"key\": \"Value\"}'
            );
        });
    });

    it('insertElseUpdateProcess should call update with corrent parameters when object present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: [123]};//mock object alredy present
            successCb(res);
        });

        let updateSpy = spyOn(clientDbMyProcessesProvider, 'updateMyProcess').and.callThrough();
        spyOn(clientDbMyProcessesProvider, 'getAllMyProcesses').and.callFake(() => {});

        clientDbMyProcessesProvider.insertElseUpdateProcess(2, '{\"key\": \"Value\"}').then(() => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from MyProcesses where ProcessID = ?',
                [2],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(updateSpy).toHaveBeenCalledWith(
                2, '{\"key\": \"Value\"}'
            );
        });
    });


    it('deleteMyProcess should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbMyProcessesProvider.deleteMyProcess(123);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM MyProcesses WHERE ProcessID = ?',
            [123],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

    

});
