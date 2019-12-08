import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Place, Country } from '../models';
import { TravelService } from '../services/travel.service';
import * as moment from 'moment';
import { AutocompleteComponent } from './helpers/autocomplete.component';
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
  today: any;
  lat: number;
  lng: number;
  full_location: '';
  // @ViewChild('auto', {static: false}) private auto: AutocompleteComponent;
  
  @ViewChild('imageFile', {static: false})
  imageFile: ElementRef;
  
  imagePath;
  imgURL: any;
  message: string;
  
  constructor(private router:Router, private route:ActivatedRoute,
              private travelSvc: TravelService) { }

  ngOnInit() {
    this.placeForm = this.createFormGroup();
    this.owner = this.route.snapshot.params['user'];
    this.today = moment();
    this.travelSvc.getCountryList().then(c => {
      console.log('countries', c);
      this.countries = c;
    })
  }

  get f() { return this.placeForm.controls; }

  createFormGroup() {
    // also get journey_id, journey_order from journeys, lat/lng from google places
    return new FormGroup({
     title: new FormControl({value:'', disabled:true}, [Validators.required]),  // limit 256
     type: new FormControl('BEEN'),
     journey: new FormControl(''),
     country: new FormControl({value:'', disabled:true}, [Validators.required]),
     date: new FormControl(''),
     rating: new FormControl(''),
     description: new FormControl(''), // limit 65535 characters
     private: new FormControl(''),
   });
 }

 getPlace(p) {
   console.log('>>> ', p);
   this.f.title.setValue(p.name);
   this.f.country.setValue(p.address_components.find(o => o.types.includes("country")).short_name)
   this.full_location = p.description;
   this.lat = p.geometry.location.lat();
   this.lng = p.geometry.location.lng();
   console.log('latlng', this.lat, this.lng)
   console.log('>> place name', p.name)
   console.log('>> country', p.address_components.find(o => o.types.includes("country")).short_name)
   console.log('>> latitude', p.geometry.location.lat())
   console.log('>> longitude', p.geometry.location.lng())
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

onSubmit(form: NgForm) {
  const v = this.placeForm.getRawValue();
  console.log(this.imageFile.nativeElement.files[0]); // undefined if no file
  console.log(moment(v.date).toISOString());
  
  const save: Place = {
    journey_id: v.journey || 0,
    journey_order: 0, // calculate
    type: v.type,
    title: v.title,
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
    // this.router.navigate(['/places/' + this.owner]); 
  }).catch(err => console.log(err)); 
}

}

/*
journey_id int,
journey_order int,
type ENUM ('BEEN','DREAM') not null,
title varchar(256) not null,
owner varchar(128) not null,
date datetime,
lat DECIMAL(10, 8),
lng DECIMAL(11, 8),
country char(2),
rating int,
image_url varchar(128),
description text,
private_notes text
*/