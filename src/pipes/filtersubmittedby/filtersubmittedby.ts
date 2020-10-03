/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/




import { Pipe, PipeTransform } from '@angular/core';
/*
ModuleID: filtersubmittedby
Description: returns a filtered array based on the status being provided
Location: ./pipes/filtersubmittedby
Author: Hassan
Version: 1.0.0
Modification history: none
*/


@Pipe({
  name: 'filtersubmittedby',//pipe name
})
export class FiltersubmittedbyPipe implements PipeTransform {
  /**
   * Return filtered array based on initiated by filter
   */
  transform(items,filter) {
    //return all tasks if no filter
    if (typeof filter === 'undefined' || filter.value === 'all')
    {
      return items;
    }
    //filter tasks where i am manager
    if (filter.filterby === 'My Direct Reports')
    {
      if (items)
      {
        return items.filter( (item) => {
          return (item.ManagerEmail.toLowerCase()  === filter.value.toLowerCase());
        });
      }
    }
    //filter my tasks
    if (filter.filterby === 'Me')
    {
      if (items)
      {
        return items.filter((item) => {
          return (item.InitiatedByEmail === filter.value);
        });
      }
    }
    else
    {
      //return all items if not undefined
      if (items)
      {
        return items;
      }
    }
  }
}
