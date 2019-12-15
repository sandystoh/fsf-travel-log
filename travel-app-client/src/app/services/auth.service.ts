import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { LoginResponse } from '../models';

@Injectable()
export class AuthService implements CanActivate {

  token: string = null;
  username: string = null;
  displayName: string = null;
  authenticated = false;

  constructor(private router: Router, private http: HttpClient) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree| boolean {
    this.token = localStorage.getItem('travel-token');
    if (this.token)
      return (true)
    return (this.router.parseUrl('login'));
  }

  isAuthenticated() {
      return (!!localStorage.getItem('travel-token'));
  }

  getUser() {
    this.token = localStorage.getItem('travel-token');
    this.username = localStorage.getItem('travel-username');
    this.displayName = localStorage.getItem('travel-name');
    if(this.token) return ({username: this.username, displayName: this.displayName, token: this.token});
    else return null;
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
          // console.info('>> returned: ', result)
          this.token = result.access_token;
          localStorage.setItem('travel-token', this.token);
          localStorage.setItem('travel-username', result.username);
          localStorage.setItem('travel-name', result.display_name);
          this.authenticated = this.isAuthenticated();

          return this.authenticated;
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
      localStorage.clear();
      this.authenticated = this.isAuthenticated();
      if (!this.authenticated) {
        this.router.navigate(['/login']);
      }
      resolve();
    })
  }

}