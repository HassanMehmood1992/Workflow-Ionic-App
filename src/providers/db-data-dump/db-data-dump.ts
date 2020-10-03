/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DbDataDumpProvider
Description: Service which initialize database
Location: ./providers/DbDataDumpProvider
Author: Arsalan
Version: 1.0.0
Modification history: none
*/


/**
* Importing neccassary libraries and modules for this class 
*/
import { ClientDbAppResourcesProvider } from './../client-db-app-resources/client-db-app-resources';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

/*
  Generated class for the DbDataDumpProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DbDataDumpProvider {

  /**
   * Class constructor
   */
  constructor(public ClientDBAppResources: ClientDbAppResourcesProvider) {
  }

  /**
   * Dump empty initialization data for application settings in the SQLite
   */
  dumpData() {
    let promise = new Promise((resolve, reject) => {

      this.ClientDBAppResources.initDB()
      .then(() => {
        this.ClientDBAppResources.getAllAppResources()
        .then(() => {
          var AppResourceList = this.ClientDBAppResources.returnAllAppResourceList();
          if (AppResourceList.length === 0) {
            this.ClientDBAppResources.insertAppResource(0, 'AppSettings', '{"Out_of_Office":{},"Email_Notification":{"Allow":"True"},"Push_Notification":{"Allow":"True"},"Proxy_Approver":{}}');
            this.ClientDBAppResources.insertAppResource(0, 'PlatformSettings', '{"Out_of_Office":{},"Email_Notification":{"Allow":"True"},"Push_Notification":{"Allow":"True"},"Proxy_Approver":{}}');
          }
          resolve();
        }).catch(error=>{
          alert(error);
        });
      }).catch(error=>{
        alert(error);
      });
    });
    return promise;
  }

}
