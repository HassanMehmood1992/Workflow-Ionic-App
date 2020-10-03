import { StorageServiceProvider } from './../storage-service/storage-service';
import { ClientDbNotificationsProvider } from './client-db-notifications';
import { HelperProvider } from './../helper/helper';
import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';
import { ClientDbMyProcessesProvider } from '../client-db-my-processes/client-db-my-processes';
import * as moment from 'moment';



describe('Service: ClientDbNotificationsProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let clientDbNotificationsProvider: ClientDbNotificationsProvider;
    let clientDbMyProcessesProvider: ClientDbMyProcessesProvider;
    let platform: Platform;
    let storageService: StorageServiceProvider;

    class SQLiteStub {
        public create(params) {
            return new Promise((resolve) => {
                resolve(true);
            });
        }
    }

    class StroageServiceStub {
        getNotificationCounts(): any {
            let promise = new Promise((resolve, reject) => {
                resolve([{'InboxCount': '3', 'TaskCount': '3'},{},{'InboxCount': '3', 'TaskCount': '3'}]);
            });
            return promise;
          };

          setNotificationCounts(notificationCounts) {};
    }


    beforeEach(() => {

        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                { provide: Platform, useClass: PlatformMock },
                { provide: SQLite, useClass: SQLiteStub },
                { provide: StorageServiceProvider, useClass: StroageServiceStub},
                ClientDbProvider,
                HelperProvider,
                ClientDbNotificationsProvider,
                ClientDbMyProcessesProvider,
            ],
            imports: [

            ]
        });
        storageService = TestBed.get(StorageServiceProvider);
        platform = TestBed.get(Platform);
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbNotificationsProvider = TestBed.get(ClientDbNotificationsProvider);
        clientDbMyProcessesProvider = TestBed.get(ClientDbMyProcessesProvider);

    });

    it('should create an instance of storageService', () => {
        expect(storageService).toBeDefined();
    });
    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessObjectsProvider', () => {
        expect(clientDbNotificationsProvider).toBeDefined();
    });
    it('should create an instance of clientDbMyProcessesProvider', () => {
        expect(clientDbMyProcessesProvider).toBeDefined();
    });


    it('insertNotification should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbNotificationsProvider.insertNotification(123, 2, '{\"Subject\": \"Test Subject\", \"DateCreated\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}', 'Task', false);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'INSERT INTO Notifications (NotificationID, ProcessID, Value, NotificationType, LastModified) VALUES (?,?,?,?,?)',
            [123, 2, '{\"Subject\": \"Test Subject\", \"DateCreated\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}', 'Task', moment.utc('Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)').local().format('YYYY-MM-DD HH:mm:ss.SSSSSS')],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });
    
    


    it('updateNotification should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbNotificationsProvider.updateNotification(123, 2, '{\"Subject\": \"Test Subject\", \"DateCreated\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}', 'Task', false);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE Notifications SET ProcessID = ?, Value = ?, LastModified = ? WHERE NotificationID = ? and NotificationType = ?',
            [2, '{\"Subject\": \"Test Subject\", \"DateCreated\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}', moment.utc('Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)').local().format('YYYY-MM-DD HH:mm:ss.SSSSSS'), 123, 'Task'],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('insertElseUpdateNotification should call insert and other method calls with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: []};//mock empty response... object not present
            successCb(res);
        });

        let insertSpy = spyOn(clientDbNotificationsProvider, 'insertNotification').and.callThrough();
        spyOn(clientDbNotificationsProvider, 'getAllNotifications').and.callFake(() => {});
        let myProcessUpdateLastModifiedSpy = spyOn(clientDbMyProcessesProvider, 'updateLastModified');

        clientDbNotificationsProvider.insertElseUpdateNotification(123, 2, '{\"Subject\": \"Test Subject\", \"DateCreated\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}', 'Task', false, 1).then(() => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from Notifications where NotificationID = ? and NotificationType = ?',
                [123, 'Task'],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(insertSpy).toHaveBeenCalledWith(
                123, 
                2,
                '{\"Subject\": \"Test Subject\", \"DateCreated\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}', 
                'Task',
                false
            );

            expect(myProcessUpdateLastModifiedSpy).toHaveBeenCalledWith(2, moment.utc('Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)').local(), 'Test Subject');
        });
    });
    

    it('insertElseUpdateNotification should call insert and other method calls with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: [123]};//mock object alredy present
            successCb(res);
        });

        let updateSpy = spyOn(clientDbNotificationsProvider, 'updateNotification').and.callThrough();
        spyOn(clientDbNotificationsProvider, 'getAllNotifications').and.callFake(() => {});
        let myProcessUpdateLastModifiedSpy = spyOn(clientDbMyProcessesProvider, 'updateLastModified');

        clientDbNotificationsProvider.insertElseUpdateNotification(123, 2, '{\"Subject\": \"Test Subject\", \"DateCreated\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}', 'Task', false, 1).then(() => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from Notifications where NotificationID = ? and NotificationType = ?',
                [123, 'Task'],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(updateSpy).toHaveBeenCalledWith(
                123, 
                2,
                '{\"Subject\": \"Test Subject\", \"DateCreated\": \"Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)\"}', 
                'Task',
                false
            );

            expect(myProcessUpdateLastModifiedSpy).toHaveBeenCalledWith(2, moment.utc('Mon Nov 20 2017 12:29:12 GMT+0500 (PKT)').local(), 'Test Subject');
        });
    });


    it('getProcessTasksList should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbNotificationsProvider.getProcessTasksList(2);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'SELECT * from Notifications where ProcessID = ? and NotificationType = ?',
            [2, 'Task'],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('deleteNotification should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbNotificationsProvider.deleteNotification(2, 'Task');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM Notifications WHERE NotificationID = ? and NotificationType = ?',
            [2, 'Task'],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('deleteTasksByProcessId should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbNotificationsProvider.deleteTasksByProcessId(2);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM Notifications WHERE ProcessID = ? and NotificationType = ?',
            [2, 'Task'],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('updateRecentNotificationMessage should call subsequent with corrent parameters for Notification', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {NotificationType: 'Notification', Value: '{\"Message\": \"Test Subject\"}'};}, length: 1}};//mock non-enpty response
            successCb(res);
        });

        let myProcessUpdateLastModifiedSpy = spyOn(clientDbMyProcessesProvider, 'updateRecentNotificationMessage');

        clientDbNotificationsProvider.updateRecentNotificationMessage(2);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'SELECT * FROM Notifications where ProcessID = ? and JSON_EXTRACT(Value,\'$.NotificationAction\') = \'Pending\' ORDER BY LastModified DESC LIMIT 1',
            [2],
            jasmine.any(Function),
            jasmine.any(Function)
        );

        expect(myProcessUpdateLastModifiedSpy).toHaveBeenCalledWith(
            2,
            'Test Subject'
        );
    });


    it('updateRecentNotificationMessage should call subsequent methods with corrent parameters for empty message', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {NotificationType: 'Notification', Value: '{\"Message\": \"Test Subject\"}'};}, length: 0}};//mock non-enpty response
            successCb(res);
        });

        let myProcessUpdateLastModifiedSpy = spyOn(clientDbMyProcessesProvider, 'updateRecentNotificationMessage');

        clientDbNotificationsProvider.updateRecentNotificationMessage(2);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'SELECT * FROM Notifications where ProcessID = ? and JSON_EXTRACT(Value,\'$.NotificationAction\') = \'Pending\' ORDER BY LastModified DESC LIMIT 1',
            [2],
            jasmine.any(Function),
            jasmine.any(Function)
        );

        expect(myProcessUpdateLastModifiedSpy).toHaveBeenCalledWith(
            2,
            ''
        );
    });


    it('readNotification should call subsequent methods with corrent parameters if notification NOT presrnt', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Value: '{\"ProcessID\": 2, \"NotificationAction\": \"Pending\"}', ProcessID: 2};}, length: 0}};//mock non-enpty response
            successCb(res);
        });

        clientDbNotificationsProvider.readNotification(1001, 'Task').then((response) => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from Notifications where NotificationID = ? and NotificationType = ?',
                [1001, 'Task'],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(response).toBe('false');
        });
    });


    it('readNotification should call subsequent methods with corrent parameters for UNREAD notification', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Value: '{\"ProcessID\": 2, \"NotificationAction\": \"Pending\"}', ProcessID: 2};}, length: 1}};//mock non-enpty response
            successCb(res);
        });

        let storageServiceSetNotificationsCountsSpy = spyOn(storageService, 'setNotificationCounts');
        let updateNotificationSpy = spyOn(clientDbNotificationsProvider, 'updateNotification').and.callThrough();
        let updateRecentNotificationMessageSpy = spyOn(clientDbNotificationsProvider, 'updateRecentNotificationMessage');

        clientDbNotificationsProvider.readNotification(1001, 'Task').then((response) => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from Notifications where NotificationID = ? and NotificationType = ?',
                [1001, 'Task'],
                jasmine.any(Function),
                jasmine.any(Function)
            );
    
            expect(storageServiceSetNotificationsCountsSpy).toHaveBeenCalledWith(
                [{'InboxCount': '3', 'TaskCount': '3'},{},{'InboxCount': '2', 'TaskCount': '3'}]
            );

            expect (updateNotificationSpy).toHaveBeenCalledWith(
                1001,
                2,
                '{\"ProcessID\":2,\"NotificationAction\":\"Read\"}',
                'Notification',
                true
            );

            expect (updateRecentNotificationMessageSpy).toHaveBeenCalledWith(
                2
            );

            expect(response).toBe('true');
        });
    });


    it('readNotification should call subsequent methods with corrent parameters for READ notification', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Value: '{\"ProcessID\": 2, \"NotificationAction\": \"Read\"}', ProcessID: 2};}, length: 1}};//mock non-enpty response
            successCb(res);
        });

        clientDbNotificationsProvider.readNotification(1001, 'Task').then((response) => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from Notifications where NotificationID = ? and NotificationType = ?',
                [1001, 'Task'],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(response).toBe('false');
        });
    });


    it('unReadNotification should call subsequent methods with corrent parameters if notification NOT presrnt', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Value: '{\"ProcessID\": 2, \"NotificationAction\": \"Read\"}', ProcessID: 2};}, length: 0}};//mock empty response
            successCb(res);
        });

        clientDbNotificationsProvider.unReadNotification(1001, 'Task').then((response) => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from Notifications where NotificationID = ? and NotificationType = ?',
                [1001, 'Task'],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(response).toBe('false');
        });
    });


    it('unReadNotification should call subsequent methods with corrent parameters for UNREAD notification', () => {
        spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Value: '{\"ProcessID\": 2, \"NotificationAction\": \"Pending\"}', ProcessID: 2};}, length: 1}};//mock non-empty response
            successCb(res);
        });

        let runQuerySpy = clientDbNotificationsProvider.unReadNotification(1001, 'Task').then((response) => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from Notifications where NotificationID = ? and NotificationType = ?',
                [1001, 'Task'],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(response).toBe('false');
        });
    });


    //Tests for removeNotification method...
    it('removeNotification should call subsequent methods with corrent parameters if notification NOT presrnt', () => {
        spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Value: '{\"ProcessID\": 2, \"NotificationAction\": \"Pending\"}', ProcessID: 2};}, length: 0}};//mock empty response
            successCb(res);
        });

        let runQuerySpy = clientDbNotificationsProvider.removeNotification(1001, 'Task').then((response) => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from Notifications where NotificationID = ? and NotificationType = ?',
                [1001, 'Task'],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(response).toBe('false');
        });
    });


    //removeNotification should call subsequent methods with corrent parameters for PENDING NOTIFICATION..
    it('removeNotification should call subsequent methods with corrent parameters for PENDING NOTIFICATION', () => {
        spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Value: '{\"ProcessID\": 2, \"NotificationAction\": \"Pending\"}', ProcessID: 2};}, length: 1}};//mock non-empty response
            successCb(res);
        });

        let storageServiceSetNotificationsCountsSpy = spyOn(storageService, 'setNotificationCounts');
        let deleteNotificationSpy = spyOn(clientDbNotificationsProvider, 'deleteNotification').and.callThrough();
        let updateRecentNotificationMessageSpy = spyOn(clientDbNotificationsProvider, 'updateRecentNotificationMessage');

        clientDbNotificationsProvider.removeNotification(1001, 'Notification').then((response) => {
            
            expect(storageServiceSetNotificationsCountsSpy).toHaveBeenCalledWith([{'InboxCount': '3', 'TaskCount': '3'},{},{'InboxCount': '2', 'TaskCount': '3'}]);

            expect (deleteNotificationSpy).toHaveBeenCalledWith(1001, 'Notification');

            expect (updateRecentNotificationMessageSpy).toHaveBeenCalledWith(2);
        });
    });

    
    //removeNotification should call subsequent methods with corrent parameters for NON-PENDING NOTIFICATION..
    it('removeNotification should call subsequent methods with corrent parameters for NON-PENDING NOTIFICATION', () => {
        spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Value: '{\"ProcessID\": 2, \"NotificationAction\": \"Read\"}', ProcessID: 2};}, length: 1}};//mock non-empty response
            successCb(res);
        });

        let deleteNotificationSpy = spyOn(clientDbNotificationsProvider, 'deleteNotification').and.callThrough();
        let updateRecentNotificationMessageSpy = spyOn(clientDbNotificationsProvider, 'updateRecentNotificationMessage');

        clientDbNotificationsProvider.removeNotification(1001, 'Notification').then((response) => {
            
            expect (deleteNotificationSpy).toHaveBeenCalledWith(1001, 'Notification');

            expect (updateRecentNotificationMessageSpy).toHaveBeenCalledWith(2);
        });
    });


    //removeNotification should call subsequent methods with corrent parameters for PROCESS SPECIFIC TASK..
    it('removeNotification should call subsequent methods with corrent parameters for PROCESS SPECIFIC TASK', () => {
        spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Value: '{\"ProcessID\": 2, \"NotificationAction\": \"Read\"}', ProcessID: 2};}, length: 1}};//mock non-empty response
            successCb(res);
        });

        let storageServiceSetNotificationsCountsSpy = spyOn(storageService, 'setNotificationCounts');
        let deleteNotificationSpy = spyOn(clientDbNotificationsProvider, 'deleteNotification').and.callThrough();
        let updateRecentNotificationMessageSpy = spyOn(clientDbNotificationsProvider, 'updateRecentNotificationMessage');

        clientDbNotificationsProvider.removeNotification(1001, 'Task').then((response) => {

            expect(storageServiceSetNotificationsCountsSpy).toHaveBeenCalledWith([{'InboxCount': '3', 'TaskCount': '3'},{},{'InboxCount': '3', 'TaskCount': '2'}]);
            
            expect (deleteNotificationSpy).toHaveBeenCalledWith(1001, 'Task');

            expect (updateRecentNotificationMessageSpy).toHaveBeenCalledWith(2);
        });
    });


    //removeNotification should call subsequent methods with corrent parameters for NON-PROCESS SPECIFIC TASK..
    it('removeNotification should call subsequent methods with corrent parameters for NON-PROCESS SPECIFIC TASK', () => {
        spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Value: '{\"ProcessID\": 0, \"NotificationAction\": \"Read\"}', ProcessID: 2};}, length: 1}};//mock non-empty response
            successCb(res);
        });

        let storageServiceSetNotificationsCountsSpy = spyOn(storageService, 'setNotificationCounts');
        let deleteNotificationSpy = spyOn(clientDbNotificationsProvider, 'deleteNotification').and.callThrough();
        let updateRecentNotificationMessageSpy = spyOn(clientDbNotificationsProvider, 'updateRecentNotificationMessage');

        clientDbNotificationsProvider.removeNotification(1001, 'Task').then((response) => {

            expect(storageServiceSetNotificationsCountsSpy).toHaveBeenCalledWith([{'InboxCount': '3', 'TaskCount': '2'},{},{'InboxCount': '3', 'TaskCount': '3'}]);
            
            expect (deleteNotificationSpy).toHaveBeenCalledWith(1001, 'Task');

            expect (updateRecentNotificationMessageSpy).toHaveBeenCalledWith(0);
        });
    });

});
