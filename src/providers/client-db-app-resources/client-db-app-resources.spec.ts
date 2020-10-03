import { ClientDbAppResourcesProvider } from './client-db-app-resources';
import { HelperProvider } from './../helper/helper';

import { ClientDbProvider } from './../client-db/client-db';
import { SQLite } from '@ionic-native/sqlite';
import { TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import 'rxjs/add/observable/from';



describe('Service: ClientDbAppResourcesProvider', () => {

    let clientDbProvider: ClientDbProvider;
    let clientDbAppResourcesProvider: ClientDbAppResourcesProvider;
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
                ClientDbAppResourcesProvider
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
        clientDbProvider = TestBed.get(ClientDbProvider);
        clientDbAppResourcesProvider = TestBed.get(ClientDbAppResourcesProvider);

    });

    it('should create an instance of platform', () => {
        expect(platform).toBeDefined();
    });
    it('should create an instance of clientDbProvider', () => {
        expect(clientDbProvider).toBeDefined();
    });
    it('should create an instance of clientDbProcessObjectsProvider', () => {
        expect(clientDbAppResourcesProvider).toBeDefined();
    });


    it('insertAppResource should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbAppResourcesProvider.insertAppResource(123, 'key', 'Value');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'INSERT INTO AppResources (Identifier, ResourceKey, ResourceValue, LastModified) VALUES (?,?,?,?)',
            [123, 'key', 'Value', jasmine.any(Object)],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

    
    it('updateAppResource should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbAppResourcesProvider.updateAppResource('key', 'Value');

        expect(runQuerySpy).toHaveBeenCalledWith(
            'UPDATE AppResources SET ResourceValue = ?, LastModified = ? WHERE ResourceKey = ?',
            ['Value', jasmine.any(Object), 'key'],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });


    it('deleteAppResource should call ClientDbProvider.runQuery() with corrent parameters', () => {
        let runQuerySpy = spyOn(clientDbProvider, 'runQuery');

        clientDbAppResourcesProvider.deleteAppResource(1122);

        expect(runQuerySpy).toHaveBeenCalledWith(
            'DELETE FROM AppResources WHERE AppResourceID = ?',
            [1122],
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

});
