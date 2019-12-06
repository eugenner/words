import { TrainingWordData } from './TrainingWordData';

// Training loop contains collection of Training sets (one word for learning per set)
export class TrainingLoop {
    trainingSets: TrainingWordData[];

    constructor() {
      this.trainingSets = new Array<TrainingWordData>();
    }
}
