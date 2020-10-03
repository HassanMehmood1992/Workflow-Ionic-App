import { FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the AppUrlPopupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-app-url-popup',
  templateUrl: 'app-url-popup.html',
})
export class AppUrlPopupPage {

  selectorHeader;
  urlform;
  title;
  url;
  constructor(public viewCtrl: ViewController,public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder) {
    this.selectorHeader = this.navParams.get('selectorHeader');
    this.urlform = this.formBuilder.group({
      'title': ['', Validators.compose([Validators.required])],
      'url': ['', [Validators.required]]
    });
    this.title = this.urlform.controls['title'];
    this.url = this.urlform.controls['url'];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AppUrlPopupPage');
  }
  confirmSelection()
  {
    var urlObject = {
      title: this.title.value.toString(),
      url: this.url.value.toString()
    }
    this.viewCtrl.dismiss(urlObject);
  }
  close()
  {
    this.viewCtrl.dismiss();
  }
  ngOnInit()
  {
    if(this.selectorHeader == undefined)
    {
      this.selectorHeader = 'Select URL';
    }
    else
    {
       this.selectorHeader = this.navParams.get('selectorHeader');
    }
  }
  ngAfterViewInit()
  {
    this.selectorHeader = this.navParams.get('selectorHeader');
  }

}
