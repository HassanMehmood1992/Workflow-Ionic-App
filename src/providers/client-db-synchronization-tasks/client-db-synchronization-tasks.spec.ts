import { ClientDbSynchronizationTasksProvider } from './client-db-synchronization-tasks';
import { HelperProvider } from './../helper/helper';
import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';



describe('Service: ClientDbSynchronizationTasksProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let clientDbSynchronizationTasksProvider: ClientDbSynchronizationTasksProvider;
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
                ClientDbSynchronizationTasksProvider
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbSynchronizationTasksProvider = TestBed.get(ClientDbSynchronizationTasksProvider);

    });

    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessWorkflowsProvider', () => {
        expect(clientDbSynchronizationTasksProvider).toBeDefined();
    });


    it('insertSynchronizationTask should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbSynchronizationTasksProvider.insertSynchronizationTask('TestTarget', 'TestObjectType', 2, 'TestAction', {}, 'TestTableNames', 123, 'TestObjectKey');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'INSERT INTO SynchronizationTasks (Target, ObjectType, ProcessID, Action, TaskQuery, TableNames, ServerItemID, ObjectKey, TimeStamp) VALUES (?,?,?,?,?,?,?,?,?)',
            ['TestTarget', 'TestObjectType', 2, 'TestAction', {}, 'TestTableNames', 123, 'TestObjectKey', jasmine.any(Number)],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('insertNewSynchronizationTask should call ClientDbProvider.runQuery() with corrent parameters in case of no previous similar task(s)', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {length: 0}};//mock empty response
            successCb(res);
        });

        clientDbSynchronizationTasksProvider.insertNewSynchronizationTask('TestTarget', 'TestObjectType', 2, 'TestAction', {}, 'TestTableNames', 123, 'TestObjectKey');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'SELECT * from SynchronizationTasks where ServerItemID = ? and ObjectKey = ? and TableNames = ? and ProcessID = ?',
            [123, 'TestObjectKey', 'TestTableNames', 2],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('insertNewSynchronizationTask should delete and add new task correctly for USER SETTINGS', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {TaskQuery: '{\"methodName\": \"updateUserSettings\", \"settingName\": \"TestSetting\", \"processId\": \"2\"}', SynchronizationTasksID: 1234};}, length: 1}};//mock non-enpty response
            successCb(res);
        });

        let deleteSynchronizationTaskSpy = spyOn(clientDbSynchronizationTasksProvider, 'deleteSynchronizationTask');
        let insertSynchronizationTaskSpy = spyOn(clientDbSynchronizationTasksProvider, 'insertSynchronizationTask').and.callThrough();

        clientDbSynchronizationTasksProvider.insertNewSynchronizationTask('TestTarget', 'TestObjectType', 2, 'TestAction', '{\"settingName\": \"TestSetting\", \"processId\": \"2\"}', 'TestTableNames', 123, 'TestObjectKey').then(() => {
            
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from SynchronizationTasks where ServerItemID = ? and ObjectKey = ? and TableNames = ? and ProcessID = ?',
                [123, 'TestObjectKey', 'TestTableNames', 2],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(deleteSynchronizationTaskSpy).toHaveBeenCalledWith(1234, 0);

            expect(insertSynchronizationTaskSpy).toHaveBeenCalledWith(
                'TestTarget', 'TestObjectType', 2, 'TestAction', '{\"settingName\": \"TestSetting\", \"processId\": \"2\"}', 'TestTableNames', 123, 'TestObjectKey'
            );
        });
    });


    it('insertNewSynchronizationTask should delete and add new task correctly for NOTIFICATIONS', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {TaskQuery: '{\"methodName\": \"updateNotification\", \"notificationId\": \"1122\", \"action\": \"TestAction\"}', SynchronizationTasksID: 1234};}, length: 1}};//mock non-enpty response
            successCb(res);
        });

        let deleteSynchronizationTaskSpy = spyOn(clientDbSynchronizationTasksProvider, 'deleteSynchronizationTask');
        let insertSynchronizationTaskSpy = spyOn(clientDbSynchronizationTasksProvider, 'insertSynchronizationTask').and.callThrough();

        clientDbSynchronizationTasksProvider.insertNewSynchronizationTask('TestTarget', 'TestObjectType', 2, 'TestAction', '{\"notificationId\": \"1122\", \"action\": \"TestAction\"}', 'TestTableNames', 123, 'TestObjectKey').then(() => {
            
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from SynchronizationTasks where ServerItemID = ? and ObjectKey = ? and TableNames = ? and ProcessID = ?',
                [123, 'TestObjectKey', 'TestTableNames', 2],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(deleteSynchronizationTaskSpy).toHaveBeenCalledWith(1234, 0);

            expect(insertSynchronizationTaskSpy).toHaveBeenCalledWith(
                'TestTarget', 'TestObjectType', 2, 'TestAction', '{\"notificationId\": \"1122\", \"action\": \"TestAction\"}', 'TestTableNames', 123, 'TestObjectKey'
            );
        });
    });


    it('insertNewSynchronizationTask should delete and add new task correctly for SAVED FORMS', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {TaskQuery: '{\"methodName\": \"saveFormData\", \"action\": \"TestAction\", \"value\": {\"notificationId\": \"1122\"}}', SynchronizationTasksID: 1234};}, length: 1}};//mock non-enpty response
            successCb(res);
        });

        let deleteSynchronizationTaskSpy = spyOn(clientDbSynchronizationTasksProvider, 'deleteSynchronizationTask');
        let insertSynchronizationTaskSpy = spyOn(clientDbSynchronizationTasksProvider, 'insertSynchronizationTask').and.callThrough();

        clientDbSynchronizationTasksProvider.insertNewSynchronizationTask('TestTarget', 'TestObjectType', 2, 'TestAction', '{\"notificationId\": \"1122\", \"action\": \"TestAction\"}', 'TestTableNames', 123, 'TestObjectKey').then(() => {
            
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from SynchronizationTasks where ServerItemID = ? and ObjectKey = ? and TableNames = ? and ProcessID = ?',
                [123, 'TestObjectKey', 'TestTableNames', 2],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(deleteSynchronizationTaskSpy).toHaveBeenCalledWith(1234, 0);

            expect(insertSynchronizationTaskSpy).toHaveBeenCalledWith(
                'TestTarget', 'TestObjectType', 2, 'TestAction', '{\"notificationId\": \"1122\", \"action\": \"TestAction\"}', 'TestTableNames', 123, 'TestObjectKey'
            );
        });
    });


    it('updateSynchronizationTask should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbSynchronizationTasksProvider.updateSynchronizationTask(1234, 'TestTarget', 'TestObjectType', 2, 'TestAction', {}, 'TestTableNames', 123, 'TestObjectKey');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE SynchronizationTasks SET Target = ?, ObjectType = ?, ProcessID = ?, Action = ?, TaskQuery = ?, TableNames = ?, ServerItemID = ?, ObjectKey = ?, TimeStamp = ? WHERE SynchronizationTasksID = ?',
            ['TestTarget', 'TestObjectType', 2, 'TestAction', {}, 'TestTableNames', 123, 'TestObjectKey', jasmine.any(Number), 1234],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('deleteSynchronizationTask should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbSynchronizationTasksProvider.deleteSynchronizationTask(2, 0);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM SynchronizationTasks WHERE SynchronizationTasksID = ?',
            [2],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

});
