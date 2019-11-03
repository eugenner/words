import { Injectable, NgZone } from '@angular/core';
import { User } from './models/user';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { SettingsService } from './settings/settings.service';

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
    private settingsService: SettingsService
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));

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
        JSON.parse(localStorage.getItem('user'));  // TODO why I need this line?
      }
    });

    // this.afAuth.idToken.subscribe((idToken) => {
    //   // console.log('idToken: ' + idToken);
    //   this.idToken = idToken;
    // });
  }

  /*
  // Sign in with email/password
  SignIn(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        });
        this.SetUserData(result.user);
      }).catch((error) => {
        window.alert(error.message);
      });
  }

  // Sign up with email/password
  SignUp(email, password) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        // Call the SendVerificaitonMail() function when new user sign up and returns promise 
        this.SendVerificationMail();
        this.SetUserData(result.user);
      }).catch((error) => {
        window.alert(error.message)
      });
  }

  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.auth.currentUser.sendEmailVerification()
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }

  // Reset Forggot password
  ForgotPassword(passwordResetEmail) {
    return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      }).catch((error) => {
        window.alert(error);
      });
  }
*/

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
          this.SetUserData(result);
        });
      }).catch((error) => {
        window.alert(error);
      });
  }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(result) {
    // console.log('got result: ' + JSON.stringify(result));
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${result.user.uid}`);

    // console.log('lastLoginAt: ' + result.user.lastLoginAt);

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

}
