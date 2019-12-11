import { Component, OnInit } from '@angular/core';
import { Journey, Country } from '../models';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelService } from '../services/travel.service';
import * as moment from 'moment';

@Component({
  selector: 'app-journeys-list',
  templateUrl: './journeys-list.component.html',
  styleUrls: ['./journeys-list.component.css']
})
export class JourneysListComponent implements OnInit {
  username: String;
  journeys: Journey[] = [];
  countries: Country[];
  // q = '';
  increment = 12;
  offset = 0;
  top = 0;
  numResults = 0;
  showNext = true;
  isLoading = true;
  isError = false;
  pageStatus="all";

  constructor(private router: Router, private route: ActivatedRoute,
              private authSvc: AuthService, private travelSvc: TravelService,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.username = this.route.snapshot.params['user'];
    this.init();
  }

  loadReset() {
    this.isLoading = true;
    this.journeys = [];
    this.isError = false;
  }

  init() {
    this.loadReset();
    this.travelSvc.getCountryList().then(c => {
      this.countries = c;
      this.getJourneys();
  })
  .catch(e => { console.log(e); this.isLoading = false; this.isError = true; }); 
    /* For Search/Autocomplete

      this.travelSvc.getPlaceTitles(this.username).then(p => {
        console.log(p);
        this.options = p;
        this.filteredOptions = this.search.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );
        
      }).catch(e => { console.log(e); this.isLoading = false; this.isError = true; });
*/
  }

  getJourneys() {
    this.travelSvc.getJourneys(this.username, this.increment, this.offset).then(r => {
      console.log(r);
      this.journeys = r.journeys.map(v => {
        let url_string = `../../assets/images/placeholder-journey.jpg`;
        if(v.image_url !== null && v.image_url != '') url_string = `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/journeys/thumbnails/${v.image_url}`;
        return {
          ...v,
          duration: moment(v.end_date).diff(moment(v.date), 'days'),
          url: this.sanitizer.bypassSecurityTrustStyle(`url(${url_string}) no-repeat`)
        }
      });
      
      this.numResults = r.count;
      this.getTop();
      this.isLoading = false;
    }).catch(e => { console.log(e); this.isLoading = false; this.isError = true; });
  }


  back() {
    this.loadReset();;
    this.offset -= this.increment;
    if (this.pageStatus === 'search') {
      // this.searchPlaces();
    } else {
      this.getJourneys();
    }
  }

  next() {
    this.loadReset();
    this.offset += this.increment;
    if (this.pageStatus === 'search') {
      // this.searchPlaces();
    } else {
      this.getJourneys();
    }
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
