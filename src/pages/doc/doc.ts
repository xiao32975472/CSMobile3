import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { CsDataProvider, DirectoryRecord } from '../../providers/cs-data/cs-data';
import { EC_Success } from '../../app/app.module';
import { NativeStorage } from '@ionic-native/native-storage';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { Platform } from 'ionic-angular';

/**
 * Generated class for the DocPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-doc',
  templateUrl: 'doc.html',
})
export class DocPage {

  Name: string;
  Path: string;
  ListRecords = [];

  DisplayRecords = [];

  get LocalDir() {
    if (this.plt.is("ios")) {
      return this.file.documentsDirectory + "行业资料/";
    }
    else {
      return this.file.externalRootDirectory + "行业资料/";
    }    
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public csdata: CsDataProvider,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public transfer: FileTransfer,
    public file: File,
    public cdr: ChangeDetectorRef,
    public opener: FileOpener,
    public plt: Platform
  ) {
    this.Name = navParams.get("Name");
    this.Path = navParams.get("Path");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DocPage');
    let loader = this.loadingCtrl.create({
      content: "获取数据..."
    });
    loader.present();
    this.csdata.DogumentList(this.Path)
      .subscribe(
        result => {
          loader.dismiss();
          if (result.ResultCode == EC_Success) {
            for (let i = 0; i < result.Directories.length; i++) {
              this.ListRecords.push(new ListItem(result.Directories[i], "Directory"));
            }

            for (let i = 0; i < result.Files.length; i++) {
              this.ListRecords.push(new ListItem(result.Files[i], "File"));
            }
            this.ContinueLoad();
          }
          else {
            let toast = this.toastCtrl.create({
              message: result.ErrorMessage,
              duration: 3000,
              position: 'top'
            });
            toast.present();
          }
        }
      );
  }

  doInfinite(infiniteScroll) {
    this.ContinueLoad();
    infiniteScroll.complete(infiniteScroll);
  }

  ContinueLoad(infiniteScroll?) {
    let index = this.DisplayRecords.length;
    let count = 0;
    while (index < this.ListRecords.length && count < 20) {
      this.file.checkFile(this.LocalDir, this.ListRecords[index].Name)
        .then(() => {
          this.ListRecords[index].localPath = this.LocalDir + this.ListRecords[index].Name;
        });
      this.DisplayRecords.push(this.ListRecords[index]);
      index++;
      count++;
    }
    if (index >= this.ListRecords.length) {
      if (infiniteScroll != null) {
        infiniteScroll.complete();
      }
    }
  }

  ItemClick(item: ListItem) {
    alert("Item Click")
    if (item.Type == "Directory")
      this.navCtrl.push(DocPage, { Path: item.Data.Path, Name: item.Data.Name })
    else {
      if (item.LocalPath != null && item.LocalPath.length > 0) {
        this.opener.open(item.LocalPath, 'application/pdf')
          .catch(reason => {
            let msg = "";
            Object.keys(reason).forEach(
              k => {
                msg = msg + k + ":" + reason[k] + "\n";
              }
            )
            alert(msg);
          });
      }
      else {
        this.StartDownload(item);
      }
    }
  }

  StartDownload(item: ListItem) {
    alert("Start Download")
    item.Percentage = 0;
    item.Downloading = true;
    let target = this.LocalDir + item.Data.Name;
    alert(this.LocalDir);
    alert(target);
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.onProgress(e => {
      item.Percentage = Math.round(e.loaded / e.total * 100);
      this.cdr.detectChanges();
    });
    fileTransfer
      .download(item.Data.DownloadUrl, target)
      .then(
        i => {
          item.Downloading = false;
          item.LocalPath = target;
        },
        reason => {
          let msg = "";
          Object.keys(reason).forEach(k => {
            msg = msg + k + ":" + reason[k] + "\n";
          })
          alert(msg);
        })
      .catch(i => {
        item.Downloading = false;
        this.file.checkFile(this.LocalDir, item.Data.Name)
          .then(() => {
            this.file.removeFile(this.LocalDir, item.Data.Name);
          });
      });
  }
}

class ListItem {
  Data: any;
  StartIcon: string;
  EndIcon: string
  Percentage: number;
  Type: string;
  Downloading: boolean;
  LocalPath: string;

  constructor(data: any, type: string, localPath?: string) {
    this.Data = data;
    this.Type = type;
    this.LocalPath = localPath;
    switch (this.Type) {
      case "Directory":
        this.StartIcon = "folder";
        this.EndIcon = "arrow-forward";
        break;
      case "File":
        this.StartIcon = "document";
        this.EndIcon = "download";
        this.LocalPath = localPath;
        break;
    }
  }
}