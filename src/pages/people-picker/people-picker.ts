import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { FormControl } from '@angular/forms';

/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-people-picker
Description: Reuseable component to render people picker popup to select user. Also caches user.
Location: ./pages/page-people-picker
Author: Hassan
Version: 1.0.0
Modification history: none
*/

/**
* Importing neccassary libraries and modules for this class 
*/
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { SocketProvider } from './../../providers/socket/socket';
import { ClientDbUserProfilesProvider } from './../../providers/client-db-user-profiles/client-db-user-profiles';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';

/**
 * Generated class for the PeoplePickerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-people-picker',
  templateUrl: 'people-picker.html',
})
export class PeoplePickerPage {

  @ViewChild('searchbar') searchbar;

  maxSelectedItems: Number;//maximum selected items in the lookup
  searchControl: FormControl;//search control for the people picker
  selfSelection: Boolean;//flag specifying current user self selection is allowed

  // loading flag if the items-method is a function
  showLoadingIcon: Boolean = false;

  // the items, selected items and the query for the list
  searchItems: any[] = [];//search results items list
  selectedItems: any[] = [];//selected items list
  searchQuery: string = '';

  /**
  * Class constructor
  */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public globalservice: ProcessDataProvider,
    private clientDBUserProfilesProvider: ClientDbUserProfilesProvider,
    private socket: SocketProvider,
    private toast: ToastController,
    private storage: StorageServiceProvider) {
    this.maxSelectedItems = navParams.get("maxSelectedItems");
    this.selfSelection = navParams.get("selfSelection");
    this.selectedItems = navParams.get("peoplePickerArray");
    this.searchControl = new FormControl();
    this.searchControl.valueChanges.debounceTime(1200).subscribe(search => {
        if (search.length > 0) {
          this.filterItems()
        }
        else if (search.length <= 0 && this.searchQuery.length > 0) {
          this.searchQuery = search.substring(0,20);
          this.filterItems()
        }
        else {
          this.searchQuery = "";
        }
      
    })
  }

  /**
  * Call local db followed by server call to retrieve
  * lookup items on initialization
  */
  ngOnInit()
  {
    this.searchQuery = "";
    this.filterItems();
  }

  /**
  * Call local db followed by server call to retrieve
  * lookup items
  */
  filterItems() {
    var val = this.searchQuery

    //show loading icon..
    this.showLoadingIcon = true;

    //locall call..
    this.localCall(val).then((items) => {
      if (items.length != 0) {
        this.searchItems = items;
      }
    })

    //server call
    this.serverCall(val).then((items) => {
      if (items.length != 0) {
        this.searchItems = items;
      }
      //hide loading icon..
      this.showLoadingIcon = false;
    }).catch((error) => {
      //hide loading icon..
      this.showLoadingIcon = false;
    })
  }


  /**
  * Call local db to show cached users..
  */
  localCall(query: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      var result = [];
      var item: any = {};
      this.clientDBUserProfilesProvider.getAllUserProfiles()
        .then(() => {
          this.storage.getUser().then((user) => {
            result = [];
            var UserProfileList = this.clientDBUserProfilesProvider.returnAllUserProfileList();
            if (UserProfileList) {
              for (var i = 0; i < UserProfileList.length; i++) {
                item = JSON.parse(UserProfileList.item(i).Value);
                if (item.DisplayName.toLowerCase().includes(query.toLowerCase()) || item.LoginID.toLowerCase().includes(query.toLowerCase()) || item.Email.toLowerCase().includes(query.toLowerCase())) {
                  if (this.selfSelection === false) {
                    if (user.Email !== item.Email) {
                      result.push(item);
                    }
                  }
                  else {
                    result.push(item);
                  }
                }
              }
            }
            result.sort((a, b) => {
              var nameA = a.DisplayName.toLowerCase(), nameB = b.DisplayName.toLowerCase();
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              return 0;
            });
            resolve(result);
          });
        });
    });
    return promise;
  }

  /**
  * Call web service to retrieve users from server..
  */
  serverCall(query: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      if (query !== '') {
        var PeoplePickerObject = {
          userNameInfix: query,
          diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
          operationType : 'USER'
        };
        this.socket.callWebSocketService('getADUsers', PeoplePickerObject)
          .then((result) => {
            var people = [];
            this.storage.getUser().then((user) => {
              //Do not allow self - selection if selfSelection is false..

              for (var i = 0; i < result.length; i++) {
                if (this.selfSelection === false) {
                  if (user.Email !== result[i].Email) {
                    people.push(result[i]);
                  }
                }
                else {
                  people.push(result[i]);
                }
              }
              resolve(people);
            });
          }).catch((error) => {
            this.toast.create({
              message: 'No Connectivity.. Showing local cached users',
              duration: 3000,
              position: 'middle'
            }).present();
            resolve([]);
          });
      }
      else {
        resolve([]);
      }
    });
    return promise;
  }

  /**
  * Select an item and add to the selected items list
  */
  selectItem(item) {

    if (this.maxSelectedItems != 1 &&
      this.maxSelectedItems <= this.selectedItems.length) {
      return;
    }

    if (!this.isKeyValueInObjectArray(this.selectedItems, item.Email)) {
      if (this.maxSelectedItems == 1) {
        this.selectedItems = [item];
      } else {
        this.selectedItems = this.selectedItems.concat([item]);
      }
      this.cacheUser(item);
    }
  }

  /**
  * cahe the user in localDB as well as on the Server
  */
  cacheUser(user) {
    var cacheUser = {
      logOnId: user.UserName,
      diagnosticLogging: this.globalservice.appDiagnosticLog.toString(),
      operationType : 'USER'
    }
    this.socket.callWebSocketService('cacheNewUser', cacheUser)
      .then((result) => {
        if (typeof result === 'object') {
          if (!result.Error) {
            this.clientDBUserProfilesProvider.insertUserProfile(parseInt(result[0].UserID), JSON.stringify(result[0]));
          }
        }
      });
  }

  /**
  * Remove an item from the selected items list
  */
  removeItem(index) {
    // clear the selected items if just one item is selected
    if (!Array.isArray(this.selectedItems)) {
      this.selectedItems = [];
    } else {
      this.selectedItems.splice(index, 1)[0];
      this.selectedItems = this.selectedItems.slice();
    }
  }

  /**
  * Check if key exists in object
  */
  isKeyValueInObjectArray(objectArray, value) {
    if (Array.isArray(objectArray)) {
      for (var i = 0; i < objectArray.length; i++) {
        if (objectArray[i].Email === value) {
          return true;
        }
      }
    }
    return false;
  };

  /**
  * Close the popup
  */
  dismiss() {
    if (!Array.isArray(this.selectedItems)) {
      this.selectedItems = [];
    }
    this.viewCtrl.dismiss(this.selectedItems);
  }

}
