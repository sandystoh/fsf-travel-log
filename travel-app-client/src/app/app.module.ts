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
import { PlacesListComponent } from './components/places/places-list.component';
import { TravelService } from './services/travel.service';
import { MapComponent } from './components/map.component';
import { PlacesFormComponent } from './components/places/places-form.component';
import { AutocompleteComponent } from './components/helpers/autocomplete.component';
import { PrimeNGModule } from './primeng.module';
import { JourneyFormComponent } from './components/journeys/journey-form.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { PlaceDetailComponent } from './components/places/place-detail.component';
import { JourneyDetailComponent } from './components/journeys/journey-detail.component';
import { PlaceCardComponent } from './components/helpers/place-card.component';
import { JourneysListComponent } from './components/journeys/journeys-list.component';
import { JourneyCardComponent } from './components/helpers/journey-card.component';
import { PlaceReorderComponent } from './components/helpers/place-reorder.component';
import { JourneyMapComponent } from './components/helpers/journey-map.component';
import { PlacesEditComponent } from './components/places/places-edit.component';
import { JourneyEditComponent } from './components/journeys/journey-edit.component';

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
    JourneyCardComponent,
    PlaceReorderComponent,
    JourneyMapComponent,
    PlacesEditComponent,
    JourneyEditComponent
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
    JourneyFormComponent, JourneyMapComponent, JourneyEditComponent
  ],
  providers: [AuthService, TravelService,
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
