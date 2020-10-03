/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { Pipe, PipeTransform } from '@angular/core';
/*
ModuleID: filterbystatus
Description: returns a filtered array based on the status being provided
Location: ./pipes/filterbystatus
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@Pipe({
  name: 'filterbystatus',//pipe name
  pure:false
})
export class FilterbystatusPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(items,filter) {
    if (typeof filter === 'undefined' || filter.name === 'All')
    {
      return items;
    }
    if (filter.name && items)
    {
      //initiating status filter
      if (filter.name.toLowerCase() === 'initiating')
      {
        return items.filter( (item) => {
          if (item.Status)
          {
            return (item.Status.toLowerCase()  === 'initiating');
          }
          else
          {
            return false;
          }
        });
      }
      //saved status filter
      if (filter.name.toLowerCase() === 'saved')
      {
        return items.filter( (item) =>{
          if (item.Status)
          {
            return (item.Status.toLowerCase()  === 'saved');
          }
          else
          {
            return false;
          }
        });
      }
      //pending status filter
      if (filter.name.toLowerCase() === 'pending')
      {
        return items.filter( (item) =>{
          if (item.Status)
          {
            return (item.Status.toLowerCase()  === 'pending');
          }
          else
          {
            return false;
          }
        });
      }
      //completed status filter
      if (filter.name.toLowerCase() === 'completed')
      {
        return items.filter( (item) => {
          if (item.Status)
          {
            return (item.Status.toLowerCase()  === 'completed');
          }
          else
          {
            return false;
          }
        });
      }
      //rejected status filter
      if (filter.name.toLowerCase() === 'rejected')
      {
        return items.filter( (item) => {
          if (item.Status)
          {
            return (item.Status.toLowerCase()  === 'rejected');
          }
          else
          {
            return false;
          }
        });
      }
      //terminated status filter
      if (filter.name.toLowerCase() === 'terminated')
      {
        return items.filter( (item) => {
          if (item.Status)
          {
            return (item.Status.toLowerCase()  === 'terminated');
          }
          else
          {
            return false;
          }
        });
      }
    }
    else
    {
     
      return items;//return as it is if no filter
    }
  }
}
