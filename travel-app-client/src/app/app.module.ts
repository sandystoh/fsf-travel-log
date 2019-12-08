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

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    LoginComponent,
    PlacesListComponent,
    MapComponent,
    PlacesFormComponent,
    AutocompleteComponent
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
  providers: [AuthService, TravelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
