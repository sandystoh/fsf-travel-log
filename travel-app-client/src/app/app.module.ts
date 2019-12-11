import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { WelcomeComponent } from './components/welcome.component';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login.component';
import { PlacesListComponent } from './components/places-list.component';
import { TravelService } from './services/travel.service';
import { MapComponent } from './components/map.component';
import { PlacesFormComponent } from './components/places-form.component';
import { AutocompleteComponent } from './components/helpers/autocomplete.component';
import { PrimeNGModule } from './primeng.module';
import { JourneyFormComponent } from './components/journey-form.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { PlaceDetailComponent } from './components/place-detail.component';
import { JourneyDetailComponent } from './components/journey-detail.component';
import { PlaceCardComponent } from './components/helpers/place-card.component';
import { JourneysListComponent } from './components/journeys-list.component';
import { JourneyCardComponent } from './components/helpers/journey-card.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    LoginComponent,
    PlacesListComponent,
    MapComponent,
    PlacesFormComponent,
    AutocompleteComponent,
    JourneyFormComponent,
    PlaceDetailComponent,
    JourneyDetailComponent,
    PlaceCardComponent,
    JourneysListComponent,
    JourneyCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    FlexLayoutModule,
    PrimeNGModule
  ],
  entryComponents: [
    JourneyFormComponent
  ],
  providers: [AuthService, TravelService,
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
