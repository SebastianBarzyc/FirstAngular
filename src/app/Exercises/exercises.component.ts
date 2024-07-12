import { CommonModule } from '@angular/common';
import {Component} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [MatExpansionModule],
  templateUrl: './exercises.component.html',
})
export class ExercisesComponent {
  isPanelExpanded = false;

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
  }
}
 