import {Injectable, ElementRef} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { AuthService } from './auth.service';
import { MapResponse, Country, Place, Journey, PlacesResponse } from '../models';
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

  getPlaces(username, limit, offset): Promise<PlacesResponse> {
    const token = this.authSvc.getUser().token;
    console.log(">>> token", token)
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);
    return (
      this.http.get<PlacesResponse>('/api/places/'+ username, { headers, params })
        .toPromise()
        .catch(error => {
          return (Promise.reject(error))
        })
    );
  }

  searchPlaces(username, q, limit, offset) {
    const token = this.authSvc.getUser().token;
    console.log(">>> token", token)
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('q', q)
      .set('limit', limit)
      .set('offset', offset);
    return (
      this.http.get<PlacesResponse>('/api/places/search/'+ username, { headers, params })
        .toPromise()
        .catch(error => {
          return (Promise.reject(error))
        })
    );
  }

  getPlaceTitles(username): Promise<String[]> {
    return this.http.get<String[]>('/api/places/titles/'+username).toPromise();
  } 
  
  getCountryList(): Promise<Country[]> {
    return this.http.get<Country[]>('/api/countries').toPromise();
  }

  getJourneyList(username, type): Promise<Journey[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<Journey[]>('/api/journeys/list/' + username, {params}).toPromise();
  }

  createPlace(save: Place, fileRef: ElementRef) {
    const formData = new FormData();
    formData.set('placeImage', fileRef.nativeElement.files[0]);

    Object.keys(save).forEach(key => {
      formData.set(key, save[key])}
      );

    return this.http.post<any>('/api/places', formData).toPromise();
  }

  createJourney(save: Journey, fileRef: ElementRef) {
    const formData = new FormData();
    formData.set('journeyImage', fileRef.nativeElement.files[0]);

    Object.keys(save).forEach(key => {
      formData.set(key, save[key])}
      );

    return this.http.post<any>('/api/journeys', formData).toPromise();
  }
}