import { Component, OnInit, Input } from '@angular/core';
import { Journey } from 'src/app/models';

@Component({
  selector: 'app-journey-card',
  templateUrl: './journey-card.component.html',
  styleUrls: ['./journey-card.component.css']
})
export class JourneyCardComponent implements OnInit {

  @Input()
  j: Journey;

  constructor() { }

  ngOnInit() {
  }

}
