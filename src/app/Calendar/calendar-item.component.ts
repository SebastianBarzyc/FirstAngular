import { CommonModule } from '@angular/common';
import { Component, Input} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
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
  @Input() exercisesdata: any[] = [];
  @Input() index: number = 0;
  @Input() exercisesList: any[] = [];

  removeExercise(index: number): void {
    //this.plan.exercises.splice(index, 1);
  }

  inputOnChange(){

  }
}

