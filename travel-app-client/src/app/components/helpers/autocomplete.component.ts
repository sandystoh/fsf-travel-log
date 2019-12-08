import { Component, OnInit, AfterViewInit, ViewChild, NgZone, Output, EventEmitter } from '@angular/core';
declare var google: any;
declare namespace google.maps.places {
  export interface PlaceResult { geometry }
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css']
})
export class AutocompleteComponent implements OnInit, AfterViewInit {

  @Output() setPlaceString: EventEmitter<any> = new EventEmitter();
  @ViewChild('placetext', { static: false }) placetext: any;
  autocompleteInput: string;

  constructor(private ngZone: NgZone) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.getPlaceAutocomplete();
  }

  private getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.placetext.nativeElement,
        {fields:['address_component', 'formatted_address', 'geometry', 'name'] });
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = autocomplete.getPlace();
        place.full_location =  this.autocompleteInput;
        this.invokeEvent(place);
      });
    });
  }

  clearField() {
    this.autocompleteInput = '';
  }

  invokeEvent(place: google.maps.places.PlaceResult) {
    this.setPlaceString.emit(place);
  } 

}
