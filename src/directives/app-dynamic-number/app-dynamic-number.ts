/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { Directive, Input, ElementRef, HostListener } from '@angular/core';

/*
ModuleID: app-dynamic-number
Description: Controls the html behavior of number fields rendering as string with different configurations
Location: ./directives/app-dynamic-number
Author: Hassan
Version: 1.0.0
Modification history: none
*/

@Directive({
  selector: '[appDynamicNumber]' // Attribute selector
})
export class AppDynamicNumberDirective {

  private el: any; //input element
  private PADDING = "000000"; //padding string

  @Input('numInt') numInt;//integer input number
  @Input('numFract') numFract;//fraction input number
  @Input('numSep') numSep;//input number with seperator
  @Input('numPos') numPos;//positive input number
  @Input('numNeg') numNeg;//negative input number
  @Input('numRound') numRound;//roundoff input number
  @Input('numThousand') numThousand;//thousands input number
  @Input('numThousandSep') numThousandSep;//thousands seperated input number
  @Input('numPrefix') numPrefix;//input number prefix 
  @Input('numSuffix') numSuffix;//input number suffix
  @Input('numPatternFlag') numPatternFlag;//flag for checking input pattern
  @Input('numPattern') numPattern;//number pattern regex

   /**
   * Constructor which initiliazes client width
   */
  constructor(
    private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
    this.initializeValues();
  }

  /**
   * Directive lifecycle hook after view initialization directive
   */
  ngOnInit() {
    this.el.value = this.transform(this.el.value);
  }

  @HostListener("focus", ["$event.target.value"])
  onFocus(value) {
   


  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
    this.el.value = this.transform(value);
    if(this.el.value != "0.00"){
      this.el.value = this.el.value.replace(/^[0|\D]*/,'');
    }
  }

  /**
   * Transforms input on keyup
   */
  @HostListener("keyup", ["$event.target.value"])
  onkeyup(value) {
    //create regular expression object
    let regexp1 = new RegExp(/^[0-9]+\.?[0-9]*$/);
    //test current val for validation
    if(!regexp1.test(value))
    {
      this.el.value = value.substr(0,value.length-1);
    }
    //process input
    let temp = this.el.value.split(this.numSep);
    if(temp.length > 1){
      if(temp[0].length > this.numInt){
        temp[0] = temp[0].substr(0,this.numInt);
      }
      if(temp[1].length > this.numFract){
        temp[1] = temp[1].substr(0,this.numFract);
      }
      this.el.value = temp[0] + this.numSep + temp[1];
    }
    else{
      if(temp[0].length > this.numInt){
        temp[0] = temp[0].substr(0,this.numInt);
      }
      this.el.value = temp[0];
    }
    //set result to 0 in blank
    if(this.el.value == ""){
      this.el.value = 0;
    }
  }
  
  /**
   * Initialize default values for all number types if undefined. 
   */
  initializeValues() {
    if (this.numInt == "" || this.numInt == undefined) {
      this.numInt = 10;
    }
    if (this.numFract == "" || this.numFract == undefined) {
      this.numFract = 2;
    }
    if (this.numSep == "" || this.numSep == undefined) {
      this.numSep = ".";
    }
    if (this.numPos == "" || this.numPos == undefined) {
      this.numPos = true;
    }
    if (this.numNeg == "" || this.numNeg == undefined) {
      this.numNeg = false;
    }
    if (this.numRound == "" || this.numRound == undefined) {
      this.numRound = "floor";
    }
    if (this.numThousand == "" || this.numThousand == undefined) {
      this.numThousand = true;
    }
  
    if (this.numThousandSep == "" || this.numThousandSep == undefined) {
      if (this.numThousand) {//check if thousand number before applying seperator
        this.numThousandSep = ",";
      }
      else {
        this.numThousandSep = "";
      }
    }
    if (this.numPrefix == "" || this.numPrefix == undefined) {
      this.numPrefix = "";
    }
    if (this.numSuffix == "" || this.numSuffix == undefined) {
      this.numSuffix = "";
    }
    if (this.numPatternFlag == "" || this.numPatternFlag == undefined) {
      this.numPatternFlag = false;
    }
    if (this.numPattern == "" || this.numPattern == undefined) {
      if (!this.numPatternFlag) {
        this.numPattern = "";
      }
      else {
        this.numPattern = "";
      }
    }
  }

   /**
   * Transform number based of required regex.
   */
  transform(value: string): string {
    if (this.numPatternFlag) {
      //split based on integer or fraction from string
      let [integer, fraction = ""] = (value || "").toString()
        .split(this.numSep);
        var s = ''+integer, r = '';
        for (var im=0, is = 0; im<this.numPattern.length && is<s.length; im++) {
          r += this.numPattern[im]=='X' ? s.charAt(is++) : this.numPattern.charAt(im);
        }
      return this.numPrefix + r + this.numSuffix;
    }
    else {
      let [integer, fraction = ""] = (value || "").toString()
        .split(this.numSep);
      fraction = this.numFract > 0
        ? this.numSep + (fraction + this.PADDING).substring(0, this.numFract)
        : "";
        //add thousand seperator in int if number in thousands
        integer = integer.substr(0,this.numInt);
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.numThousandSep);
      
      if(integer == ""){
        integer = "0";
      }
      return this.numPrefix + integer + fraction + this.numSuffix;
    }
  }
}
