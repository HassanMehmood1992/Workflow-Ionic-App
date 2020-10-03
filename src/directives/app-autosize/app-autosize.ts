/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


//importing required libraries
import { Directive, Input, ElementRef } from '@angular/core';

/*
ModuleID: app-autosize
Description: Controls html behavior regarding form fields height
Location: ./directives/app-autosize
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@Directive({
  selector: '[appAutosize]' // Attribute selector
})
export class AppAutosizeDirective {

   /**
   * Constructor which initiliazes client width
   */
  constructor(public element: ElementRef) {
    this.el = element.nativeElement;
    this._clientWidth = this.el.clientWidth;
  }
  private el: HTMLElement;//body element 
  private _minHeight: string;//minimum height of screes
  private _maxHeight: string;//maximum height of screen
  private _clientWidth: number;//client screen width

  @Input('minHeight')

  /**
   * Getter function for minimum screen size supported
   */
  get minHeight(): string {
    return this._minHeight;
  }

   /**
   * Setter function for minimum screen size supported
   */
  set minHeight(val: string) {
    this._minHeight = val;
    this.updateMinHeight();
  }

  @Input('maxHeight')

  /**
   * Getter function for maximum screen size supported
   */
  get maxHeight(): string {
    return this._maxHeight;
  }

     /**
   * Setter function for setting maximum screen size supported
   */
  set maxHeight(val: string) {
    this._maxHeight = val;
    this.updateMaxHeight();
  }


  /**
   * Directive lifecycle hook after view initialization
   */
  ngAfterViewInit(): void {
    // set element resize allowed manually by user
    const style = window.getComputedStyle(this.el, null);
    if (style.resize === 'both') {
      this.el.style.resize = 'horizontal';
    } else if (style.resize === 'vertical') {
      this.el.style.resize = 'none';
    }
    // run first adjust
    this.adjust();
  }
  
  /**
   * Directive lifecycle hook after any change detected in view 
   */
  ngDoCheck() {
    this.adjust();
  }


  /**
   * Performs height adjustments after input changes, if height is different
   */
  adjust(): void {
  
    if (this.el.style.height == this.element.nativeElement.scrollHeight + 'px') {
      return;
    }
    this.el.style.overflow = 'hidden';
    this.el.style.height = 'auto';
    if (this.element.nativeElement.value == undefined || this.element.nativeElement.value == "") {//set default in undefined
      this.el.style.height = '34px';
    }
    else if (this.element.nativeElement.value != "") {//adjust height based on screen size logic
      let minHeight = 0;
      if (this.el.style.minHeight == '34px') {
        minHeight = 34;
      }
      if (minHeight + 18 >= this.el.scrollHeight) {//adjust height if min heignt more than scroll height
        if (this.element.nativeElement.parentNode.localName == "span" || this.element.nativeElement.parentNode.parentNode.localName == "app-number-field") {
          if (this.el["textLength"] * 2.5 < Math.ceil(this.el.scrollWidth / 3) && this.el.clientHeight <= this.el.scrollHeight) {//Compute height
            this.el.style.height = '34px';//set new size based on calculation
          }
          else {
            this.el.style.height = this.el.scrollHeight + 'px';
          }
        }
        else {
          this.el.style.height = '34px';
        }
      }
      else {
        this.el.style.height = this.el.scrollHeight + 'px';
      }
    }
    else {
      this.el.style.height = this.el.scrollHeight + 'px';
    }
    this.el.style.resize = 'none';
  }

    /**
   * Set textarea min height if input defined
   */
  updateMinHeight(): void {
     
    this.el.style.minHeight = this._minHeight + 'px';
  }

    /**
   * Set textarea max height if input defined
   */
  updateMaxHeight(): void {
     
    this.el.style.maxHeight = this._maxHeight + 'px';
  }

}
