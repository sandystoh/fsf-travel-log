import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as moment from 'moment';
import { Journey } from '../../models';
import { TravelService } from '../../services/travel.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-journey-edit',
  templateUrl: './journey-edit.component.html',
  styleUrls: ['./journey-edit.component.css']
})
export class JourneyEditComponent implements OnInit, AfterContentChecked {

  journeyForm: FormGroup;
  journey: Journey;
  owner: string;
  @ViewChild('imageFile', {static: false})
  imageFile: ElementRef;
  isSubmitted = false;

  imagePath;
  imgURL: any;
  message: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef:MatDialogRef<JourneyEditComponent>,
              private travelSvc: TravelService, private cd: ChangeDetectorRef, private router: Router,
              private snackbar: MatSnackBar) { }

  ngOnInit() { 
    this.journeyForm = this.createFormGroup();
    this.owner = this.data.owner;
    if(this.data.fromPlacesForm) {
      this.journeyForm.controls.type.disable();
      this.journeyForm.controls.type.setValue(this.data.type);
    } else {
      this.journey = this.data.journey;
      // this.journeyForm.controls.type.setValue('BEEN');
      this.journeyForm.patchValue(Object.assign({...this.data.journey,
        date: moment(this.data.journey.date).format('YYYY-MM-DD'),
        end_date: moment(this.data.journey.end_date).format('YYYY-MM-DD')
      }));
      if(this.journey.image_url !== '') this.imgURL = `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/journeys/thumbnails/${this.journey.image_url}`

    }
  }

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

  get f() { return this.journeyForm.controls; }

  createFormGroup() {
    return new FormGroup({
     title: new FormControl('', [Validators.required, Validators.maxLength(120)]),  // limit 128
     type: new FormControl({value:''}),
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
    id: this.data.journey.id,
    type: v.type,
    title: v.title,
    owner: this.owner,
    date: (v.date) ? moment(v.date).format("YYYY-MM-DD HH:mm:ss") : null,
    end_date: (v.end_date) ? moment(v.end_date).format("YYYY-MM-DD HH:mm:ss") : null,
    description: v.description,
    image_url: this.data.journey.image_url,
    place_ids: this.data.places.map(v => { return v.id}),
    old_type: this.data.journey.type
  };
  console.log('save',save);
  this.travelSvc.editJourney(save, this.imageFile).then((r) => {
    console.log(r);
    this.openSnackBar('Journey Updated Successfully', 'OK');
    this.dialogRef.close(true);
    this.isSubmitted = false;
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

