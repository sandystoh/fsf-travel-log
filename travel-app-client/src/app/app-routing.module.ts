import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from './components/welcome.component';
import { LoginComponent } from './components/login.component';
import { AuthService } from './services/auth.service';
import { PlacesListComponent } from './components/places-list.component';
import { MapComponent } from './components/map.component';
import { PlacesFormComponent } from './components/places-form.component';
import { AutocompleteComponent } from './components/helpers/autocomplete.component';

const ROUTES: Routes = [
  { path: 'login', component: LoginComponent},
  { path: '', component: WelcomeComponent, canActivate: [AuthService]},
  { path: 'places/:user', component: PlacesListComponent}, //, canActivate: [AuthService]},
  { path: 'places/add/:user', component: PlacesFormComponent}, //, canActivate: [AuthService]},
  { path: 'map/:user', component: MapComponent},
  { path: 'auto', component: AutocompleteComponent},
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];
// Feature Component Routes will be under localhost:4200/bgg/*

@NgModule({
  imports: [RouterModule.forRoot(ROUTES, {
  scrollPositionRestoration: 'enabled',
  onSameUrlNavigation: 'reload',
  useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
