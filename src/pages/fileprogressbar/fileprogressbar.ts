import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the FileprogressbarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-fileprogressbar',
  templateUrl: 'fileprogressbar.html',
})
export class FileprogressbarPage {

  filename;
  fileprogress;
  data;
  public isCanceled:string;
  public progressValue:any;
  public uploadInterval:any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.filename = '';
    this.fileprogress = 0;
    this.isCanceled = "false";
    this.data = navParams.get('params');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FileprogressbarPage');
  }
  
  ngOnInit() {
    this.data.progressValue = 0;
    this.progressValue = 0;
  }

  ngAfterViewInit(){
    var seconds = 0;
    if(this.data.fileSize > 1024*1024){
      seconds = Math.ceil((this.data.fileSize/1024)/20)+ Math.floor(Math.random() * Math.floor(1000));
    }
    else{
      seconds = Math.ceil(this.data.fileSize/512/20)+Math.floor(Math.random() * Math.floor(1000));
    }
    this.uploadInterval = setInterval(()=>{
      this.getProgress();
    },(seconds));
  }

  cancelUpload() {
    this.isCanceled = "true";
  }


  getProgress() {
    if (this.progressValue >= 99) {
      this.progressValue = 99;
    }
    else {
      if (this.progressValue > 20 && this.progressValue < 35) {
        this.progressValue += (Math.floor(Math.random() * Math.floor(4)) + 1);
      }
      else if (this.progressValue > 35 && this.progressValue < 60) {
        this.progressValue += (Math.floor(Math.random() * Math.floor(3)) + 1);
      }
      else if (this.progressValue > 60 && this.progressValue < 80) {
        this.progressValue += (Math.floor(Math.random() * Math.floor(2)) + 1);
      }
      else if (this.progressValue > 80 && this.progressValue < 99) {
        var max = 1;
        var min = 0;
        this.progressValue += (Math.floor(Math.random() * (max - min + 1)) + min);
      }
      else {
        this.progressValue += (Math.floor(Math.random() * Math.floor(5)) + 1);
      }
    }
  }

}
