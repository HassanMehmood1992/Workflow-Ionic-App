import { ClientDbProcessWorkflowsProvider } from './client-db-process-workflows';
import { HelperProvider } from './../helper/helper';
import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';



describe('Service: ClientDbProcessWorkflowsProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let clientDbProcessWorkflowsProvider: ClientDbProcessWorkflowsProvider;
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
                ClientDbProcessWorkflowsProvider
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbProcessWorkflowsProvider = TestBed.get(ClientDbProcessWorkflowsProvider);

    });

    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessWorkflowsProvider', () => {
        expect(clientDbProcessWorkflowsProvider).toBeDefined();
    });


    it('insertProcessWorkflow should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessWorkflowsProvider.insertProcessWorkflow(2, 123, '{\"name\":\"Value\"}', false);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'INSERT INTO ProcessWorkflows (ProcessID, WorkflowID, Value, LastModified) VALUES (?,?,?,?)',
            [2, 123, '{\"name\":\"Value\"}', jasmine.any(Object)],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('updateProcessWorkflow should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessWorkflowsProvider.updateProcessWorkflow(1234, 2, 123, '{\"name\":\"Value\"}', false);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE ProcessWorkflows SET ProcessID = ?, WorkflowID = ?, Value = ?, LastModified = ? WHERE ProcessWorkflowID = ?',
            [2, 123, '{\"name\":\"Value\"}', jasmine.any(Object), 1234],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('insertElseUpdateProcessWorkflow should call insert with corrent parameters when object not present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: []};//mock empty response... object not present
            successCb(res);
        });

        spyOn(clientDbProcessWorkflowsProvider, 'insertProcessWorkflow').and.callThrough();

        clientDbProcessWorkflowsProvider.insertElseUpdateProcessWorkflow(2, 123, '{\"name\":\"Value\"}', false, 0).then(() => {

            expect(runQuerySpy).toHaveBeenCalledWith(
                'INSERT INTO ProcessWorkflows (ProcessID, WorkflowID, Value, LastModified) VALUES (?,?,?,?)',
                [2, 123, '{\"name\":\"Value\"}', jasmine.any(Object)],
                jasmine.any(Function),
                jasmine.any(Function)
            );
        });
    });

    it('insertElseUpdateProcessWorkflow should call update with corrent parameters when object present', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery').and.callFake((query, dataArray, successCb, errorCb) => {
            var res = {rows: {item (param) {return {ProcessWorkflowID: 1234};}, length: 1}};//mock non-enpty response
            successCb(res);
        });

        spyOn(clientDbProcessWorkflowsProvider, 'updateProcessWorkflow').and.callThrough();

        clientDbProcessWorkflowsProvider.insertElseUpdateProcessWorkflow(2, 123, '{\"name\":\"Value\"}', false, 0).then(() => {

            expect(runQuerySpy).toHaveBeenCalledWith(
                'UPDATE ProcessWorkflows SET ProcessID = ?, WorkflowID = ?, Value = ?, LastModified = ? WHERE ProcessWorkflowID = ?',
                [2, 123, '{\"name\":\"Value\"}', jasmine.any(Object), 1234],
                jasmine.any(Function),
                jasmine.any(Function)
            );
        });
    });


    it('deleteProcessWorkflow should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessWorkflowsProvider.deleteProcessWorkflow(123);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM ProcessWorkflows WHERE ProcessWorkflowID = ?',
            [123],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('deleteByProcessId should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessWorkflowsProvider.deleteByProcessId(2);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM ProcessWorkflows WHERE ProcessID = ?',
            [2],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('getWorkFlow should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbProcessWorkflowsProvider.getWorkFlow(2, 123);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'SELECT * from ProcessWorkflows where ProcessID = ? and WorkflowID = ?',
            [2, 123],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

});
