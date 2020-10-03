/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


//requried imports
import { Directive, Output, EventEmitter } from '@angular/core';
import { ENV } from './../../config/environment.prod';
/*
ModuleID: show-hide-sort-search
Description: Toggle search and sort controls based on orientation
Location: ./directives/show-hide-sort-search
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Directive({
  selector: '[show-hide-sort-search]' // Attribute selector
})
export class ShowHideSortSearchDirective {
  showHideSearchSort;//flag for showing hiding serach and sort 
  count = 0;//count for view updates
  @Output() showchange = new EventEmitter()//event emitter to emit orientation change
  constructor() {
    
  
    window.addEventListener('orientationchange', () =>
    {
    
      switch(window.orientation)
      {
        case 90: // landscape view
        case -90:
          {
            if(parseInt(ENV.MINIMUM_SUPPORTED_DEVICE_LONGEDGE_REPORTS_IOS) > screen.height)//parse environment varaible to see in min supported size greater than screen height
            {
              this.showHideSearchSort = true;//show if greater
            }
            else
            {
              this.showHideSearchSort = false;//hide if smaller
            }
          }
        break;

        case 0: // portrait view
        case 180:
        {
          if(parseInt(ENV.MINIMUM_SUPPORTED_DEVICE_LONGEDGE_REPORTS_IOS) > screen.width)//parse environment varaible to see in min supported size greater than screen width
          {
            this.showHideSearchSort = true;//show if greater
          }
          else
          {
            this.showHideSearchSort = false;//hide if smaller
          }
        }
        break;
      }
      
      this.showchange.emit(this.showHideSearchSort);//emit orientation change event
    });
    
  }

   /**
   * Directive lifecycle hook after any change detected in view 
   */
  ngDoCheck(){
    if(this.count == 0)
    {
      switch(window.orientation)
          {
            case 90: // landscape view 
            case -90:
              {
                if(parseInt(ENV.MINIMUM_SUPPORTED_DEVICE_LONGEDGE_REPORTS_IOS) > screen.height)//parse environment varaible to see in min supported size greater than screen height
                {
                  this.showHideSearchSort = true;//show if greater
                }
                else
                {
                  this.showHideSearchSort = false;//hide if smaller
                }
              }
            break;

            case 0: // portrait view
            case 180:
            {
              if(parseInt(ENV.MINIMUM_SUPPORTED_DEVICE_LONGEDGE_REPORTS_IOS) > screen.width)//parse environment varaible to see in min supported size greater than screen width
              {
                this.showHideSearchSort = true;//show if greater
              }
              else
              {
                this.showHideSearchSort = false;//hide if smaller
              }
            }
            break;
          }
          this.showchange.emit(this.showHideSearchSort);//emit orientation change event
      }
  }

}
