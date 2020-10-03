/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { SocketProvider } from './../../providers/socket/socket';
import { Events } from 'ionic-angular';
import { NetworkInformationProvider } from './../../providers/network-information/network-information';
import { Component } from '@angular/core';
import { Network } from '@ionic-native/network';

/*
ModuleID: network
Description: A reuseable component for App which determines if the device is connected to internet
Location: ./components/network
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Component({
  selector: 'network',
  templateUrl: 'network.html'
})
export class NetworkComponent {
  message: string; // message string to be used to show message
  constructor(public networkservice: NetworkInformationProvider, public events: Events, public globalservice: ProcessDataProvider, public network: Network) {
    this.message = '';
    this.globalservice.isConnected = true;
    // if(navigator.onLine)
    // {
    //   this.networkservice.networkMessage='';
    // }
    // else
    // {
    //   this.networkservice.networkMessage='No Network Connection';
    // }
    
    // this.events.subscribe('internetisonnow', (data) => {
    //   if(data.network)
    //   {
    //      this.networkservice.networkMessage='';
    //   }
    //   else
    //   {
    //     this.networkservice.networkMessage='No Network Connection';
    //   }
    // });

    // watch network for a disconnect
    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.networkservice.networkMessage='No Network Connection';
    });
    // watch network for a connection
    let connectSubscription = this.network.onConnect().subscribe(() => {
      this.networkservice.networkMessage='';
    });
  }
  
  /**
  * checks for the values of internet connection.
  */
  ngDoCheck()
  {
    // if(navigator.onLine)
    // {
    //   this.networkservice.networkMessage='';
    // }
    // else
    // {
    //   this.networkservice.networkMessage='No Network Connection';
    // }
    if (this.networkservice.networkMessage)
    {
      this.message = this.networkservice.networkMessage;
      this.globalservice.isConnected = false;
    }
    else if (SocketProvider.message)
    {
      this.message = SocketProvider.message;
      this.globalservice.isConnected = false;
    }
    else
    {
      this.message = "";
      this.globalservice.isConnected = true;
    }
    if(this.message)
    {
      this.globalservice.hasheader = true;
    }
    else{
      this.globalservice.hasheader = false;
    }
  }

  getNetworkInformation(){
    return this.network;
  }

}
