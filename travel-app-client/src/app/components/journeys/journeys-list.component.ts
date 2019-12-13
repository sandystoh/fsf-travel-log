import { Component, OnInit, ViewChild } from '@angular/core';
import { Journey, Country, User } from '../../models';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelService } from '../../services/travel.service';
import * as moment from 'moment';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteTrigger, MatDialog } from '@angular/material';
import {Location} from '@angular/common';
import { JourneyFormComponent } from './journey-form.component';

@Component({
  selector: 'app-journeys-list',
  templateUrl: './journeys-list.component.html',
  styleUrls: ['./journeys-list.component.css']
})
export class JourneysListComponent implements OnInit {
  username: String;
  user: User;
  journeys: Journey[] = [];
  countries: Country[];
  q = '';
  increment = 12;
  offset = 0;
  top = 0;
  numResults = 0;
  showNext = true;
  isLoading = true;
  isError = false;
  pageStatus="all";

  search = new FormControl();
  filteredOptions: Observable<string[]>;
  options = [];
  @ViewChild(MatAutocompleteTrigger, {static: false}) autocomplete: MatAutocompleteTrigger;

  constructor(private router: Router, private route: ActivatedRoute, public dialog: MatDialog,
              private authSvc: AuthService, private travelSvc: TravelService,
              private sanitizer: DomSanitizer, private location: Location) { }

  ngOnInit() {
    this.username = this.route.snapshot.params['user'];
    this.user = this.authSvc.getUser();
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
      this.travelSvc.getJourneyTitles(this.username).then(p => {
        console.log(p);
        this.options = p;
        this.filteredOptions = this.search.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );
      });
      }).catch(e => { console.log(e); this.isLoading = false; this.isError = true; });
  }

  clickSearchButton() {
    console.log(this.search.value);
    this.offset = 0;
    this.loadReset();
    this.q = this.search.value;
    this.pageStatus = "search";
    if(this.q === '') this.getJourneys();
    else this.searchJourneys();
  }

  refreshAll() {
    this.q = '';
    this.pageStatus = "all";
    this.offset = 0;
    if (this.isError) this.init();
    else {
      this.loadReset();
      this.getJourneys();
    }
  }

  openJourneyDialog(): void {
    const dialogRef = this.dialog.open(JourneyFormComponent, {
      width: '85vw',
      height: '80vh',
      disableClose: false,
      data: {owner: this.user.username, fromPlacesForm: false}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) this.router.navigate(['/journey', result.insertId]);
    });
  }
  
  clearField() {
    this.search.setValue('');
    this.autocomplete.openPanel();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
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

  searchJourneys() {
    this.travelSvc.searchJourneys(this.username, this.q, this.increment, this.offset).then(r => {
      console.log(r);
      this.journeys = r.journeys.map(v => { return {
        ...v,
        url: this.sanitizer.bypassSecurityTrustStyle(`url(https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/journeys/thumbnails/${v.image_url}) no-repeat`)
      }
    });
      this.numResults = r.count;
      this.getTop();
      this.isLoading = false;
    }).catch(e => { console.log(e); this.isLoading = false; this.isError = true; });
  }


  backClicked() {
    this.location.back();
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
