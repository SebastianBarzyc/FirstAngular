import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { WorkoutsBackend } from "./workouts-backend.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  standalone: true,
  imports: [WorkoutsBackend, FormsModule]
})
export class WorkoutsComponent implements OnInit, AfterViewInit {
  @ViewChild(WorkoutsBackend) workoutsBackend!: WorkoutsBackend;
  isPanelExpanded = false;
  searchQuery: string = '';

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadWorkouts();
  }

  loadWorkouts() {
    if (this.workoutsBackend) {
      this.workoutsBackend.loadWorkouts();
    }
  }

  togglePanel() {
    if (this.workoutsBackend) {
      this.workoutsBackend.togglePanel();
    }
  }

  onSearchChange() {
    if (this.workoutsBackend) {
      this.workoutsBackend.searchSubject.next(this.searchQuery);
    }
  }
}
