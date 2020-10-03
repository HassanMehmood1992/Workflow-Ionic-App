import { async, TestBed } from '@angular/core/testing';
import { Platform } from 'ionic-angular/index';
import { PlatformMock } from '../../../test-config/mocks-ionic';
import {HelperProvider} from './helper'
import 'rxjs/add/observable/from';




describe('Service: Helper', () => {


    let platform: Platform;


    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [],
            providers: [
                HelperProvider,
                { provide: Platform, useClass: PlatformMock }
            ],
            imports: [

            ]
        });
        platform = TestBed.get(Platform);
    }));

    it('should define the service HelperProvider', () => {
        expect(HelperProvider).toBeDefined();
    });

    it('spliceSlashes should remove slashes', () => {
        var test = new HelperProvider();
        var data = "\\\\sd\\\\dsa\\\\ff"
        expect(test.spliceSlashes(data)).toEqual("\\sd\\dsa\\ff");
    });

    it('addSlashes should add slashes', () => {
        var test = new HelperProvider();
        var data = "\\sd\\dsa\\ff"
        expect(test.addSlashes(data)).toEqual("\\\\sd\\\\dsa\\\\ff");
    });
    it('parseJSONifString should return an object', () => {
        var test = new HelperProvider();
        var data = "{\"test\":true}"
        expect(typeof (test.parseJSONifString(data))).toEqual("object");
    });


});
