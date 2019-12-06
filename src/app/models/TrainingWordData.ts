import { MemoryWord } from './MemoryWord';
import { CorrectAnswer } from './CorrectAnswer';
import { FakeAnswer } from './FakeAnswer';

export class TrainingWordData {
    memoryWord: MemoryWord;
    correctAnswer: CorrectAnswer;
    fakeAnswers: FakeAnswer[];
}
