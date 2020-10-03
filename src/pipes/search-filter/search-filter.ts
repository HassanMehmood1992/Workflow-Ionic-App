/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


//required imports
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment'; 
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import { ProcessDataProvider } from '../../providers/process-data/process-data';

/*
ModuleID: searchFilter
Description: returns array filtered with query parameter string.
Location: ./pipes/searchFilter
Author: Hassan
Version: 1.0.0
Modification history: none
*/


@Pipe({
  name: 'searchFilter',//pipe name
})
export class SearchFilterPipe implements PipeTransform {
  /**
   * Returns filtered array based on passed query parameter
   */
  transform(items: any, term: any): any {
    if (term === undefined) return items;
    if(term=== '') return items;
    if(items === undefined) return [];

    //filter array based on entered query string
    return items.filter(function(item) {
      try
      {
        for(let property in item)
        {
          if (item[property] === null){
            continue;
          }
          if(item[property])
          {
            let value = item[property];
            if (typeof value == 'object'){
              value = JSON.stringify(value);
            }
            if(value.toString().toLowerCase().includes(term.toLowerCase())){
              return true;
            }
          }
        }
        return false;
      }
      catch (e)
      {
        
      }
    });
  }
}


@Pipe({
  name: 'sortFilter',//pipe name
})
export class SortFilterPipe implements PipeTransform {
  /**
   * Returns sorted array based on sort type
   * 
   */
  transform(array: Array<string>, args?: any): Array<string> {
    if(array){
      return array.sort(function(a, b){
        try{
          let a1 = parseInt(a[args.property])
          let b1 = parseInt(b[args.property])

          if(isNaN(a1) && isNaN(b1)){
            if(a[args.property] < b[args.property]){
              return -1 * args.order;
            }
            else if( a[args.property] > b[args.property]){
                return 1 * args.order;
            }
            else{
                return 0;
            }
          }
          else{
            if(a1 < b1){
              return -1 * args.order;
            }
            else if( a1 > b1){
                return 1 * args.order;
            }
            else{
                return 0;
            }
          }

        }
        catch(error){
          if(a[args.property] < b[args.property]){
              return -1 * args.order;
          }
          else if( a[args.property] > b[args.property]){
              return 1 * args.order;
          }
          else{
              return 0;
          }
        }
      });
    }
  }
}


@Pipe({
  name: 'sortFilterDate',//pipe name
})
export class SortFilterDatePipe implements PipeTransform {
  /**
   * Returns sorted array based on sort type
   * 
   */
  transform(array: Array<string>, args?: any): Array<string> {
    if(array){
      return array.sort(function(a, b){
        // if(new Date(a[args.property]) < new Date(b[args.property])){
        //     return -1 * args.order;
        // }
        // else if(new Date(a[args.property]) > new Date(b[args.property])){
        //     return 1 * args.order;
        // }
        // else{
        //     return 0;
        // }
        if(moment.utc(a[args.property]) < moment.utc(b[args.property])){
          return -1 * args.order;
        }
        else if(moment.utc(a[args.property]) > moment.utc(b[args.property])){
            return 1 * args.order;
        }
        else{
            return 0;
        }
      });
    }
  }
}

@Pipe({
  name: 'lookupsortFilter',//pipe name
})
export class LookupSortFilterPipe implements PipeTransform {
  /**
   * Returns custom sorted array based on sort type
   * 
   */
  transform(array: Array<string>, args?: any): Array<string> {
    if(array){
      if(args.type)
      {
        //for people picker 
        if(args.type.toLowerCase() == 'peoplepicker')
        {
          return array.sort(function(a, b){
            //filter based on display name
          if(a[args.property][0]["DisplayName"] < b[args.property][0]["DisplayName"]){
              return -1 * args.order;
            }
            else if( a[args.property][0]["DisplayName"] > b[args.property][0]["DisplayName"]){
                return 1 * args.order;
            }
            else{
                return 0;
            }
          });
        }
        else
        {
          //sort based on type if not people picker
          return array.sort(function(a, b){
          if(a[args.property] < b[args.property]){
              return -1 * args.order;
          }
          else if( a[args.property] > b[args.property]){
              return 1 * args.order;
          }
          else{
              return 0;
          }
        });
        }
      }
      else
      {
        //sort based on type
        return array.sort(function(a, b){
          if(a[args.property] < b[args.property]){
              return -1 * args.order;
          }
          else if( a[args.property] > b[args.property]){
              return 1 * args.order;
          }
          else{
              return 0;
          }
        });
      }
    }
  }
}



@Pipe({
  name: 'lookupValueFormatter',//pipe name
})
export class LookupValueFormatter implements PipeTransform {
  errorShown:boolean; // to check for error in rendering lookup data

  constructor(private errorReportingProvider: ErrorReportingProvider,
              public globalservice: ProcessDataProvider) {
    this.errorShown = false;
  }

  /**
   * Takes a value and makes it lowercase.
   */
  transform(item: any, args?: any) {
    try{
      if(args.columnOptions[args.column] != undefined)
      {
        if(args.columnOptions[args.column].toLowerCase() == 'text')
        {
          return item[args.column];
        }
        else if(args.columnOptions[args.column].toLowerCase() == 'number')
        {
          return item[args.column];
        }
        else if(args.columnOptions[args.column].toLowerCase() == 'date')
        {
          return moment(item[args.column]).format('DD-MMM-YYYY').toUpperCase();;
        }
        else if(args.columnOptions[args.column].toLowerCase() == 'datetime')
        {
          return moment(item[args.column]).format('DD-MMM-YYYY hh:mm A').toUpperCase();
        }
        else if(args.columnOptions[args.column].toLowerCase() == 'time')
        {
          return moment(item[args.column]).format('hh:mm A').toUpperCase();
        }
        else if(args.columnOptions[args.column].toLowerCase() == 'peoplepicker')
        {
          return item[args.column][0].DisplayName;
        }
        else if(args.columnOptions[args.column].toLowerCase() == 'url')
        {
          return item[args.column][0].title;
        }
        else
        {
          return item[args.column];
        }

      }
    }
    catch(e)
    {
        if(!this.errorShown)
        {
          this.errorReportingProvider.logErrorOnAppServer('Error in getLookupColumnValue tasks',
          'Error while rendering lookupdata in getLookupColumnValue',
          this.globalservice.user.AuthenticationToken.toString(),
          this.globalservice.processId,
          'getLookupColumnValue',
          e.message ? e.message : '',
          e.stack ? e.stack : '',
          new Date().toTimeString(),
          'Open',
          'Platform',
          '');
        }
        this.errorShown = true;
    }
  }
}
