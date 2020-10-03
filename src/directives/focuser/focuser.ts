/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import {Directive, Renderer, ElementRef} from '@angular/core';
/*
ModuleID: focuser
Description: Controls the html behavior of input fields to allow keyboard to show up whenever input is focus through logic
Location: ./directives/focuser
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Directive({
    selector: '[focuser]' // Attribute selector
})
export class Focuser {
    private count = 0;//focuser count
    constructor(private renderer:Renderer, private elementRef:ElementRef) {
        
    }
    /**
   * Directive lifecycle hook after any change detected in view 
   */
    ngDoCheck()
    {
      const element = this.elementRef.nativeElement.querySelector('.searchbar-input');//search input element
      
      if(this.count == 0)
      {
        //focus and update count if change in view detected
        element.focus();
        this.count++;
      }
    }
    /**
   * Directive lifecycle hook after view initialization of view
   */
    ngAfterViewInit() {
        const element = this.elementRef.nativeElement.querySelector('.searchbar-input');
       
        setTimeout(() => {
            //invoke rendering of element
            this.renderer.invokeElementMethod(element, 'focus', []);
            
        }, 0);
    }
}