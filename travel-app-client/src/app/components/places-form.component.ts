import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Place, Country, Journey } from '../models';
import { TravelService } from '../services/travel.service';
import * as moment from 'moment';
import { AutocompleteComponent } from './helpers/autocomplete.component';
import { MatDialog } from '@angular/material';
import { JourneyFormComponent } from './journey-form.component';
import { ResourceLoader } from '@angular/compiler';
declare var google: any;

@Component({
  selector: 'app-places-form',
  templateUrl: './places-form.component.html',
  styleUrls: ['./places-form.component.css']
})
export class PlacesFormComponent implements OnInit {

  placeForm: FormGroup;
  owner: string;
  countries: Country[] = [];
  journeys: Journey[] = [];
  today: any;
  lat: number;
  lng: number;
  full_location: '';
  @ViewChild('auto', {static: false}) private auto: AutocompleteComponent;
  
  @ViewChild('imageFile', {static: false})
  imageFile: ElementRef;
  
  imagePath;
  imgURL: any;
  message: string;
  
  constructor(private router:Router, private route:ActivatedRoute,
              private travelSvc: TravelService, public dialog: MatDialog) { }

  ngOnInit() {
    this.placeForm = this.createFormGroup();
    this.owner = this.route.snapshot.params['user'];
    this.today = moment();
    this.travelSvc.getCountryList().then(c => {
      // console.log('countries', c);
      this.countries = c;
    });
    this.getJourneyList('BEEN'); 
  }

  get f() { return this.placeForm.controls; }

  createFormGroup() {
    return new FormGroup({
     title: new FormControl({value:'', disabled:true}, [Validators.required]),  // limit 128
     type: new FormControl('BEEN'),
     journey: new FormControl(''),
     country: new FormControl({value:'', disabled:true}, [Validators.required]),
     date: new FormControl(''),
     rating: new FormControl(''),
     description: new FormControl(''), // limit 65535 characters
     private: new FormControl(''),
   });
 }

 openJourneyDialog(): void {
  const dialogRef = this.dialog.open(JourneyFormComponent, {
    width: '85vw',
    height: '80vh',
    disableClose: false,
    data: {owner: this.owner, type: this.placeForm.controls.type.value, fromPlacesForm: true}
  });

  dialogRef.afterClosed().subscribe(result => {
    if(result) {
      console.log('The dialog was closed', result,  this.f.type.value);
      console.log('>>>', result.insertId);
      this.getJourneyList(this.f.type.value).then(() => {
            this.placeForm.patchValue({
            journey: result.insertId
          });
      }); 
    }
  });
}

 getJourneyList(type) {
  return this.travelSvc.getJourneyList(this.owner, type).then(r => {
    // console.log('journeys', r);
    this.journeys = r.map(v => {
      if(v.date)
        return {...v, month: moment(v.date).format('MMM'), year: moment(v.date).format('YYYY')}
      return {...v}
    });
    return Promise.resolve();
  })

 }

 changeType(e) {
   this.getJourneyList(e.value);
   if(e.value == 'DREAM') this.f.date.setValue(null);
 }

 getPlace(p) {
   console.log('>>> ', p);
   this.f.title.setValue(p.name);
   this.f.country.setValue(p.address_components.find(o => o.types.includes("country")).short_name)
   this.full_location = p.description;
   this.lat = p.geometry.location.lat();
   this.lng = p.geometry.location.lng();
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

 cancel() {
  this.placeForm.reset();
  this.router.navigate(['/']);
}

reset() {
  this.placeForm.reset();
  this.auto.clearField();
  this.placeForm.controls.type.setValue('BEEN');
}

onSubmit(form: NgForm) {
  const v = this.placeForm.getRawValue();
  console.log(this.imageFile.nativeElement.files[0]); // undefined if no file
  console.log(moment(v.date).toISOString());
  
  const hasJourney = this.journeys.find(o => o.id === v.journey)

  const save: Place = {
    journey_id: v.journey || 0,
    journey_order: (hasJourney) ? hasJourney.num_places + 1 : 0,
    type: v.type,
    title: (v.title.length > 100) ? v.title.substr(0, 95) + '...' : v.title,
    owner: this.owner,
    date: moment(v.date).format("YYYY-MM-DD HH:mm:ss"),
    lat: this.lat,
    lng: this.lng,
    country: v.country,
    rating: v.rating,
    description: v.description,
    private_notes: v.private
  };
  this.travelSvc.createPlace(save, this.imageFile).then((r) => {
    console.log(r);
    this.router.navigate(['/places/' + this.owner]); 
  }).catch(err => console.log(err)); 
}

}
