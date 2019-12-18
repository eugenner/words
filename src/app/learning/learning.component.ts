import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TrainingLoop } from '../models/TrainingLoop';

@Component({
  selector: 'app-learning',
  templateUrl: './learning.component.html',
  styleUrls: ['./learning.component.css']
})
export class LearningComponent implements OnInit {

  @Input()
  tl: TrainingLoop;


  @Output() changeValue = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  start() {
    this.changeValue.emit();
  }

}
