import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as moment from 'moment';
import { Journey } from '../../models';
import { TravelService } from '../../services/travel.service';
import { MatSnackBar } from '@angular/material';

export interface DialogData {
  owner: string;
}


@Component({
  selector: 'app-journey-form',
  templateUrl: './journey-form.component.html',
  styleUrls: ['./journey-form.component.css']
})
export class JourneyFormComponent implements OnInit {

  journeyForm: FormGroup;
  owner: string;
  @ViewChild('imageFile', {static: false})
  imageFile: ElementRef;
  isSubmitted = false;
  
  imagePath;
  imgURL: any;
  message: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef:MatDialogRef<JourneyFormComponent>,
              private travelSvc: TravelService, private snackbar: MatSnackBar) { }

  ngOnInit() { 
    this.journeyForm = this.createFormGroup();
    this.owner = this.data.owner;
    if(this.data.fromPlacesForm) {
      this.journeyForm.controls.type.disable();
      this.journeyForm.controls.type.setValue(this.data.type);
    } else this.journeyForm.controls.type.setValue('BEEN');
  }

  get f() { return this.journeyForm.controls; }

  createFormGroup() {
    return new FormGroup({
     title: new FormControl('', [Validators.required, Validators.maxLength(120)]),  // limit 128
     type: new FormControl({value:'BEEN'}),
     date: new FormControl(''),
     end_date: new FormControl(''),
     description: new FormControl(''), // limit 65535 characters
   });
 } 

 setEndDate() {
   this.f.end_date.setValue(this.f.date.value);
 }

 preview(files) {
  if (files.length === 0) {
    return;
  }
  const mimeType = files[0].type;
  if (mimeType.match(/image\/*/) == null) {
    this.message = 'Only images are supported.';
    return;
  }
  const reader = new FileReader();
  this.imagePath = files;
  reader.readAsDataURL(files[0]);
  reader.onload = (event) => {
    this.imgURL = reader.result;
  };
}

onSubmit(form: NgForm) {
  this.isSubmitted = true;
  const v = this.journeyForm.getRawValue();
  console.log(this.imageFile.nativeElement.files[0]); // undefined if no file
  console.log(moment(v.date).toISOString());

  const save: Journey = {
    type: v.type,
    title: v.title,
    owner: this.owner,
    date: (v.date) ? moment(v.date).format("YYYY-MM-DD HH:mm:ss") : null,
    end_date: (v.end_date) ? moment(v.end_date).format("YYYY-MM-DD HH:mm:ss") : null,
    description: v.description,
    num_places: 0
  };
  console.log(save);
  this.travelSvc.createJourney(save, this.imageFile).then((r) => {
    this.isSubmitted = false;
    console.log(r);
    this.openSnackBar('Journey Added Successfully', 'OK');
    this.dialogRef.close({insertId: r.insertId});
  }).catch(err => {
    console.log(err);
    this.isSubmitted = false;
    this.openSnackBar('Error. Please Try Again!', 'OK');
  });
}

openSnackBar(message: string, action: string) {
  this.snackbar.open(message, action, {
    duration: 2000,
  });
}

}
