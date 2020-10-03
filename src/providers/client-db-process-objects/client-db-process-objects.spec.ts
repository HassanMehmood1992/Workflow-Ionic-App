import { HelperProvider } from './../helper/helper';
import { ClientDbProcessObjectsProvider } from './client-db-process-objects';
import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';



describe('Service: ClientDbProcessObjectsProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let clientDbProcessObjectsProvider: ClientDbProcessObjectsProvider;
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
                ClientDbProcessObjectsProvider
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbProcessObjectsProvider = TestBed.get(ClientDbProcessObjectsProvider);

    });

    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessObjectsProvider', () => {
        expect(clientDbProcessObjectsProvider).toBeDefined();
    });


    it('insertProcessObject should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessObjectsProvider.insertProcessObject(123, 2, 'Test Description', { name: 'Value' });

        expect(runQuerySpy).toHaveBeenCalledWith(
            'INSERT OR IGNORE INTO ProcessObjects (ProcessObjectID, ProcessID, ObjectDescription, Value, LastModified) VALUES (?,?,?,?,?)',
            [123, 2, 'Test Description', { name: 'Value' }, jasmine.any(Object)],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('updateProcessObject should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessObjectsProvider.updateProcessObject(123, 2, 'Test Description', { name: 'Value' });

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE ProcessObjects SET Value = ?, LastModified = ? WHERE ProcessObjectID = ? and ProcessID = ? and ObjectDescription = ?',
            [{ name: 'Value' }, jasmine.any(Object), 123, 2, 'Test Description'],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('insertElseUpdateProcessObject should call insert with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: []};//mock empty response... object not present
            successCb(res);
        });

        let insertSpy = spyOn(clientDbProcessObjectsProvider, 'insertProcessObject').and.callThrough();
        spyOn(clientDbProcessObjectsProvider, 'getAllProcessObjects').and.callFake(() => {})

        clientDbProcessObjectsProvider.insertElseUpdateProcessObject(123, 2, 'Test Description', { name: 'Value' }, 1).then(() => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from ProcessObjects where ProcessObjectID = ?',
                [123],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(insertSpy).toHaveBeenCalledWith(
                123, 
                2, 
                'Test Description', 
                { name: 'Value' }
            );
        });
    });

    it('insertElseUpdateProcessObject should call update with corrent parameters when object present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: [123]};//mock object alredy present
            successCb(res);
        });

        let updateSpy = spyOn(clientDbProcessObjectsProvider, 'updateProcessObject').and.callThrough();
        spyOn(clientDbProcessObjectsProvider, 'getAllProcessObjects').and.callFake(() => {})

        clientDbProcessObjectsProvider.insertElseUpdateProcessObject(123, 2, 'Test Description', { name: 'Value' }, 1).then(() => {
            expect(runQuerySpy).toHaveBeenCalledWith(
                'SELECT * from ProcessObjects where ProcessObjectID = ?',
                [123],
                jasmine.any(Function),
                jasmine.any(Function)
            );

            expect(updateSpy).toHaveBeenCalledWith(
                123, 
                2, 
                'Test Description', 
                { name: 'Value' }
            );
        });
    });


    it('deleteProcessObject should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessObjectsProvider.deleteProcessObject(123);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM ProcessObjects WHERE ProcessObjectID = ?',
            [123],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('deleteByProcessId should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessObjectsProvider.deleteByProcessId(1122);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM ProcessObjects WHERE ProcessID = ?',
            [1122],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('getProcessObjects should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessObjectsProvider.getProcessObjects(2, 'Test Description');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'SELECT * from ProcessObjects where ProcessID = ? and ObjectDescription = ?',
            [2, 'Test Description'],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('getSingleProcessObject should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessObjectsProvider.getSingleProcessObject(2, 'Test Description', 123);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'SELECT * from ProcessObjects where ProcessID = ? and ObjectDescription = ? and ProcessObjectID = ?',
            [2, 'Test Description', 123],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

    

});
