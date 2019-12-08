import {Injectable, ElementRef} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { AuthService } from './auth.service';
import { MapResponse, Country, Place } from '../models';
import { NgForm } from '@angular/forms';

@Injectable()
export class TravelService {

  constructor(private router: Router, private authSvc: AuthService,
              private http: HttpClient) {

  }

  getMap(username): Promise<MapResponse> {
    const token = this.authSvc.getUser().token;
    console.log(">>> token", token)
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
    return (
      this.http.get<MapResponse>('/api/places/map/'+ username, { headers })
        .toPromise()
        .catch(error => {
          return (Promise.reject(error))
        })
    );
  }

  getPlaces(username): Promise<string[]> {
    const token = this.authSvc.getUser().token;
    console.log(">>> token", token)
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
    return (
      this.http.get<string[]>('/api/places/'+ username, { headers })
        .toPromise()
        .catch(error => {
          return (Promise.reject(error))
        })
    );
  }
  
  getCountryList(): Promise<Country[]> {
    return this.http.get<Country[]>('/api/countries').toPromise();
  }

  createPlace(save: Place, fileRef: ElementRef) {
    const formData = new FormData();
    console.log('file in svc', fileRef.nativeElement.files[0])
    formData.set('placeImage', fileRef.nativeElement.files[0]);

    Object.keys(save).forEach(key => {
      console.log(key, save[key])
      formData.set(key, save[key])}
      );

    return this.http.post<any>('/api/places', formData).toPromise();
  }
}