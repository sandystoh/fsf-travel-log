import {Injectable, ElementRef} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { AuthService } from './auth.service';
import { MapResponse, Country, Place, Journey, PlacesResponse, JourneyResponse, JourneysResponse } from '../models';
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

  getPlaceById(id) {
    return this.http.get<Place>('/api/place/' + id).toPromise();
  }

  createPlace(save: Place, fileRef: ElementRef) {
    const formData = new FormData();
    formData.set('placeImage', fileRef.nativeElement.files[0]);

    Object.keys(save).forEach(key => {
      formData.set(key, save[key])}
      );

    return this.http.post<any>('/api/places', formData).toPromise();
  }

  editPlace(editedPlace, fileRef: ElementRef) {
    const formData = new FormData();
    formData.set('placeImage', fileRef.nativeElement.files[0]);

    Object.keys(editedPlace).forEach(key => {
      formData.set(key, editedPlace[key])}
      );

    return this.http.post<any>('/api/places/update', formData).toPromise();
  }

  deletePlace(id) {
    return this.http.delete('/api/place/' + id).toPromise();
  }

  getPlaceTitles(username): Promise<String[]> {
    return this.http.get<string[]>('/api/places/titles/' + username).toPromise();
  }

  getCountryList(): Promise<Country[]> {
    return this.http.get<Country[]>('/api/countries').toPromise();
  }

  getJourneyList(username, type): Promise<Journey[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<Journey[]>('/api/journeys/list/' + username, {params}).toPromise();
  }

  getJourneys(username, limit, offset): Promise<JourneysResponse> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);
    return (
      this.http.get<JourneysResponse>('/api/journeys/'+ username, { params })
        .toPromise()
        .catch(error => {
          return (Promise.reject(error))
        })
    );
  }

  getJourneyById(id) {
    return this.http.get<JourneyResponse>('/api/journey/' + id).toPromise();
  }

  createJourney(save: Journey, fileRef: ElementRef) {
    const formData = new FormData();
    formData.set('journeyImage', fileRef.nativeElement.files[0]);

    Object.keys(save).forEach(key => {
      formData.set(key, save[key])}
      );

    return this.http.post<any>('/api/journeys', formData).toPromise();
  }

  editJourney(editedJourney, fileRef: ElementRef) {
    const formData = new FormData();
    formData.set('journeyImage', fileRef.nativeElement.files[0]);

    Object.keys(editedJourney).forEach(key => {
      formData.set(key, editedJourney[key])}
      );

    return this.http.post<any>('/api/journeys/update', formData).toPromise();
  }

  reorderJourneyPlaces(id, places: Place[]) {
    console.log(places);
    return this.http.post('/api/journey/reorder/'+ id, {places}).toPromise();
  }

  deleteJourney(id, removeChild) {
    const params = new HttpParams().set('remove_child', removeChild);
    return this.http.delete('/api/journey/' + id, {params}).toPromise();
  }
}
