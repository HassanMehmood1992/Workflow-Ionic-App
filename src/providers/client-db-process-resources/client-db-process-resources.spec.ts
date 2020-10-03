import { ClientDbProcessResourcesProvider } from './client-db-process-resources';
import { HelperProvider } from './../helper/helper';
import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';



describe('Service: ClientDbProcessResourcesProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let clientDbProcessResourcesProvider: ClientDbProcessResourcesProvider;
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
                ClientDbProcessResourcesProvider
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbProcessResourcesProvider = TestBed.get(ClientDbProcessResourcesProvider);

    });

    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessResourcesProvider', () => {
        expect(clientDbProcessResourcesProvider).toBeDefined();
    });


    it('insertProcessResource should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessResourcesProvider.insertProcessResource(2, 123, 'TestKey', '{\"name\":\"Value\"}');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'INSERT INTO ProcessResources (ProcessID, Identifier, ObjectKey, Value, LastModified) VALUES (?,?,?,?,?)',
            [2, 123, 'TestKey', '{\"name\":\"Value\"}', jasmine.any(Object)],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('updateProcessResource should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessResourcesProvider.updateProcessResource(2, 'TestKey', '{\"name\":\"Value\"}', 123);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE ProcessResources SET Value = ?, Identifier = ?, LastModified = ? WHERE ProcessID = ? and ObjectKey = ?',
            ['{\"name\":\"Value\"}', 123, jasmine.any(Object), 2, 'TestKey'],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('insertElseUpdateProcessResource should call insert with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: []};//mock empty response... object not present
            successCb(res);
        });

        spyOn(clientDbProcessResourcesProvider, 'insertProcessResource').and.callThrough();

        clientDbProcessResourcesProvider.insertElseUpdateProcessResource(2, 123, 'TestKey', '{\"name\":\"Value\"}').then(() => {

            expect(runQuerySpy).toHaveBeenCalledWith(
                'INSERT INTO ProcessResources (ProcessID, Identifier, ObjectKey, Value, LastModified) VALUES (?,?,?,?,?)',
                [2, 123, 'TestKey', '{\"name\":\"Value\"}', jasmine.any(Object)],
                jasmine.any(Function),
                jasmine.any(Function)
            );
        });
    });

    it('insertElseUpdateProcessResource should call update with corrent parameters when object present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: [123]};//mock object alredy present
            successCb(res);
        });

        spyOn(clientDbProcessResourcesProvider, 'updateProcessResource').and.callThrough();

        clientDbProcessResourcesProvider.insertElseUpdateProcessResource(2, 123, 'TestKey', '{\"name\":\"Value\"}').then(() => {

            expect(runQuerySpy).toHaveBeenCalledWith(
                'UPDATE ProcessResources SET Value = ?, Identifier = ?, LastModified = ? WHERE ProcessID = ? and ObjectKey = ?',
                ['{\"name\":\"Value\"}', 123, jasmine.any(Object), 2, 'TestKey'],
                jasmine.any(Function),
                jasmine.any(Function)
            );
        });
    });


    it('deleteProcessResource should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessResourcesProvider.deleteProcessResource(123);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM ProcessResources WHERE ProcessResourcesID = ?',
            [123],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('deleteByProcessId should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessResourcesProvider.deleteByProcessId(2);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM ProcessResources WHERE ProcessID = ?',
            [2],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

});
