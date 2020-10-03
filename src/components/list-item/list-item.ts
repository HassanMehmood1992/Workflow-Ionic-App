import { Subscription } from 'rxjs/Subscription';
import { Component, Input } from '@angular/core';
import * as moment from 'moment'; 
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
import { ProcessDataProvider } from '../../providers/process-data/process-data';
/**
 * Generated class for the ListItemComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */

export interface ListItem {
  index?: number;
  name?: string;
  gender?: string;
  age?: number;
  email?: string;
  phone?: string;
  address?: string;
}


@Component({
  selector: 'list-item',
  templateUrl: 'list-item.html'
})


export class ListItemComponent {
  @Input() item: any;
  @Input() columnOptions: any;
  @Input() column: any;
  @Input() cols: any;

  errorShown:boolean; // to check for error in rendering lookup data

  toggleSectionUpdate: Subscription;

  constructor(private errorReportingProvider: ErrorReportingProvider,
    public globalservice: ProcessDataProvider) {
    this.errorShown = false;
  }

  toggleGroup(group) {
    if (this.isGroupShownmethod(group)) {
      this.globalservice.shownGroup = null;
    } else {
      this.globalservice.shownGroup = group;
    }
  };
  isGroupShownmethod(group) {
    return this.globalservice.shownGroup === group;
  };
  

  getLookupColumnValue(item,coloption,colshortname)
  {
    try{
      if(coloption[colshortname] != undefined)
      {
        if(coloption[colshortname].toLowerCase() == 'text')
        {
          return item[colshortname];
        }
        else if(coloption[colshortname].toLowerCase() == 'number')
        {
          return item[colshortname];
        }
        else if(coloption[colshortname].toLowerCase() == 'date')
        {
          return moment(item[colshortname]).format('DD-MMM-YYYY').toUpperCase();;
        }
        else if(coloption[colshortname].toLowerCase() == 'datetime')
        {
          return moment(item[colshortname]).format('DD-MMM-YYYY hh:mm A').toUpperCase();
        }
        else if(coloption[colshortname].toLowerCase() == 'time')
        {
          return moment(item[colshortname]).format('hh:mm A').toUpperCase();
        }
        else if(coloption[colshortname].toLowerCase() == 'peoplepicker')
        {
          return item[colshortname][0].DisplayName;
        }
        else if(coloption[colshortname].toLowerCase() == 'url')
        {
          return item[colshortname][0].title;
        }
        else
        {
          return item[colshortname];
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
