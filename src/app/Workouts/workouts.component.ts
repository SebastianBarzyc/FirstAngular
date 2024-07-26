import { Component, ViewChild} from '@angular/core';
import { WorkoutsBackend } from "./workouts-backend.component";


@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  standalone: true,
  imports: [WorkoutsBackend]
})
export class WorkoutsComponent {
  @ViewChild(WorkoutsBackend) WorkoutsBackend!: WorkoutsBackend;
  isPanelExpanded = false;

  constructor() { }

  togglePanel() {
    if (this.WorkoutsBackend) {
      this.WorkoutsBackend.togglePanel();
    }
  }
}
