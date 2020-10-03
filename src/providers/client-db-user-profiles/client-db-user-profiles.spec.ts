import { ClientDbUserProfilesProvider } from './client-db-user-profiles';
import { HelperProvider } from './../helper/helper';
import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';



describe('Service: ClientDbUserProfilesProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let clientDbUserProfilesProvider: ClientDbUserProfilesProvider;
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
                ClientDbUserProfilesProvider
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbUserProfilesProvider = TestBed.get(ClientDbUserProfilesProvider);

    });

    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbUserProfilesProvider', () => {
        expect(clientDbUserProfilesProvider).toBeDefined();
    });


    it('insertUserProfile should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbUserProfilesProvider.insertUserProfile(20, '{\"name\":\"Value\"}');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'INSERT OR IGNORE INTO UserProfiles (UserID, Value, LastModified) VALUES (?,?,?)',
            [20, '{\"name\":\"Value\"}', jasmine.any(Object)],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('updateUserProfile should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbUserProfilesProvider.updateUserProfile(20, '{\"name\":\"Value\"}');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE UserProfiles SET Value = ?, LastModified = ? WHERE UserID = ?',
            ['{\"name\":\"Value\"}', jasmine.any(Object), 20],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('insertElseUpdateUserProfile should call insert with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: []};//mock empty response... object not present
            successCb(res);
        });

        spyOn(clientDbUserProfilesProvider, 'insertUserProfile').and.callThrough();

        clientDbUserProfilesProvider.insertElseUpdateUserProfile(20, '{\"name\":\"Value\"}').then(() => {

            expect(runQuerySpy).toHaveBeenCalledWith(
                'INSERT OR IGNORE INTO UserProfiles (UserID, Value, LastModified) VALUES (?,?,?)',
                [20, '{\"name\":\"Value\"}', jasmine.any(Object)],
                jasmine.any(Function),
                jasmine.any(Function)
            );
        });
    });

    it('insertElseUpdateUserProfile should call update with corrent parameters when object present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {Key: 'value'};}, length: 1}};//mock non-enpty response
            successCb(res);
        });

        spyOn(clientDbUserProfilesProvider, 'updateUserProfile').and.callThrough();

        clientDbUserProfilesProvider.insertElseUpdateUserProfile(20, '{\"name\":\"Value\"}').then(() => {

            expect(runQuerySpy).toHaveBeenCalledWith(
                'UPDATE UserProfiles SET Value = ?, LastModified = ? WHERE UserID = ?',
                ['{\"name\":\"Value\"}', jasmine.any(Object), 20],
                jasmine.any(Function),
                jasmine.any(Function)
            );
        });
    });


    it('deleteUserProfile should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbUserProfilesProvider.deleteUserProfile(123);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM UserProfiles WHERE UserID = ?',
            [123],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

});
