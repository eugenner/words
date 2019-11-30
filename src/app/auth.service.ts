import { Injectable, NgZone } from '@angular/core';
import { User } from './models/user';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { SettingsService } from './settings/settings.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData: firebase.User; // Save logged in user data
  idToken: string;

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    private settingsService: SettingsService,
    private http: HttpClient
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        console.log('authState.subscribe: ');

        this.settingsService.createUpdateUser().subscribe((data) => {
          if (data['userInfo'] === 'newUser') {
            console.log('run settings navigation');
            this.router.navigate(['settings']);
          } else {
            console.log('run home navigation');
            this.router.navigate(['home']);
          }
        });


      } else {
        localStorage.setItem('user', null);
        // JSON.parse(localStorage.getItem('user'));  // TODO why I need this line?
      }
    });

    // this.afAuth.idToken.subscribe((idToken) => {
    //   // console.log('idToken: ' + idToken);
    //   this.idToken = idToken;
    // });

    this.afAuth.auth.onIdTokenChanged(function (user) {
      if (user) {
        console.log('User is signed in or token was refreshed.');
      }
    });
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true : false;
  }

  // Sign in with Google
  googleAuth() {
    console.log('run GoogleAuth');
    return this.authLogin(new auth.GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  // * Authenticates a Firebase client using a popup-based OAuth authentication
  // * flow.
  // *
  // * If succeeds, returns the signed in user along with the provider's credential.
  authLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run(() => {
          this.setUserData(result);
        });
      }).catch((error) => {
        window.alert(error);
      });
  }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  setUserData(result: auth.UserCredential) {
    // console.log('got result: ' + JSON.stringify(result));
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${result.user.uid}`);

    // console.log('lastLoginAt: ' + result.user.lastLoginAt);
    // class OAuthCredential extends AuthCredential {



    localStorage.setItem('idToken', (<firebase.auth.OAuthCredential>result.credential).idToken);
    localStorage.setItem('accessToken', result.user.toJSON()['stsTokenManager'].accessToken);
    localStorage.setItem('refreshToken', result.user.refreshToken);


    // attention!: local constant userData != this.userData (class scope)
    const userData: User = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified
    };

    return userRef.set(userData, {
      merge: true
    });
  }

  // Sign out
  SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['login']);
    });
  }
  getIdToken() {
    return localStorage.getItem('idToken');
  }

  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  refreshToken() {
    const key = environment.firebase.apiKey;
    const url = `https://securetoken.googleapis.com/v1/token?key=${key}`;
    const refreshToken = this.getRefreshToken();
    return this.http.post<any>(url, `grant_type=refresh_token&refresh_token=${refreshToken}`,
      {headers: {'content-type': 'application/x-www-form-urlencoded'}}).pipe(

        /*
        result:
        {
          "access_token": string,
          "expires_in": string,
          "token_type": string,
          "refresh_token": string,
        }
        */

        tap((result) => {
            localStorage.setItem('accessToken', result['access_token']);
            console.log('set new accessToken value');
        })
      );
  }

}
