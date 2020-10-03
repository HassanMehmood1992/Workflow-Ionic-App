/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: NetworkInformationProvider
Description: Contains information about network and which alert to show.
Location: ./providers/NetworkInformationProvider
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';


/*
  Generated class for the NetworkInformationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NetworkInformationProvider {

  public appAlert: string = "";// Alert to show in the application tabs
  public processAlert: string = "";// Alert to show in the process tabs
  public networkMessage: string = "";// Mesage to display in case of network message
  public socketMessage: string = ""; // Message to show message for socket connection disconnection
  private message: string = "";// Message to show in the top banner

  /**
   * Getter for header message
   */
  public get MESSAGE()
  {
    if(this.networkMessage)
    {
      this.message = this.networkMessage;
    }
    else if(this.socketMessage)
    {
      this.message = this.socketMessage;
    }
    else if (this.appAlert || this.processAlert)
    {
      this.message = this.appAlert;
    }
    return this.message;
  }

}
