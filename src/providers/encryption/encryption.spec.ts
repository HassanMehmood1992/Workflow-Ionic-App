import { async, TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import {EncryptionProvider} from './encryption'
import 'rxjs/add/observable/from';




describe('Service: EncryptionProvider', () => {


    let platform: Platform;


    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                EncryptionProvider,
                { provide: Platform, useClass: PlatformMock }
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
    }));

    it('should define the service EncryptionProvider', () => {
        expect(EncryptionProvider).toBeDefined();
    });

    it('encryptData should encrypt data', () => {
        var test = new EncryptionProvider();
        var data = "testdata"
        expect(test.encryptData(data)).toEqual("bpwqe2hQrYmZPYRI1MrL8w==");
    });
    it('decryptData should decrypt data', () => {
        var test = new EncryptionProvider();
        var data = "bpwqe2hQrYmZPYRI1MrL8w=="
        expect(test.decryptData(data)).toEqual("testdata");
    });

     it('encrypt and decrypt conversion should be possible', () => {
        var test = new EncryptionProvider();
        var data = "testdata"
        expect(test.decryptData(test.encryptData(data))).toEqual("testdata");
    });


});
