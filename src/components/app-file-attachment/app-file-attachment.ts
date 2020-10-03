import { FileprogressbarPage } from './../../pages/fileprogressbar/fileprogressbar';
import { ModalController } from 'ionic-angular';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/


import { ENV } from './../../config/environment.prod';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { LoadingProvider } from './../../providers/loading/loading';
import { SocketProvider } from './../../providers/socket/socket';
import { Component, Input, Output, EventEmitter, ElementRef, Inject } from '@angular/core';
import * as $ from 'jquery';
import { ErrorReportingProvider } from '../../providers/error-reporting/error-reporting';
(window as any).jQuery = $;
import { EncryptionProvider } from './../../providers/encryption/encryption';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

/*
ModuleID: app-file-attachments
Description: A reuseable component on the form which allows users to select file
Location: ./components/app-file-attachments
Author: Hassan
Version: 1.0.0
Modification history: none
*/
@Component({
  selector: 'app-file-attachment',
  templateUrl: 'app-file-attachment.html'
})
export class AppFileAttachmentComponent {

  overWriteFile; // passed to check if the file over write is allowed or not
  @Input('fileTypes') fileTypes;
  @Input('individualFileSize') individualFileSize;
  @Input('totalFileSize') totalFileSize;
  @Input('numberOfFiles') numberOfFiles;
  @Input('ngModel') ngModel;
  @Input('formDataJSON') formDataJSON;
  @Input('fieldName') fieldName;
  @Input('controlOptions') controlOptions;
  @Output() ngModelChange = new EventEmitter();

  public FileName = ''; // Name of the file to be shown
  public tempFileName = ''; // temp variable to store file name
  public fileSize: any; // size of the file being uploaded
  public reader; // to read the file data
  public myForm: FormGroup; // FormGroup for validation
  public tempNgModel: any; // temp modal to emit modal data.

  constructor(
    private el: ElementRef,
    @Inject(FormBuilder) formBuilder: FormBuilder,
    public globalservice: ProcessDataProvider,
    public loading: LoadingProvider,
    public modalCtrl: ModalController,
    public alertctrl: AlertController,
    private socket: SocketProvider,
    private encryptionProvider: EncryptionProvider,
    private errorReportingProvider: ErrorReportingProvider) {
    this.reader = new FileReader();
    this.myForm = formBuilder.group({});
    this.fileSize = 0;
  }

  /**
  * Initializes the attachment controls and its properties.
  */
  ngOnInit() {
    this.setAttachmentProperties();
    if (this.ngModel == null || this.ngModel == "" || this.ngModel.length == 0 || this.ngModel == undefined || typeof this.ngModel != 'object') {
      this.tempNgModel = [];
      this.ngModel = [];
    }
    else {
      this.tempNgModel = this.ngModel;
    }
    if (this.fieldName == null || this.fieldName == "" || this.fieldName == undefined) {
      this.fieldName = "fileAttachmentID";
    }
  }

  /**
  * Called upon selection of a file from the user 
  */

  setFiles() {

    setTimeout(() => {
      let inputEl = this.el.nativeElement.firstElementChild.firstElementChild.lastElementChild;
      if (inputEl.files.length == 0) return;

      let files: FileList = inputEl.files;
      this.FileName = files[0].name;
      this.tempFileName = files[0].name;
      this.fileSize = files[0].size;
      if (this.checkValidationOnFile(inputEl)) {
        let filePath = this.formDataJSON["ArchivePath"] + "TemporaryArchives\\" + this.formDataJSON["ProcessID"] + "\\";
        if (typeof this.globalservice.user.UserID != "undefined") {
          this.FileName = this.globalservice.user.UserID + "RFNGDL" + this.formDataJSON["FormID"] + "RFNGDL" + inputEl.name + "RFNGDL" + this.FileName;
        }
        else {
          this.FileName = "e12RFNGDL" + this.formDataJSON["FormID"] + "RFNGDL" + inputEl.name + "RFNGDL" + this.FileName;
        }

        let file = inputEl.files[0];
        var self = this;
        var reader = new FileReader();
        reader.onload = (e) => {
          var rawData = e.target["result"];
          var param = {
            fileName: self.FileName,
            uploadPath: filePath,
            fileData: rawData.substr(rawData.indexOf(',') + 1),
            diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
            operationType : 'FILE'
          };

          //this.loading.presentLoading("Uploading File...", 20000);
          let directoryModal = this.modalCtrl.create(FileprogressbarPage, {params : { fileName: this.tempFileName,fullFileName: this.FileName,fileSize: this.fileSize }}, { enableBackdropDismiss: true });
          directoryModal.present();
          self.socket.callWebSocketService('socketFileSave', param)
            .then((result) => {
              //this.loading.hideLoading();
            
              if (result.toLowerCase() === 'file uploaded') 
                {
                  directoryModal.dismiss();
                  let downloadPath = this.showFileShareAttachmentOnPage(this.formDataJSON["ArchivePath"], inputEl.id);
                  let completedDownloadPath = this.showFileShareAttachmentOnPageCompleted(this.formDataJSON["ArchivePath"], inputEl.id);
                  this.tempNgModel.push({ 'name': this.tempFileName, 'size': this.fileSize, 'url': downloadPath, 'tempArchiveName': this.FileName, 'type': 'attachment', 'tempArchievePath': downloadPath, 'completeArchievePath': completedDownloadPath });
                  inputEl.value = "";
                  if (this.controlOptions.required) {
                    if (this.tempNgModel.length > 0) {
                      this.ngModel = this.tempNgModel;
                      this.ngModelChange.emit(this.ngModel);
                    }
                    else {
                      this.ngModelChange.emit("");
                    }
                  }
                  else
                  {
                    this.ngModel = this.tempNgModel;
                    this.ngModelChange.emit(this.ngModel);
                  }

                }
              else
                {
                  directoryModal.dismiss();
                }
            }).catch(error => {
             // self.loading.hideLoading();
             directoryModal.dismiss();
              if (error != 'NoConnection') {
                self.errorReportingProvider.logErrorOnAppServer('File Save Error',
                  'Error while saving file',
                  '',
                  '0',
                  'AppFileAttachmentComponent(socket.socketFileSave)',
                  error.message ? error.message : '',
                  error.stack ? error.stack : '',
                  new Date().toTimeString(),
                  'open',
                  'Platform',
                  '');
              }
            });
        }

        reader.readAsDataURL(file);
      }
    });
  }

  /**
  * Update attachment path on the completed form
  */
  showFileShareAttachmentOnPageCompleted(fileSharelinks, AttachmentID) {
    var fileshareurl = '';
    fileSharelinks = fileSharelinks + this.formDataJSON["ProcessID"] + "\\" + this.formDataJSON["WorkflowID"] + "\\" + this.formDataJSON["FormID"] + "\\" + AttachmentID + "\\" + this.tempFileName;
    fileshareurl = ENV.DOWNLOAD_PDF_PATH + '//WCFFileAttachmentService.svc/downloadFile?fPath=' + this.encryptionProvider.encryptData(fileSharelinks.replace(/\\/g, "\\\\"));
    return fileshareurl;
  }

  /**
  * Update attachment path on the pending form
  */
  showFileShareAttachmentOnPage(fileSharelinks, AttachmentID) {
    var fileshareurl = '';
    fileSharelinks = fileSharelinks + "TemporaryArchives\\" + this.formDataJSON["ProcessID"] + "\\" + this.FileName;
    fileshareurl = ENV.DOWNLOAD_PDF_PATH + '//WCFFileAttachmentService.svc/downloadFile?fPath=' + this.encryptionProvider.encryptData(fileSharelinks.replace(/\\/g, "\\\\"));
    return fileshareurl;
  }

  /**
  * Remove file from model and check for validation
  */
  removeFile(file, index) {
    this.tempNgModel.splice(index, 1);
    if (this.tempNgModel.length == 0) {
      if (this.controlOptions != undefined) {
        if (this.controlOptions.required) {
          this.myForm.controls[this.fieldName] = new FormControl();
          this.myForm.controls[this.fieldName].setValidators(Validators.required);
          this.ngModelChange.emit("");
        }
        else {
          this.ngModel = this.tempNgModel;
          this.ngModelChange.emit(this.ngModel);
          this.myForm.controls[this.fieldName] = new FormControl();
          this.myForm.controls[this.fieldName].setValidators(Validators.nullValidator);
        }
      }
    }
  }

  /**
  * initialize the attachment properties
  */
  setAttachmentProperties() {
    if (this.fieldName == undefined || this.fieldName == "") {
      this.fieldName = "myFileAttachment";
    }
    if (this.controlOptions != undefined) {
      if (this.fileTypes == undefined) {
        this.fileTypes = this.controlOptions.fileTypes;
      }

      if (this.individualFileSize == undefined) {
        this.individualFileSize = this.controlOptions.individualFileSize;
      }

      if (this.totalFileSize == undefined) {
        this.totalFileSize = this.controlOptions.totalFileSize;
      }

      if (this.numberOfFiles == undefined) {
        this.numberOfFiles = this.controlOptions.numberOfFiles;
      }
      if (this.controlOptions.overWriteFile != undefined) {
        this.overWriteFile = this.controlOptions.overWriteFile;
        this.overWriteFile = false;
      }
      else {
        this.overWriteFile = false;
      }

      if (this.controlOptions.required) {
        this.myForm.controls[this.fieldName] = new FormControl();  
        this.myForm.controls[this.fieldName].setValidators(Validators.required);
      }

      else {
        this.myForm.controls[this.fieldName] = new FormControl();   
        this.myForm.controls[this.fieldName].setValidators(Validators.nullValidator);
      }
    }

    if (this.controlOptions != undefined) {
      if (this.controlOptions.required) {
        this.myForm.controls[this.fieldName] = new FormControl();   
        this.myForm.controls[this.fieldName].setValidators(Validators.required);
      }
      else {
        this.myForm.controls[this.fieldName] = new FormControl();
        this.myForm.controls[this.fieldName].setValidators(Validators.nullValidator);
      }
    }
  }

  /**
  * calculate file size in Kbs
  */
  calculateSizeKb(size) {
    size = size / 1024;
    return Math.round(size * 100) / 100
  }

  /**
  * calculate file size in Gbs
  */
  calculateSizeMb(size) {
    size = size / 1024 / 1024;
    return Math.round(size * 100) / 100
  }


  /**
  * validate file before upload to server. checks for valid extensions and sizes and overwrites etc.
  */
  checkValidationOnFile(element) {
    var validatedFile = true;
    var fileExtension = "";
    var fileFound = false;
    var basename = this.tempFileName.split(/[\\/]/).pop(), 
      pos = basename.lastIndexOf(".");       
    if (basename === "" || pos < 1) {

      fileExtension = "";
    }
    else {
      fileExtension = basename.slice(pos + 1);
    }

    if (fileExtension != "") {
      if (this.fileTypes != undefined) {
        if (this.fileTypes.indexOf(fileExtension) == -1) {
          this.alertctrl.create({ title: 'Unable to upload file', message: "The file type uploaded is not allowed, kindly upload a file with " + this.fileTypes + " as extensions"}).present();
          validatedFile = false;
          element.value = "";
        }
      }
      else {
        validatedFile = true;
      }
    }
    else {
       this.alertctrl.create({ message: "The file type uploaded is not allowed, kindly upload a file with " + this.fileTypes + " as extensions"}).present();
      validatedFile = false;
      element.value = "";
    }

    if (validatedFile) {
      if (this.tempFileName.length > 200) {
        this.alertctrl.create({ title: 'Unable to upload file', message: "The file uploaded has a name too long for the system. Kindly rename the file and try again"}).present();
        validatedFile = false;
        element.value = "";
      }
    }

    if (validatedFile) {
      if (this.tempNgModel.length + 1 > this.numberOfFiles) {
        this.alertctrl.create({ title: 'Unable to upload file', message: "You can not upload anymore files. Please delete a file and try again"}).present();
        validatedFile = false;
        element.value = "";
      }
    }

    if (validatedFile) {
      if (this.individualFileSize < (this.fileSize / 1024 / 1024)) {
         this.alertctrl.create({ title: 'Unable to upload file', message: "The file size of the uploaded file is too large. Please upload a file less than " + this.individualFileSize}).present();
        validatedFile = false;
        element.value = "";
      }
    }
    var index = 0;
    if (validatedFile) {
      if (this.tempNgModel.length > 0) {
        var totalFileSizeUploaded = 0;
        for (index = 0; index < this.tempNgModel.length; index++) {
          totalFileSizeUploaded += this.tempNgModel[index].size;
        }
        if ((totalFileSizeUploaded / 1024 / 1024) > this.totalFileSize) {
          this.alertctrl.create({ title: 'Unable to upload file', message: "The total file size of the uploaded files is too large. You cannot upload any more files. Please remove a file and try again"}).present();
          validatedFile = false;
          element.value = "";
        }
      }
    }
    if (validatedFile) {
      if (this.tempNgModel.length > 0) {
        if (!this.overWriteFile) {
        for (index = 0; index < this.ngModel.length; index++) {
            if (this.ngModel[index]["name"].toLowerCase() == this.tempFileName.toLowerCase()) {
              fileFound = true;
              break;
            }
          }
          if (fileFound) {
            validatedFile = false;
            let alert = this.alertctrl.create({
            title: 'Unable to upload file',
            message: 'A file with the same name already exists. Kindly remove the already existing file or rename the current file and try again.',
            buttons: [
              {
                text: 'Ok',
                handler: () => {
                  element.value = "";
                }
              }
            ]
          });
          alert.present();
          }
          else {
            validatedFile = true;
          }

      }
      }
      else
      {
        validatedFile = true;
      }
    }
    return validatedFile;
  }
}
