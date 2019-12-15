import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TravelService } from '../../services/travel.service';
import { Place, Country, User } from '../../models';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { Observable} from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteTrigger } from '@angular/material';
import {Location} from '@angular/common';

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.css']
})
export class PlacesListComponent implements OnInit {

  username: String;
  places: Place[] = [];
  countries: Country[];
  q = '';
  increment = 10;
  offset = 0;
  top = 0;
  numResults = 0;
  showNext = true;
  isLoading = true;
  isError = false;
  pageStatus="all";
  user: User;
  type = 'BEEN';

  search = new FormControl();
  filteredOptions: Observable<string[]>;
  options = [];
  @ViewChild(MatAutocompleteTrigger, {static: false}) autocomplete: MatAutocompleteTrigger;

  constructor(private router: Router, private route: ActivatedRoute,
              private authSvc: AuthService, private travelSvc: TravelService,
              private sanitizer: DomSanitizer, private location: Location) { }

  ngOnInit() {
    this.username = this.route.snapshot.params['user'];
    this.user = this.authSvc.getUser();
    this.init();
  }

  backClicked() {
    this.location.back();
  }


  init() {
    this.loadReset();
    this.travelSvc.getCountryList().then(c => {
      this.countries = c;
      this.travelSvc.getPlaceTitles(this.username).then(p => {
        console.log(p);
        this.options = p;
        this.filteredOptions = this.search.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );
        this.getPlaces();
      }).catch(e => { console.log(e); this.isLoading = false; this.isError = true; });
    })
    .catch(e => { console.log(e); this.isLoading = false; this.isError = true; });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  onToggle() {
    console.log(this.type);
    console.log(this.q);
    this.offset = 0;
    this.loadReset();
    this.pageStatus = "search";
    if(this.q === '') this.getPlaces();
    else this.searchPlaces();
  }

  back() {
    this.loadReset();;
    this.offset -= this.increment;
    if (this.pageStatus === 'search') {
      this.searchPlaces();
    } else {
      this.getPlaces();
    }
  }

  next() {
    this.loadReset();
    this.offset += this.increment;
    if (this.pageStatus === 'search') {
      this.searchPlaces();
    } else {
      this.getPlaces();
    }
  }

  getPlaces() {
    this.travelSvc.getPlaces(this.username, this.increment, this.offset, this.type).then(r => {
      console.log(r);
      this.places = r.places.map(v => {
        let url_string = `../../assets/images/placeholder.jpeg`;
        if(v.image_url !== null && v.image_url != '') url_string = `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/places/thumbnails/${v.image_url}`;
        return {
        ...v,
        url: this.sanitizer.bypassSecurityTrustStyle(`url(${url_string}) no-repeat`),
        country_name: this.countries.find(o => o.code === v.country).name } 
      });
      this.numResults = r.count;
      this.getTop();
      this.isLoading = false;
    }).catch(e => { console.log(e); this.isLoading = false; this.isError = true; });
  }

  clickSearchButton() {
    console.log(this.search.value);
    this.offset = 0;
    this.loadReset();
    this.q = this.search.value;
    this.pageStatus = "search";
    if(this.q === '') this.getPlaces();
    else this.searchPlaces();
  }

  refreshAll() {
    this.q = '';
    this.pageStatus = "all";    
    this.search.setValue('');
    this.offset = 0;
    if (this.isError) this.init();
    else {
      this.loadReset();
      this.getPlaces();
    }
  }

  loadReset() {
    this.isLoading = true;
    this.places = [];
    this.isError = false;
  }
  
  clearField() {
    this.search.setValue('');
    this.autocomplete.openPanel();
  }

  addPlace() {
    this.router.navigate(['/places/add/'+this.user.username]);
  }

  searchPlaces() {
    this.travelSvc.searchPlaces(this.username, this.q, this.increment, this.offset, this.type).then(r => {
      console.log(r);
      this.places = r.places.map(v => {
        let url_string = `../../assets/images/placeholder.jpeg`;
        if(v.image_url !== null && v.image_url != '') url_string = `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/places/thumbnails/${v.image_url}`;
        return {
        ...v,
        url: this.sanitizer.bypassSecurityTrustStyle(`url(${url_string}) no-repeat`),
        country_name: this.countries.find(o => o.code === v.country).name } 
      });
      this.numResults = r.count;
      this.getTop();
      this.isLoading = false;
    }).catch(e => { console.log(e); this.isLoading = false; this.isError = true; });
  }

  getTop() {
    if ((this.offset + this.increment) >= this.numResults) {
      this.top = this.numResults;
      this.showNext = false;
    } else {
      this.top = this.offset + this.increment;
      this.showNext = true;
    }
  }

  sanitize(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
}

}
