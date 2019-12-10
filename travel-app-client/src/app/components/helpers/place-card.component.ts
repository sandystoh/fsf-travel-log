import { Component, OnInit, Input } from '@angular/core';
import { Place } from 'src/app/models';

@Component({
  selector: 'app-place-card',
  templateUrl: './place-card.component.html',
  styleUrls: ['./place-card.component.css']
})
export class PlaceCardComponent implements OnInit {

  @Input()
  p: Place;

  constructor() { }

  ngOnInit() {
  }

}
