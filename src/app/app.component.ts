import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoursesComponent } from './courses.component';
import { MatBadgeModule } from '@angular/material/badge';
import { NavComponent } from './Nav/nav.component';
import { NavBtnComponent } from './Nav/nav-btn.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CoursesComponent, MatBadgeModule , NavComponent, NavBtnComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'FirstProject';
}
