import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { AuthService } from './auth.service';
import { MapResponse } from '../models';

@Injectable()
export class TravelService {

  constructor(private router: Router, private authSvc: AuthService,
              private http: HttpClient) {

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
}