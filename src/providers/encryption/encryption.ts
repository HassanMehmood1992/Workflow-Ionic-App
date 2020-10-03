/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: EncryptionProvider
Description: Service to provide encryption decryption.
Location: ./providers/EncryptionProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/


/**
* Importing neccassary libraries and modules for this class 
*/
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';



/*
  Generated class for the EncryptionProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class EncryptionProvider {

  constructor() {
  }

  /**
  Name:          encryptData
  Description:   Encypt data to save in current workflows list
  Author:        Majid Hussain
  Last Updated:  05-02-2015
  */
  encryptData (data) {
    /*eslint-disable */
    var key = CryptoJS.enc.Utf8.parse('0807060504030201');
    var iv = CryptoJS.enc.Utf8.parse('0807060504030201');

    var encryptedData = CryptoJS.AES.encrypt(data, key, { iv: iv, keySize: 128 / 8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    /*eslint-enable */
    return encryptedData.toString();
  }

  /**
  Name:          decryptData
  Description:   Decrypt data to save in current workflows list
  Author:        Majid Hussain
  Last Updated:  05-02-2015
  */
  decryptData (encrypteddata) {
    /*eslint-disable */
    var key = CryptoJS.enc.Utf8.parse('0807060504030201');
    var iv = CryptoJS.enc.Utf8.parse('0807060504030201');

    var DecrypticData = CryptoJS.AES.decrypt(encrypteddata,key,{ iv: iv, keySize: 128 / 8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
    /*eslint-enable */
    return DecrypticData.toString();
  }

}
