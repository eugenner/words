import { Component, OnInit } from '@angular/core';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  wpLoop = 0;
  fAnswers = 0;
  fStartPosition = 0;
  fLangCouple = null;
  langCouples = ['ru-en', 'en-ru', 'it-ru', 'ru-it'];
  sTranslation = false;
  btnSaveDisabled = true;

  constructor(private settingsSevice: SettingsService) { }

  get fakeAnswers(): any {
    return this.fAnswers;
  }

  set fakeAnswers(value) {
    this.fAnswers = value;
  }

  get favoriteLangCouple(): any {
    return this.fLangCouple;
  }

  set favoriteLangCouple(value) {
    this.fLangCouple = value;
  }

  get wordsPerLoop(): any {
    return this.wpLoop;
  }

  set wordsPerLoop(value) {
    this.wpLoop = value;
  }

  get freqStartPosition(): any {
    return this.fStartPosition;
  }

  set freqStartPosition(value) {
    this.fStartPosition = value;
  }

  get showTranslation(): any {
    return this.sTranslation;
  }

  set showTranslation(value) {
    this.sTranslation = value;
  }


  save() {
    this.btnSaveDisabled = true;
    this.updateUserPreferences();
  }

  ngOnInit() {
    this.settingsSevice.getUserPreferences().subscribe((data) => {
      console.log('getUserPreferences: ' + JSON.stringify(data));

      if (data != null && typeof(data) === 'object' && Object.keys(data).length > 0) {
        this.wordsPerLoop = data['wordsPerLoop'];
        this.fLangCouple = data['langPair'];
        this.fAnswers = data['fakeAnswers'];
        this.fStartPosition = data['freqStartPosition'];
        this.sTranslation = data['showTranslation'];
      }
      this.btnSaveDisabled = false;
    });

  }

  updateUserPreferences() {
    const data = { wordsPerLoop: this.wpLoop,
      langPair: this.fLangCouple, fakeAnswers: this.fAnswers,
      freqStartPosition: this.fStartPosition, showTranslation: this.sTranslation };
    this.settingsSevice.updateUserPreferences(data).subscribe((userPreferences) => {
      const up = JSON.parse(userPreferences);
      // TODO update values from response?
      setTimeout(() => {
        this.fLangCouple = up.langPair;
        this.wpLoop = up.wordsPerLoop;
        this.fAnswers = up.fakeAnswers;
        this.fStartPosition = up.freqStartPosition;
        this.sTranslation = up.showTranslation;
        this.btnSaveDisabled = false;
      }, 1000);
    });
  }

}
