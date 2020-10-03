/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/



import { Directive, AfterViewInit, ElementRef, Renderer, Input } from '@angular/core';
import { Tabs, Tab } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation'
import { Platform } from 'ionic-angular';

@Directive({
  selector: '[scrollable-tabs]',
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
/*
ModuleID: scrollable-tabs
Description: A reuseable component for App allows to draw scrollable tabs
Location: ./components/scrollable-tabs
Author: Hassan
Version: 1.0.0
Modification history: none
*/
export class ScrollableTabs implements AfterViewInit {
  @Input('scrollable-tabs') ionTabs: Tabs;
  @Input('opts') opts: any = {};

  currentTabIndex: number;
  tabs: Tab[] = [];
  nativeTabbar: HTMLElement;

  constructor(public elemRef: ElementRef, public renderer: Renderer, private screenorientation: ScreenOrientation, public plt: Platform) {
    this.screenorientation.onChange().subscribe(
      () => {
        setTimeout(() => {
          this.setAnchorStyles();
          //this.scrollToselectedTab();
        }, 100);
      }
    );
  }

  /**
  * Checks for any html changes to the component
  */
  ngOnChanges(changes: any) {
    if (changes.hasOwnProperty('opts')) {
      if (changes['opts'].currentValue.refresh) {
        setTimeout(() => {
          this.setAnchorStyles();
          this.scrollToselectedTab();
        }, 100);
      }
    }
  }

  /**
  * set styles on the tabs when the user tap or swipe on it.
  */
  ngDoCheck() {
    this.setAnchorStyles();
  }


  /**
  * Called after the view has been initialized.
  */
  ngAfterViewInit() {
    this.nativeTabbar = this.ionTabs._tabbar.nativeElement;
    this.tabs = this.ionTabs._tabs;
    this.currentTabIndex = typeof (this.ionTabs.selectedIndex) == "undefined" ? 0 : this.ionTabs.selectedIndex;

    this.ionTabs.ionChange.subscribe(() => {
      this.scrollToselectedTab();
    })

    for (let i = 0; i < this.tabs.length; i++) {
      this.tabs[i].ionSelect.subscribe(() => {
        this.currentTabIndex = i;
      });
    }

    // set tabbar overflow-x: scroll
    this.renderer.setElementStyle(this.nativeTabbar, "overflow-x", "scroll");

    // set tabbar overflow-y: hidden
    this.renderer.setElementStyle(this.nativeTabbar, "overflow-y", "hidden");

    if (this.plt.is('android')) {
      this.renderer.setElementStyle(this.nativeTabbar, 'white-space', 'nowrap');
      this.renderer.setElementStyle(this.nativeTabbar, 'width', '100%');
      this.renderer.setElementStyle(this.nativeTabbar, 'display', '-webkit-box');
    }

    this.setAnchorStyles();

    this.scrollToselectedTab();
  }

  /**
  * Called when the tab is resized through orientation change
  */
  onResize(event: Event) {
    this.setAnchorStyles();
    setTimeout(() => {
      this.scrollToselectedTab();
    }, 100);
  }


  /**
  * Sets the styles of the tabs.
  */
  setAnchorStyles() {
    if (typeof (this.nativeTabbar) != "undefined") {
      let tabBar_width = this.nativeTabbar.clientWidth;
      let numOfTabs = this.tabs.length;
      let numOfVisibleAnchors = 0;
      let sumOfVisibleAnchorWidth = 0;

      // loop through tab elements in tabs
      for (let i = 0; i < numOfTabs; i++) {
        let element = this.nativeTabbar.children[i];
        // when Tab visible (effecting show property)
        if (this.tabs[i]._isShown) {
          numOfVisibleAnchors++;
          // set <a> display: inline-table
          this.renderer.setElementStyle(element, 'display', 'inline-table');
          // set <a> width: 6rem
          if (this.plt.is('ios')) {
            this.renderer.setElementStyle(element, 'width', '18vw');
          }
          else if (this.plt.is('android')) {
            this.renderer.setElementStyle(element, 'width', '22vw');
          }
          //this.renderer.setElementStyle(element, 'padding-right', '25px');
          // extra padding for title-only tags only
          if (element.classList.contains("has-title-only")) {
            // set <a> padding-top: 1.5rem
            this.renderer.setElementStyle(element, 'padding-top', '1.5rem');
          }
          if (i === numOfTabs - 1) {
            this.renderer.setElementStyle(element, 'padding-right', '1.5rem');
          }
          sumOfVisibleAnchorWidth += element.clientWidth;
        }
        else {
          // set <a> display: none
          this.renderer.setElementStyle(element, 'display', 'none');
        }
      }

      // to prevent extra space at end
      if (sumOfVisibleAnchorWidth < tabBar_width) {
        let anchorWidth = tabBar_width / numOfVisibleAnchors;
        for (let i = 0; i < numOfTabs; i++) {
          let element = this.nativeTabbar.children[i];
          // when Tab not not visible effecting show property
          if (!element.classList.contains("tab-hidden")) {
            this.renderer.setElementStyle(element, 'width', anchorWidth + 'px');
          }
        }
      }
    }
  }


  /**
  * scroll to selected tab when user swipes or taps
  */
  scrollToselectedTab() {
    if (typeof this.nativeTabbar != 'undefined') {
      let tabBar_width = this.nativeTabbar.clientWidth;
      let selectedTab = this.nativeTabbar.children[this.currentTabIndex];
      let selectedTab_Width = selectedTab.clientWidth;
      let selectedTab_LeftOffset = document.getElementById(selectedTab.id).offsetLeft;
      let selectedTab_mid = selectedTab_LeftOffset + (selectedTab_Width / 2);
      let newScrollLeft = selectedTab_mid - (tabBar_width / 2);

      this.scrollXTo(newScrollLeft, 300).then(() => { });
    }
  }

  /**
  * Set x scroll after its styles has been updated.
  */
  scrollXTo(x: number, duration: number = 300): Promise<any> {
    // scroll animation loop w/ easing
    let tabbar = this.nativeTabbar;

    if (!tabbar) {
      // invalid element
      return Promise.resolve();
    }
    x = x || 0;

    let originalRaf = (window[window['Zone']['__symbol__']('requestAnimationFrame')] || window[window['Zone']['__symbol__']('webkitRequestAnimationFrame')]);
    let nativeRaf = originalRaf !== undefined ? originalRaf['bind'](window) : window.requestAnimationFrame.bind(window);
    let fromX = tabbar.scrollLeft;
    let maxAttempts = (duration / 16) + 100;

    return new Promise(resolve => {
      let startTime: number;
      let attempts = 0;
      let isPlaying: boolean;

      // scroll loop
      function step() {
        attempts++;

        if (!tabbar || !isPlaying || attempts > maxAttempts) {
          isPlaying = false;
          resolve();
          return;
        }

        let time = Math.min(1, ((Date.now() - startTime) / duration));

        // where .5 would be 50% of time on a linear scale easedT gives a
        // fraction based on the easing method
        let easedT = (--time) * time * time + 1;

        if (fromX !== x) {
          tabbar.scrollLeft = Math.floor((easedT * (x - fromX)) + fromX);
        }

        if (easedT < 1) {
          nativeRaf(step);
        } else {
          // done
          resolve();
        }
      }

      // start scroll loop
      isPlaying = true;

      // chill out for a frame first
      nativeRaf(() => {
        startTime = Date.now();
        nativeRaf(step);
      });

    });
  }


}