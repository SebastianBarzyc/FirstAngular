import { CommonModule } from '@angular/common';
import { Component, Input} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { ExerciseService } from '../Exercises/exercises.service';
@Component({
  selector: 'calendar-item',
  templateUrl: './calendar-item.component.html',
  standalone: true,
  imports: [
    MatIcon,
    MatLabel,
    MatFormField,
    MatSelect,
    MatInput,
    MatOption,
    FormsModule,
    CommonModule,
    MatButtonModule
  ],
})
export class CalendarItemComponent {
  constructor(
    private exerciseService: ExerciseService,
  ) {}

  @Input() exercises: any[] = [];
  @Input() index: number = 0;
  @Input() exercisesList: any[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadExercises();
  }

  removeExercise(index: number): void {
    //this.plan.exercises.splice(index, 1);
  }

  inputOnChange(){

  }

  loadExercises(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.exerciseService.getData()
        .subscribe({
          next: (data) => {
            this.exercises = data;
            resolve(); 
          },
          error: (error) => {
            console.error('Error loading exercises3:', error);
            reject(error);
          }
        });
    });
  }
}

