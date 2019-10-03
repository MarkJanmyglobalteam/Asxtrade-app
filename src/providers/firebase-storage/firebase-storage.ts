import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../app/app.env';
import { Camera, CameraOptions } from '@ionic-native/camera';
import * as firebase from 'firebase';
import { FilePath } from '@ionic-native/file-path';
import { FileChooser } from '@ionic-native/file-chooser';
import { ToastController } from 'ionic-angular';

/*
  Generated class for the FirebaseStorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FirebaseStorageProvider {
  private currentLoggedInUserId;
  private loader;

  constructor(
    private camera: Camera,
    private filePath: FilePath,
    private fileChooser: FileChooser,
    private toastCtrl: ToastController
  ) {
    console.log('Hello FirebaseStorageProvider Provider');
    this.currentLoggedInUserId = firebase.auth().currentUser.uid;
  }

  uploadFileFromExplorer(): Promise<any> {
    return this.fileChooser.open().then(uri => {
      return this.filePath.resolveNativePath(uri).then(fileEntry => {
        let fileName = this.getFileName(fileEntry);
        let fileExtension = this.getFileExtension(fileEntry);
        let blobType: string;

        let file: Promise<any>;

        switch (fileExtension) {
          case 'pdf':
            blobType = 'application/pdf';
            file = this.fileDataURItoBlob(fileEntry, blobType);
            break;
          case 'doc':
            blobType = 'application/msword';
            file = this.fileDataURItoBlob(fileEntry, blobType);
            break;
          case 'docx':
            blobType =
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            file = this.fileDataURItoBlob(fileEntry, blobType);
            break;
          case 'ppt':
            blobType = 'application/vnd.ms-powerpoint';
            file = this.fileDataURItoBlob(fileEntry, blobType);
            break;
          case 'pptx':
            blobType =
              'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            file = this.fileDataURItoBlob(fileEntry, blobType);
            break;
          case 'xls':
            blobType = 'application/vnd.ms-excel';
            file = this.fileDataURItoBlob(fileEntry, blobType);
            break;
          case 'xlsx':
            blobType =
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            file = this.fileDataURItoBlob(fileEntry, blobType);
            break;
          case 'csv':
            blobType = 'text/csv';
            file = this.fileDataURItoBlob(fileEntry, blobType);
            break;
          case 'txt':
            blobType = 'text/plain';
            file = this.fileDataURItoBlob(fileEntry, blobType);
            break;
          case 'gif':
          case 'png':
          case 'jpg':
          case 'jpeg':
            this.toastCtrl.create({
              message: 'Please use the photo gallery to upload images',
              duration: 3000,
              position: 'top'
            }).present();
            break;
          default:
            this.toastCtrl.create({
              message: 'Sorry, this type of file is not allowed',
              duration: 3000,
              position: 'top'
            }).present();
          // file = this.imageDataURItoBlob(fileEntry, 'application/octet-stream');
        }

        if (file) {
          return file.then(fileBlob => {
            return this.uploadFile(fileBlob, fileExtension, blobType).catch(() => {
              this.toastCtrl.create({
                message: 'Oops.. Something went wrong.',
                duration: 2000,
                position: 'top'
              });
            });
          });
        } else {
          return Promise.reject('Invalid file selected');
        }
      });
    });
  }

  uploadImageFromGallery() {
    const options: CameraOptions = {
      quality: 75,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      targetHeight: 900,
      targetWidth: 1600
    };

    return this.camera.getPicture(options).then(imageData => {
      let image = this.imageDataURItoBlob(
        'data:image/jpeg;base64,' + imageData,
        'image/jpeg'
      );

      return this.uploadImage(image);
    });
  }

  uploadImageFromCamera() {
    const options: CameraOptions = {
      quality: 75,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
      targetHeight: 900,
      targetWidth: 1600
    };

    return this.camera.getPicture(options).then(imageData => {
      let image = this.imageDataURItoBlob(
        'data:image/jpeg;base64,' + imageData,
        'image/jpeg'
      );

      // let image = imageData;

      return this.uploadImage(image);
    });
  }

  private getFileName(filestring) {
    let file = filestring.replace(/^.*[\\\/]/, '');
    return file;
  }

  private getFileExtension(filestring) {
    let file = filestring.substr(filestring.lastIndexOf('.') + 1);
    return file;
  }

  private fileDataURItoBlob(dataURI, type) {
    return new Promise((resolve, reject) => {
      window['resolveLocalFileSystemURL'](dataURI, fileEntry => {
        fileEntry.file(resFile => {
          let reader = new FileReader();

          reader.onloadend = (evt: any) => {
            console.log('filereader evt:', evt);
            let fileBlob = new Blob([evt.target.result], { type: type });
            resolve(fileBlob);
          };

          reader.onerror = e => {
            console.log('reader error:', e);
            reject(e);
          };

          reader.readAsArrayBuffer(resFile);
        });
      });
    });
  }

  private imageDataURItoBlob(dataURI, type) {
    // code adapted from: http://stackoverflow.com/questions/33486352/cant-upload-image-to-aws-s3-from-ionic-camera
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: type });
  }

  private uploadFile(file, fileExtension, blobType) {
    if (file && fileExtension) {
      let fileName = `${new Date().getTime()}-${this.currentLoggedInUserId}.${fileExtension}`;
      let uploadTask = firebase
        .storage()
        .ref()
        .child(fileName)
        .put(file, {
          customMetadata: {
            uploadedBy: this.currentLoggedInUserId,
            fileName: fileName,
            blobType: blobType
          }
        });

      this.toastCtrl.create({
        message: 'Uploading...',
        duration: 2000,
        position: 'top'
      }).present();

      return uploadTask.then(this.onSuccess, this.onError);
    } else {
      return Promise.reject('Invalid file selected');
    }
  }

  private uploadImage(image) {
    if (image) {
      let fileName = `images/${new Date().getTime()}-${this.currentLoggedInUserId}.jpeg`;
      let uploadTask = firebase
        .storage()
        .ref()
        .child(fileName)
        .put(image, {
          customMetadata: {
            uploadedBy: this.currentLoggedInUserId,
            fileName: fileName,
            blobType: 'image/jpeg',
          }
        });

      this.toastCtrl.create({
        message: 'Uploading...',
        duration: 2000,
        position: 'top'
      }).present();

      return uploadTask.then(this.onSuccess, this.onError);
    } else {
      return Promise.reject('No image selected');
    }
  }

  private onSuccess = snapshot => {
    console.log('snapshot:', snapshot);
    return {
      downloadUrl: snapshot.downloadURL,
      contentType: snapshot.metadata.contentType,
      fileName: snapshot.metadata.name
    };
  };

  private onError = error => {
    console.log('error', error);
    return error;
  };
}
