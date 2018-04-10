import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.Name = navParams.get("Name");
    this.Path = navParams.get("Path");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DocPage');
  }

  
}