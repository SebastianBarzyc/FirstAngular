import { Component } from '@angular/core';
import { ExampleComponent } from '../Data/example.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [ExampleComponent],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent {

}
