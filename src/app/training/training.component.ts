import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { TrainingLoop } from '../models/TrainingLoop';
import { Word } from '../models/Word';
import { TrainingService } from './training.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
  query,
  // ...
} from '@angular/animations';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css'],
  animations: [
    trigger('shake', [
      state('start', style({})),
      state('stop', style({})),
      transition('stop => start', [

        animate('0.7s', keyframes([
          style({ transform: 'translate3d(0, 0, 0)', offset: 0 }),
          style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.1 }),
          style({ transform: 'translate3d(10px, 0, 0)', offset: 0.2 }),
          style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.3 }),
          style({ transform: 'translate3d(10px, 0, 0)', offset: 0.4 }),
          style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.5 }),
          style({ transform: 'translate3d(10px, 0, 0)', offset: 0.6 }),
          style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.7 }),
          style({ transform: 'translate3d(10px, 0, 0)', offset: 0.8 }),
          style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.9 }),
          style({ transform: 'translate3d(0, 0, 0)', offset: 1 }),
        ]))

      ]),
    ]),
    trigger('applaud', [
      state('start', style({ backgroundColor: 'green', opacity: 0 })),
      state('stop', style({})),
      transition('stop => start', [
        animate('1s')
      ]),
      transition('start => stop', [
        animate('0.1s')
      ])
    ]),
    trigger('hideTable', [
      state('start', style({ opacity: 0 })),
      state('stop', style({ opacity: 1 })),
      transition('stop => start', [
        animate('0.8s')
      ])
    ]),
  ],
})
export class TrainingComponent implements OnInit {
  indexOfLeariningWord = -1;
  trainingLoop: TrainingLoop;
  currentMemoryWord: Word;
  currentAnswerWord: Word;
  screenAnswers = [];
  progress: Number;
  tlMaxCount = 0;

  answerApplaud = 'stop';
  showStatistics = false;
  statIndex: number;

  hideLearning = 'stop';

  showTranslation = false;
  showTraining = false;

  constructor(private trainingService: TrainingService, private router: Router, private ngZone: NgZone) {

  }

  ngOnInit() {
    this.nextTrainingLoop();
    this.progress = 0;
  }

  // end of learning table animation
  hideTableEnd(event: any) {
    console.log('hideTableEnd: ' + JSON.stringify(event));
    if (event['toState'] === 'start' && event['fromState'] === 'stop') {
      this.showTranslation = false;
      this.showTraining = true;
      this.hideLearning = 'stop';
    }

  }

  // show animation on the right answer
  onTranslateClick(word: any): void {
    if (word.link_id === this.currentAnswerWord.link_id) {
      word.applaud = 'start';
      this.answerApplaud = 'start';
      setTimeout(() => this.onTranslate(word), 1000);
    } else {
      word.state = 'start';
      setTimeout(() => this.onTranslate(word), 1000);
    }

  }

  onTranslate(word: Word): void {
    this.answerApplaud = 'stop';
    let isAnswerRight = false;
    let cnt = -1;
    // right answer is
    if (word.link_id === this.currentAnswerWord.link_id) {
      cnt = 1;
      isAnswerRight = true;
    }
    console.log('cnt: ' + cnt);
    this.trainingService.updateUserProgress(this.currentMemoryWord, cnt).subscribe((userProgress) => {
      console.log('userProgress: ' + JSON.stringify(userProgress));
      // user "answer" logic
      console.log('is answer right? ' + isAnswerRight);
      if (isAnswerRight) {
        if (userProgress.cnt_error < userProgress.cnt_success) {
          if (this.trainingLoop.trainingSets.length > 0) {
            this.trainingLoop.trainingSets.splice(this.indexOfLeariningWord, 1);
            this.indexOfLeariningWord--;
          }
        }
        this.nextWord();
      } else {
        this.nextWord();
      }

      if (this.trainingLoop.trainingSets.length === 0) {
        // TODO Training Loop is ended, update User Progress, show Statistics
        // TODO show button for continue
        this.showStatistics = true;
        this.trainingService.updateUserProgressByTL(this.trainingLoop).subscribe(
          (result) => {
            console.log('statistics: ' + JSON.stringify(result));
            this.statIndex = result.statistics.statIndex;
          }
        );
      }

    });
  }

  onContinueClick() {
    this.showStatistics = false;
    this.nextTrainingLoop();
  }

  setAnswers(aWord: Word) {
    this.screenAnswers = [];
    this.trainingService.getFakeAnswers(aWord.id, aWord.lang).subscribe(
      (words) => {
        words.push(aWord);
        // this.screenAnswers = this.shuffle(words);

        this.shuffle(words).forEach((word, i) => {
          word.index = i;
          word.state = 'stop';
          word.applaud = 'stop';
          this.screenAnswers.push(word);
        });
      }
    );

  }

  nextTrainingLoop() {
    this.indexOfLeariningWord = -1;
    this.progress = 0;
    this.showTraining = false;
    this.showTranslation = false;
    this.trainingService.getTrainingLoop().subscribe(
      (el) => {
        this.trainingLoop = el;
        if (this.trainingLoop.showTranslation) {
          this.showTraining = false;
          this.showTranslation = true;
        } else {
          this.showTraining = true;
          this.showTranslation = false;
        }

        console.log('showTranslation: ' + this.showTranslation);
        console.log('showTraining: ' + this.showTraining);

        this.tlMaxCount = this.trainingLoop.trainingSets.length;
        this.nextWord();
      },
      (err) => console.log('err: ' + err)
    );

  }

  nextWord() {
    console.log('l: ' + this.trainingLoop.trainingSets.length);
    if (this.trainingLoop.trainingSets.length === 0) {
      this.progress = 100;
      return;
    }
    this.progress = 100 - 100 * this.trainingLoop.trainingSets.length / this.tlMaxCount;

    this.indexOfLeariningWord++;
    if (this.trainingLoop.trainingSets.length <= this.indexOfLeariningWord) {
      this.indexOfLeariningWord = 0;
    }
    this.currentMemoryWord = this.trainingLoop.trainingSets[this.indexOfLeariningWord].memoryWord;
    this.currentAnswerWord = this.trainingLoop.trainingSets[this.indexOfLeariningWord].correctAnswer;
    this.setAnswers(this.currentAnswerWord);
  }

  shuffle(a: Array<any>) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
