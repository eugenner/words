import { TrainingSet } from './TrainingSet';

// Training loop contains collection of Training sets (one word for learning per set)
export class TrainingLoop {
    trainingSets: TrainingSet[];

    constructor() {
      this.trainingSets = new Array<TrainingSet>();
    }
}
