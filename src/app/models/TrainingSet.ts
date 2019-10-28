import { MemoryWord } from './MemoryWord';
import { CorrectAnswer } from './CorrectAnswer';
import { FakeAnswer } from './FakeAnswer';

export class TrainingSet {
    memoryWord: MemoryWord;
    correctAnswer: CorrectAnswer;
    fakeAnswers: FakeAnswer[];
}
