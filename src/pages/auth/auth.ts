import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, Events, LoadingController, ToastController } from 'ionic-angular';
import { ScanModalPage } from '../scan-modal/scan-modal';
import { CsDataProvider } from '../../providers/cs-data/cs-data';
import { InAppBrowser } from '@ionic-native/in-app-browser';
/**
 * Generated class for the AuthPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-auth',
  templateUrl: 'auth.html',
})
export class AuthPage {

  AuthCode: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public ev: Events,
    public csdata: CsDataProvider,
    public iab: InAppBrowser
  ) {
    this.ev.subscribe(
      "ScannedAuthString",
      data=>{
        let loader = this.loadingCtrl.create({
          content: "获取授权码..."
        });
        loader.present();
        this.csdata.GetAuthCode(data)
          .subscribe(
            result => {
              loader.dismiss();
              if (result.ResultCode == 0) {
                this.AuthCode = result.AuthCode;
              } else {
                this.AuthCode = "";
                if(result.ErrorMessage = "授权信息格式错误"){
                  if(data.indexOf("http://") != -1 ||data.indexOf("https://") != -1 ){
                    const browser = this.iab.create(
                      data,
                      "_blank",
                      {
                        location: "no"
                      });                    
   
                  }else{
                    let toast = this.toastCtrl.create({
                      message: result.ErrorMessage,
                      duration: 3000,
                      position: 'top'
                    });
                    toast.present();  
                  }
                } else{
                   let toast = this.toastCtrl.create({
                     message: result.ErrorMessage,
                     duration: 3000,
                     position: 'top'
                   });
                   toast.present();
                }                
              }
            }
          );
      }
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AuthPage');
  }

  ionViewDidLeave() {
    this.AuthCode = "";
  }

  DoScan() {
    this.navCtrl.parent.parent.push(ScanModalPage, {}, { animate: false });
  }

}
