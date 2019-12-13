import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Place, Country, Journey } from '../../models';
import { TravelService } from '../../services/travel.service';
import * as moment from 'moment';
import { AutocompleteComponent } from '../helpers/autocomplete.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { JourneyFormComponent } from '../journeys/journey-form.component';

@Component({
  selector: 'app-places-edit',
  templateUrl: './places-edit.component.html',
  styleUrls: ['./places-edit.component.css']
})
export class PlacesEditComponent implements OnInit {

  placeForm: FormGroup;
  id: number;
  owner: string;
  place: Place;
  editedPlace: Place;
  countries: Country[] = [];
  journeys: Journey[] = [];
  lat: number;
  lng: number;
  @ViewChild('auto', {static: false}) private auto: AutocompleteComponent;
  
  @ViewChild('imageFile', {static: false})
  imageFile: ElementRef;
  
  imagePath;
  imgURL: any;
  message: string;
  isSubmitted = false;

  constructor(private router:Router, private route:ActivatedRoute,
              private travelSvc: TravelService, public dialog: MatDialog, 
              private snackbar: MatSnackBar) { }

  ngOnInit() {
    this.placeForm = this.createFormGroup();
    this.owner = this.route.snapshot.params['user'];
    this.id = this.route.snapshot.params['id'];
    this.travelSvc.getCountryList()
      .then(c => {
      this.countries = c;
      return this.travelSvc.getPlaceById(this.id) })
      .then(r => {
        this.place = r;
        r.date = moment(r.date).format('YYYY-MM-DD');
        this.getJourneyList(this.place.type);
        this.placeForm.patchValue(this.place);
        if(this.place.image_url !== '') this.imgURL = `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/places/thumbnails/${this.place.image_url}`
        console.log(this.place);
      }).catch(e => console.log(e));

  }

  get f() { return this.placeForm.controls; }

  createFormGroup() {
    return new FormGroup({
     location_name: new FormControl({value:'', disabled:true}, [Validators.required]),  // limit 128
     title: new FormControl('', [Validators.required, Validators.maxLength(120)]),
     type: new FormControl('BEEN'),
     journey_id: new FormControl(''),
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
 }

 getPlace(p) {
   console.log('>>> ', p);
   this.f.title.setValue(p.name);
   this.f.location_name.setValue(p.name);
   this.f.country.setValue(p.address_components.find(o => o.types.includes("country")).short_name)
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

onSubmit(form: NgForm) {
  this.isSubmitted = true;
  const v = this.placeForm.getRawValue();
  console.log(this.imageFile.nativeElement.files[0]); // undefined if no file
  console.log(moment(v.date).toISOString());

  const edited: Place = {
    id: this.place.id,
    journey_id: v.journey_id || 0,
    type: v.type,
    title: v.title,
    location_name: (v.location_name.length > 128) ? v.title.substr(0, 95) + '...' : v.title,
    owner: this.owner,
    date: moment(v.date).format("YYYY-MM-DD HH:mm:ss"),
    lat: this.lat,
    lng: this.lng,
    country: v.country,
    rating: v.rating,
    description: v.description,
    private_notes: v.private
  };
  this.travelSvc.editPlace(edited, this.imageFile).then((r) => {
    console.log(r);
    this.isSubmitted = false;
    this.openSnackBar('Place Updated Successfully', 'OK');
    this.router.navigate(['/place', this.place.id]); 
  }).catch(err => {
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
