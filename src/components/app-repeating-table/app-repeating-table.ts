/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/




import { FormBuilder } from '@angular/forms';
import { Component, Input, HostListener, Output, EventEmitter, Inject } from '@angular/core';

/*
ModuleID: app-repeating-table
Description: A reuseable component on the form which allows users customize an html table using different components
Location: ./components/app-repeating-table
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Component({
  selector: 'app-repeating-table',
  templateUrl: 'app-repeating-table.html'
})
export class AppRepeatingTableComponent {

  @Input('tableJson') tableJson; // json value of the table provided as input
  @Input('ngModel') DataJson; // data value of the table 
  @Input('formDataJSON') formDataJSON; // form data json use to store form data
  @Input('controlOptions') controlOptions; // form fields controls

  @Output() ngModelChange = new EventEmitter(); // publishes value to the caller component

  @Output() repeatingTableEvent = new EventEmitter(); // publishes value to the caller component

  @Output() formDataJsonEvent = new EventEmitter(); // publishes value to the caller component

  @Output() updateTableValidation = new EventEmitter(); // publishes value to the caller component


  public temp: any;
  constructor( @Inject(FormBuilder) formBuilder: FormBuilder) {
    this.DataJson = [];
    this.tableJson = [];
  }

  /**
  * Host listener for the mouse event
  */

  @HostListener('click', ['$event'])
  onMouseEvent(event) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    if (typeof event.currentTarget.tagName != "undefined") {
      if (event.currentTarget.tagName.toLowerCase() == "app-repeating-table") {
        if (event.type == "click") {
          let match = event.target.id.match(/[a-z]+|\d+/ig);
          if (match) {
            rowIndex = match[0] - 1;
            row = this.temp[match[0] - 1];
            for (let key in row) {
              if (key.toLowerCase() == match[1].toLowerCase()) {
                column[key] = row[key];
              }
            }
          }
          this.DataJson = this.temp;
          let changedAttributes = {};
          changedAttributes["event"] = event.type;
          changedAttributes["rowIndex"] = rowIndex;
          changedAttributes["row"] = row;
          changedAttributes["column"] = column;
          changedAttributes["modelValue"] = this.DataJson;
          this.checkRepeatingTableValidStatus();
          this.repeatingTableEvent.emit(changedAttributes);
        }
      }
    }
  }

  /**
  * Host listener for the change event
  */
  @HostListener('change', ['$event'])
  onchange(event) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    let columnName: string;
    if (event.type == "change" && event.event == undefined) {
      let match = event.target.id.match(/[a-z]+|\d+/ig);
      if (match) {
        rowIndex = match[0] - 1;
        row = this.temp[match[0] - 1];
        columnName = match[1];
        for (let key in row) {
          if (key.toLowerCase() == match[1].toLowerCase()) {
            column[key] = row[key];
          }
        }
      }
      this.DataJson = this.temp;
      this.checkFooterColumn("");
      let changedAttributes = {};
      changedAttributes["event"] = event.type;
      changedAttributes["rowIndex"] = rowIndex;
      changedAttributes["row"] = row;
      changedAttributes["column"] = column;
      changedAttributes["modelValue"] = this.DataJson;
      this.checkRepeatingTableValidStatus();
      this.repeatingTableEvent.emit(changedAttributes);
    }
    else if (event.event == "lookup") {
      this.DataJson = this.temp;
      let changedAttributes = {};
      let columnObj = {};
      columnObj[event.currentColumn] = event.value;
      changedAttributes["event"] = event.type;
      changedAttributes["rowIndex"] = event.rowIndex;
      changedAttributes["row"] = event.currentRow;
      changedAttributes["column"] = columnObj;
      changedAttributes["modelValue"] = this.DataJson;
      this.checkRepeatingTableValidStatus();
      this.repeatingTableEvent.emit(changedAttributes);
    }
    else if (event.event == "datetimepicker") {
      this.DataJson = this.temp;
      let changedAttributes = {};
      let columnObj = {};
      columnObj[event.currentColumn] = event.value;
      changedAttributes["event"] = event.type;
      changedAttributes["rowIndex"] = event.rowIndex;
      changedAttributes["row"] = event.currentRow;
      changedAttributes["column"] = columnObj;
      changedAttributes["modelValue"] = this.DataJson;
      this.checkRepeatingTableValidStatus();
      this.repeatingTableEvent.emit(changedAttributes);
    }
  }


  /**
  * Host listener for the keyup event
  */
  @HostListener('keyup', ['$event'])
  onkeyup(event) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    let columnName: string;
    if (event.type == "keyup" && event.event == undefined) {
      let match = event.target.id.match(/[a-z]+|\d+/ig);
      if (match) {
        rowIndex = match[0] - 1;
        row = this.temp[match[0] - 1];
        columnName = match[1];
        for (let key in row) {
          if (key.toLowerCase() == match[1].toLowerCase()) {
            column[key] = row[key];
          }
        }
      }
      this.DataJson = this.temp;
      this.checkFooterColumn("");
      let changedAttributes = {};
      changedAttributes["event"] = event.type;
      changedAttributes["rowIndex"] = rowIndex;
      changedAttributes["row"] = row;
      changedAttributes["column"] = column;
      changedAttributes["modelValue"] = this.DataJson;
      this.checkRepeatingTableValidStatus();
      this.repeatingTableEvent.emit(changedAttributes);
    }
  }

  /**
  * Host listener for the focus out event
  */
  @HostListener('focusout', ['$event'])
  onFocusOut(event) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    let columnName: string;
    if (typeof event.currentTarget.tagName != "undefined") {
      if (event.currentTarget.tagName.toLowerCase() == "app-repeating-table") {
        if (event.type == "focusout") {
          let match = event.target.id.match(/[a-z]+|\d+/ig);
          if (match) {
            rowIndex = match[0] - 1;
            row = this.temp[match[0] - 1];
            columnName = match[1];
            for (let key in row) {
              if (key.toLowerCase() == match[1].toLowerCase()) {
                column[key] = row[key];
              }
            }
          }
          this.DataJson = this.temp;
          this.checkFooterColumn("");
          //this.checkFooterColumn(columnName);
          let changedAttributes = {};
          changedAttributes["event"] = event.type;
          changedAttributes["rowIndex"] = rowIndex;
          changedAttributes["row"] = row;
          changedAttributes["column"] = column;
          changedAttributes["modelValue"] = this.DataJson;
          this.checkRepeatingTableValidStatus();
          this.repeatingTableEvent.emit(changedAttributes);
        }
      }
    }
  }

  /**
  * Host listener for the focus in event
  */
  @HostListener('focusin', ['$event'])
  onFocusin(event) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    if (typeof event.currentTarget.tagName != "undefined") {
      if (event.currentTarget.tagName.toLowerCase() == "app-repeating-table") {
        if (event.type == "focusin") {
          let match = event.target.id.match(/[a-z]+|\d+/ig);
          if (match) {
            rowIndex = match[0] - 1;
            row = this.temp[match[0] - 1];
            for (let key in row) {
              if (key.toLowerCase() == match[1].toLowerCase()) {
                column[key] = row[key];
              }
            }
          }
          this.DataJson = this.temp;
          let changedAttributes = {};
          changedAttributes["event"] = event.type;
          changedAttributes["rowIndex"] = rowIndex;
          changedAttributes["row"] = row;
          changedAttributes["column"] = column;
          changedAttributes["modelValue"] = this.DataJson;
          this.checkRepeatingTableValidStatus();
          this.repeatingTableEvent.emit(changedAttributes);
        }
      }
    }
  }

  /**
  * called when any people picker field is changed in table
  */

  peoplePickerChange(event, columnName, index) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    rowIndex = index;
    row = this.temp[index];
    for (let key in row) {
      if (key.toLowerCase() == columnName.toLowerCase()) {
        column[key] = row[key];
      }
    }
    this.checkFooterColumn("");
    this.DataJson = this.temp;
    let changedAttributes = {};
    changedAttributes["event"] = "change";
    changedAttributes["rowIndex"] = rowIndex;
    changedAttributes["row"] = row;
    changedAttributes["column"] = column;
    changedAttributes["modelValue"] = this.DataJson;
    this.checkRepeatingTableValidStatus();
    this.repeatingTableEvent.emit(changedAttributes);
  }


  /**
  * called when number field is changed in table
  */
  numberFieldChange(event, columnName, index) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    this.temp[index][columnName] = event;
    rowIndex = index;
    row = this.temp[index];
    for (let key in row) {
      if (key.toLowerCase() == columnName.toLowerCase()) {
        column[key] = row[key];
      }
    }
    this.checkFooterColumn("");
    this.DataJson = this.temp;
    let changedAttributes = {};
    changedAttributes["event"] = "change";
    changedAttributes["rowIndex"] = rowIndex;
    changedAttributes["row"] = row;
    changedAttributes["column"] = column;
    changedAttributes["modelValue"] = this.DataJson;
    this.checkRepeatingTableValidStatus();
    this.repeatingTableEvent.emit(changedAttributes);
  }

  /**
  * called when datepicker field is changed in table
  */
  datePickerFunctions(event) {
    this.checkFooterColumn("");
    this.DataJson = this.temp;
    let changedAttributes = {};
    let columnObj = {};
    columnObj[event.currentColumn] = event.value;
    changedAttributes["event"] = event.type;
    changedAttributes["rowIndex"] = event.rowIndex;
    changedAttributes["row"] = event.currentRow;
    changedAttributes["column"] = columnObj;
    changedAttributes["modelValue"] = this.DataJson;
    this.checkRepeatingTableValidStatus();
    this.repeatingTableEvent.emit(changedAttributes);
  }


  /**
  * Initialize the table component
  */
  ngOnInit() {

    if (typeof this.DataJson == "undefined" || this.DataJson.length == 0 || typeof this.DataJson.length == "undefined") {
      this.temp = [];
      let inserted = '{';
      for (let i = 0; i < this.tableJson.Columns.length; i++) {
        let defaultValueFound = false;
        if (this.controlOptions != undefined) {
          if (this.controlOptions[this.tableJson.Columns[i].name].defaultValue != "") {
            defaultValueFound = true;
          }
        }
        if (defaultValueFound) {
          inserted += '"' + this.tableJson.Columns[i].name + '":"' + this.controlOptions[this.tableJson.Columns[i].name].defaultValue + '",';
        }
        else {
          inserted += '"' + this.tableJson.Columns[i].name + '":"",';
        }
      }
      inserted = inserted.substr(0, inserted.length - 1);
      inserted += '}';
      inserted = JSON.parse(inserted);

      this.temp.push(inserted);
    }
    else {
      this.temp = this.DataJson;
    }
  }


  /**
  * called when the row is being add
  */
  addNewRow() {
    //pre add row function
    this.DataJson = this.temp;
    let changedAttributes = {};
    changedAttributes["event"] = "preRowAdd";
    changedAttributes["rowIndex"] = this.temp.length - 1;
    changedAttributes["row"] = this.temp[this.temp.length - 1];
    changedAttributes["column"] = "";
    changedAttributes["modelValue"] = this.temp;


    this.repeatingTableEvent.emit(changedAttributes);

    //add new row
    let inserted = '{';
    for (let i = 0; i < this.tableJson.Columns.length; i++) {
      inserted += '"' + this.tableJson.Columns[i].name + '":"",';
    }
    inserted = inserted.substr(0, inserted.length - 1);
    inserted += '}';
    inserted = JSON.parse(inserted);

    this.temp.push(inserted);

    //post add row functions
    this.DataJson = this.temp;
    changedAttributes = {};
    changedAttributes["event"] = "postRowAdd";
    changedAttributes["rowIndex"] = this.temp.length - 1;
    changedAttributes["row"] = this.temp[this.temp.length - 1];
    changedAttributes["column"] = "";
    changedAttributes["modelValue"] = this.temp;

    this.DataJson = this.temp;
    this.checkFooterColumn("");
    this.checkRepeatingTableValidStatus();
    this.repeatingTableEvent.emit(changedAttributes);
  }


  /**
  * called when row is removed from the table
  */
  removeRow(index) {
    //pre row remove function
    let changedAttributes = {};
    changedAttributes["event"] = "preRowRemove";
    changedAttributes["rowIndex"] = index;
    changedAttributes["row"] = this.temp[index];
    changedAttributes["column"] = "";
    changedAttributes["modelValue"] = this.temp;

    this.DataJson = this.temp;
    this.repeatingTableEvent.emit(changedAttributes);


    //remove row
    var removedItem = this.temp.splice(index, 1);
    if (this.temp.length == 0) {
      this.addNewRow();
    }

    this.DataJson = this.temp;
    //post row remove function
    changedAttributes = {};
    changedAttributes["event"] = "postRowRemove";
    changedAttributes["rowIndex"] = index;
    changedAttributes["row"] = removedItem;
    changedAttributes["column"] = "";
    changedAttributes["modelValue"] = this.temp;


    this.DataJson = this.temp;
    this.checkFooterColumn("");
    this.checkRepeatingTableValidStatus();
    this.repeatingTableEvent.emit(changedAttributes);
  }

  /**
  * checks and recalculates the footer sums
  */
  checkFooterColumn(columnName) {
    let calculation = "";
    if (columnName != "") {
      for (let i = 0; i < this.tableJson.Columns.length; i++) {
        if (this.tableJson.Columns[i].name == columnName) {
          if (this.tableJson.Columns[i].footer != "" && this.tableJson.Columns[i].footer != undefined) {
            calculation = this.tableJson.Columns[i].footer;
            break;
          }
        }
      }
      switch (calculation) {
        case "sum":
          let footerSum = 0;
          for (let i = 0; i < this.temp.length; i++) {
            if (this.temp[i][columnName] != undefined) {
              if (this.temp[i][columnName] == "") {
                footerSum = footerSum + 0;
              } else {
                footerSum = footerSum + parseFloat(this.temp[i][columnName]);
              }
            }
          }
          if (this.controlOptions[columnName]["precision"] != undefined) {
            this.formDataJSON[this.tableJson.TableSettings.name + "Footer" + columnName] = parseFloat(footerSum.toFixed(this.controlOptions[columnName]["precision"]));
          }
          else {
            this.formDataJSON[this.tableJson.TableSettings.name + "Footer" + columnName] = parseFloat(footerSum.toFixed(2));
          }
          break;
      }
    }
    else {
      for (let i = 0; i < this.tableJson.Columns.length; i++) {
        if (this.tableJson.Columns[i].footer != "" && this.tableJson.Columns[i].footer != undefined) {
          calculation = this.tableJson.Columns[i].footer;
          columnName = this.tableJson.Columns[i].name;
          switch (calculation) {
            case "sum":
              let footerSum = 0;
              for (let i = 0; i < this.temp.length; i++) {
                if (this.temp[i][columnName] != undefined) {
                  if (this.temp[i][columnName] == "") {
                    footerSum = footerSum + 0;
                  }
                  else {
                    footerSum = footerSum + parseFloat(this.temp[i][columnName]);
                  }
                }
              }
              if (this.controlOptions[columnName]["precision"] != undefined) {
                this.formDataJSON[this.tableJson.TableSettings.name + "Footer" + columnName] = parseFloat(footerSum.toFixed(this.controlOptions[columnName]["precision"]));
              }
              else {
                this.formDataJSON[this.tableJson.TableSettings.name + "Footer" + columnName] = parseFloat(footerSum.toFixed(2));
              }
              break;
          }
        }
      }
    }
    this.formDataJsonEvent.emit(this.formDataJSON);
  }


  /**
  * validates the repeating table and checks the fields
  */
  checkRepeatingTableValidStatus() {
    let validFlag = true;
    for (let i = 0; i < this.temp.length; i++) {
      if (this.controlOptions != undefined) {
        for (let key in this.controlOptions) {
          let obj = this.controlOptions[key];
          if (obj.required) {
            if (this.temp[i][key] == "" || this.temp[i][key] == null) {
              validFlag = false;
              break;
            }
          }
        }
      }
    }

    let obj = {};
    obj["tableName"] = this.tableJson.TableSettings.name;
    obj["valid"] = validFlag;
    this.updateTableValidation.emit(obj);
    this.DataJson = this.temp;
    this.ngModelChange.emit(this.DataJson);
  }
}
