import { SocketProvider } from './../../providers/socket/socket';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-addon
Description: Renders addon html and addon logic.
Location: ./pages/page-addon
Author: Hassan
Version: 1.0.0
Modification history: 
15-Nov-2017   Hassan    Updating to angular new version
20-Feb-2018   Hassan    Implemented enhancemenet related to availability of addons
*/



/**
 * Importing neccassary liberaries and modules for this class 
 */
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { StorageServiceProvider } from './../../providers/storage-service/storage-service';
import { LoadingProvider } from './../../providers/loading/loading';
import { ClientDbProcessObjectsProvider } from './../../providers/client-db-process-objects/client-db-process-objects';
import { Component, OnInit, ViewChild, ViewContainerRef, NgModule, Compiler } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Content } from 'ionic-angular';
import { FormsModule } from '@angular/forms';
import * as ts from "typescript";
import { AppModule } from '../../app/app.module';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';



/**
 * Generated class for the AddonPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

/**
 * 
 * AddonPage to display HTML and Javascript within container
 * @export
 * @class AddonPage
 * @implements {OnInit}
 */
@IonicPage()
@Component({
  selector: 'page-addon',
  templateUrl: 'addon.html',
})
export class AddonPage implements OnInit {
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  @ViewChild(Content) content: Content;

  processId: any  //Process ID to used for fetching addon information
  custompageid: any  //Custom page id
  title: any  // Title of the addon page
  CustomPage: any;  //VAriable to save HTML of the page that is being rendered in Addon
  dataFilter: Boolean = true;  //To store datafilter flag to control  datafilter icon visibility on the top bar

  /**
 * Creates an instance of AddonPage.
 * @param {NavController} navCtrl 
 * @param {NavParams} navParams 
 * @param {AlertController} alertCtrl 
 * @param {ClientDbProcessObjectsProvider} clientDbProcessObjectsProvider 
 * @param {LoadingProvider} loading 
 * @param {Compiler} compiler 
 * @param {StorageServiceProvider} storageServiceProvider 
 * @param {ErrorReportingProvider} errorReportingProvider 
 * @param {ProcessDataProvider} globalservice 
 * @memberof AddonPage
 */
constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private clientDbProcessObjectsProvider: ClientDbProcessObjectsProvider,
    private loading: LoadingProvider,
    private compiler: Compiler,
    private storageServiceProvider: StorageServiceProvider,
    private errorReportingProvider: ErrorReportingProvider,
    private globalservice: ProcessDataProvider) {
    this.processId = navParams.get('processId');
    this.custompageid = navParams.get('custompageid');
    this.title = navParams.get('title');
  }
/**
 * 
 * Initalizing the addOnPage
 * @memberof AddonPage
 */
ngOnInit() {
    this.loading.presentLoading("Retrieving addon definition...", 30000);
    this.clientDbProcessObjectsProvider.getSingleProcessObject(this.processId, 'ProcessAddOn', this.custompageid).then((response: any) => {
      this.loading.hideLoading();

      try {
        let addOnObjectJSON = response;
        let template = decodeURIComponent(addOnObjectJSON[0].AddonDetails.AddonTemplate);
        let component = decodeURIComponent(addOnObjectJSON[0].AddonDetails.AddonComponent);
  
  
        this.addComponent(template, component, this.storageServiceProvider, this.loading);
      }
      catch (error) {
        this.errorReportingProvider.logErrorOnAppServer('Addon Error',
          'Error in rendering addon',
          this.globalservice.user.AuthenticationToken.toString(),
          this.processId,
          'AddonPage',
          error.message ? error.message : '',
          error.stack ? error.stack : '',
          new Date().toTimeString(),
          'open',
          'Platform',
          '');
      }
    }).catch((error) => {
      this.loading.hideLoading();
      this.errorReportingProvider.logErrorOnAppServer('Addon Error',
        'Error in fetching pivot data',
        this.globalservice.user.AuthenticationToken.toString(),
        this.processId,
        'AddonPage(socket.ProcessAddOn)',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
    });


  }
/**
 * 
 * Default function of Ionic on view load
 * @memberof AddonPage
 */
ionViewDidLoad() {
    }

  goBack() {
    this.navCtrl.pop();
  }

  showDataFilterMessage() {
    this.alertCtrl.create({
      title: 'Data Filter in Effect',
      subTitle: 'Displayed data is security trimmed as per your authorizations.',
      buttons: [
        {
          text: 'Close',
          role: 'Close',
          handler: () => {

          }
        }
      ]
    }).present();
  }


/**
 * 
 * Add Addon component to load HTML and script to render page
 * @private
 * @param {string} templateCurrent 
 * @param {string} component1 
 * @param {StorageServiceProvider} storageServiceProvider 
 * @param {LoadingProvider} loading 
 * @memberof AddonPage
 */
private addComponent(templateCurrent: string,
    component1: string,
    storageServiceProvider: StorageServiceProvider,
    loading: LoadingProvider) {


    @Component({
      template: templateCurrent
    })

    class TemplateComponent {

      currentUser: Object;

      constructor(private socket: SocketProvider) {

      }

      ngOnInit() {

      }

      ngAfterViewInit() {
        storageServiceProvider.getUser().then((user) => {
          this.currentUser = user;
          //this.socket.start();
          this.performAddOnLoadOperations(user.AuthenticationToken);
        });
      }

      showLoading(message: String, timeout: Number) {
        loading.presentLoading(message, timeout);
      }

      hideLoading() {
        loading.hideLoading();
      }

      performAddOnLoadOperations(userToken) {

      }

    }

/**
 * 
 * Take component and render it in the given container
 * @class TemplateModule
 */
@NgModule({ declarations: [TemplateComponent], imports: [AppModule, FormsModule] })
    class TemplateModule { }

    const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
    const factory = mod.componentFactories.find((comp) =>
      comp.componentType === TemplateComponent
    );
    let comp = '';
    let result = ts.transpile(component1);
    eval(result)
    const component = this.container.createComponent(factory);
    Object.assign(component.instance, comp);
    this.content.resize();
  }


}
