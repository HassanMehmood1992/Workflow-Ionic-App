/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-lookup-details-modal
Description: Contains data table for lookup details or reports.
Location: ./pages/page-lookup-details-modal
Author: Hassan
Version: 1.0.0
Modification history: none
*/


/**
* Importing neccassary libraries and modules for this class 
*/
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular/navigation/view-controller';

declare var $;
import 'datatables.net/js/jquery.dataTables.js';

/**
 * Generated class for the LookupDetailsModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-lookup-details-modal',
  templateUrl: 'lookup-details-modal.html',
})
export class LookupDetailsModalPage {

  tableData: any[];//table data
  tableName: String;//table name to show as headng
  tableStyle: String;//style of the table

  /**
  * Class constructor
  */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController) {

    this.tableData = navParams.get("tableData");
    this.tableName = navParams.get("tableName");
    this.tableStyle = navParams.get("tableStyle");
  };

  /**
  * Run on view initialization
  */
  ngOnInit() {
    let colsDetailsTable = [];
    let index = 0;
    for (let key in this.tableData[0]) {
      colsDetailsTable[index] = {};
      colsDetailsTable[index].data = key;
      colsDetailsTable[index].title = key;
      colsDetailsTable[index].defaultContent = "";
      index++;
    }
    $('#detailsTable').DataTable({
      responsive: true,
      data: this.tableData,
      columns: colsDetailsTable
    });
    this.setDetailsTableDefaultStyles();
  }

  /**
  * Setter for the details table style
  */
  setDetailsTableDefaultStyles() {
    $("#detailsTable").attr("style", this.tableStyle);
  }

  /**
  * Dismiss and close the popup
  */
  dismiss() {
    this.viewCtrl.dismiss();
  }

}
