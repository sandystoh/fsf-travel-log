import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { LoginResponse } from '../models';

@Injectable()
export class AuthService implements CanActivate {

  token: string = null;
  username: string = null;
  displayName: string = null;

  constructor(private router: Router, private http: HttpClient) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree| boolean {
    if (this.token)
      return (true)
    return (this.router.parseUrl('login'));
  }

  isAuthenticated() {
    return (!!this.token);
  }

  getUser() {
    return ({username: this.username, displayName: this.displayName, token: this.token});
  }

  authenticate(username: string, password: string): Promise<LoginResponse> {
    const urlencoded = new HttpParams()
      .set('username', username)
      .set('password', password)
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
    return (
      this.http.post('/api/authenticate', urlencoded.toString(), { headers })
        .toPromise()
        .then((result: LoginResponse) => {
          console.info('>> returned: ', result)
          this.token = result.access_token;
          this.username = result.username;
          this.displayName = result.display_name;
          return (result);
        })
        .catch(error => {
          this.token = null;
          return (error);
        })
    )
  }

  logout() {
    return new Promise((resolve, reject) => {
      // implement remove session here
      this.token = null;
      resolve();
    })
  }

}