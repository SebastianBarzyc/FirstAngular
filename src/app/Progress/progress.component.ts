import { Component, OnInit } from '@angular/core';
import { NgxChartsModule, TooltipModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // For native date adapter
import { MatInputModule } from '@angular/material/input'; // Import MatInputModule
import { supabase, getUser } from '../supabase-client';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { Router } from '@angular/router';

// Define interfaces outside the component
interface ChartDetails {
  [key: string]: number[]; // e.g., "reps10": [100, 110, 120]
}

interface ChartSeries {
  name: string;
  value: number;
  details: ChartDetails;
}

interface ChartData {
  name: string;
  series: ChartSeries[];
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [
    NgxChartsModule,
    TooltipModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  templateUrl: './progress.component.html',
})
export class ProgressComponent implements OnInit {
  chartData: ChartData[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(
    private router: Router
  ) {}

  async ngOnInit() {
    const userId = await getUser();
    await this.fetchChartData(userId);
    if (getUser() === null) {
      console.error('User ID is null, cannot add exercise.');
      this.router.navigate(['/Profile']);
    }
  }

  get filteredChartData(): ChartData[] {
    if (!this.startDate && !this.endDate) {
      return this.chartData;
    }

    const start = this.startDate ? this.startDate.getTime() : 0;
    const end = this.endDate ? this.endDate.getTime() : Infinity;

    return this.chartData.map((exercise) => ({
      ...exercise,
      series: exercise.series.filter((entry) => {
        const entryDate = new Date(this.parseDate(entry.name)).getTime();
        return entryDate >= start && entryDate <= end;
      }),
    }));
  }

  async fetchChartData(userId: string) {
    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('session_id, date')
        .eq('user_id', userId);

      if (sessionsError) throw sessionsError;

      const { data: sessionExercises, error: exercisesError } = await supabase
        .from('session_exercises')
        .select('session_id, exercise_title, reps, weight')
        .in(
          'session_id',
          sessions.map((session) => session.session_id)
        );

      if (exercisesError) throw exercisesError;

      const chartDataMap: { [key: string]: any } = {};

      sessions.forEach((session) => {
        const sessionExercisesForSession = sessionExercises.filter(
          (exercise) => exercise.session_id === session.session_id
        );

        sessionExercisesForSession.forEach((exercise) => {
          if (!exercise.exercise_title || !session.date) {
            console.warn('Skipping invalid data:', exercise, session);
            return;
          }

          if (!chartDataMap[exercise.exercise_title]) {
            chartDataMap[exercise.exercise_title] = {
              name: exercise.exercise_title,
              series: [],
            };
          }

          let dateEntry = chartDataMap[exercise.exercise_title].series.find(
            (entry: any) => entry.name === session.date
          );

          if (!dateEntry) {
            dateEntry = {
              name: session.date,
              value: 0,
              sets: {},
            };
            chartDataMap[exercise.exercise_title].series.push(dateEntry);
          }

          dateEntry.value = Math.max(dateEntry.value, exercise.weight);

          if (!dateEntry.sets[`${exercise.reps}`]) {
            dateEntry.sets[`${exercise.reps}`] = exercise.weight;
          }
        });
      });

      Object.values(chartDataMap).forEach((exercise: any) => {
        console.log('Before sorting:', exercise.series.map((entry: any) => entry.name));
        exercise.series.sort((a: any, b: any) => {
          const dateA = this.parseDate(a.name);
          const dateB = this.parseDate(b.name);
          return dateA - dateB;
        });
        console.log('After sorting:', exercise.series.map((entry: any) => entry.name));
      });

      this.chartData = Object.values(chartDataMap);
      console.log('Chart Data:', this.chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  }

  parseDate(dateString: string): number {
    const parts = dateString.split('.');
    if (parts.length === 3) {
      const formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      const date = new Date(formattedDate).getTime();
      if (isNaN(date)) {
        console.warn('Invalid date:', dateString);
        return 0;
      }
      return date;
    }
    const parsedDate = new Date(dateString).getTime();
    const date = new Date(dateString.trim()).getTime();
    if (isNaN(date)) {
      console.warn('Invalid date:', dateString);
      return 0;
    }
    return date;
  }
}

