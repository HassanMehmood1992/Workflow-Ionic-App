import { ViewController } from 'ionic-angular/navigation/view-controller';
import { AppModule } from './../../app/app.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ModalController, NavParams } from 'ionic-angular';
import { ProcessFormProvider } from './../../providers/process-form/process-form';
import { WorkflowRoutingProvider } from './../../providers/workflow-routing/workflow-routing';
import { FormsModule } from '@angular/forms';
import { Component, NgModule, ViewChild, ViewContainerRef, Compiler } from '@angular/core';

/**
 * Generated class for the CustomDialogComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-custom-dialog',
  templateUrl: 'custom-dialog.html'
})
export class CustomDialogComponent {

 @ViewChild('createNew', { read: ViewContainerRef }) container: ViewContainerRef;

  public dialogHtml:any;
  public dialogLogic:any;
  public FormDataJSON = [];
  data:any;

  /**
   * Creates an instance of CustomDialogComponent.
   * @param {MatDialogRef<CustomDialogComponent>} dialogRef 
   * @param {*} data 
   * @memberof CustomDialogComponent
   */
  constructor(private compiler: Compiler,public navParams: NavParams, public viewController: ViewController) { 
     this.data = this.navParams.get('data');
     this.FormDataJSON = this.data.FormDataJSON
  }

  /**
   * 
   * 
   * @memberof CustomDialogComponent
   */
  ngOnInit() {

    this.dialogHtml = this.data.dialogHtml;
    this.dialogLogic = this.data.dialogLogic;
    this.FormDataJSON = this.data.FormDataJSON;
    this.addComponent(this.dialogHtml, this.dialogLogic);
  }

  addComponent(formTemplate: string, formComponent: string) {
    try {
      @Component({
        template: formTemplate
      })
      class TemplateComponent {
        public FormDataJSON: object;
        constructor(public a:CustomDialogComponent,
          private dialog: ModalController,
          private workflowRoutingService: WorkflowRoutingProvider,
          private processFormService: ProcessFormProvider,
          ) {
          this.FormDataJSON = this.a.FormDataJSON;
        }

        /**
         * Triggered when template component is called
         * 
         * @memberof TemplateComponent
         */
        ngOnInit() {
          this.FormDataJSON = this.a.FormDataJSON;
          
        }
        closeCustomDialog(){
          this.a.viewController.dismiss();        
          }

      }    
      @NgModule({ declarations: [TemplateComponent], imports: [FormsModule,AppModule, FlexLayoutModule] })
      class TemplateModule { }

      const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
      const factory = mod.componentFactories.find((comp) =>
        comp.componentType === TemplateComponent
      );
      let comp = '';
      eval(formComponent)
      const component = this.container.createComponent(factory);
      Object.assign(component.instance, comp);
    } catch (ex) {
    }
  }

  /**
   * 
   * 
   * @param {any} action 
   * @memberof CustomDialogComponent
   */
  
  
}
