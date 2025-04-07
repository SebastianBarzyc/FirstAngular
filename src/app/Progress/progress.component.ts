import { Component, OnInit } from '@angular/core';
import { NgxChartsModule, TooltipModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // For native date adapter
import { MatInputModule } from '@angular/material/input'; // Import MatInputModule
import { supabase, getUser } from '../supabase-client';
import { MatFormField, MatLabel } from '@angular/material/form-field';

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
    MatFormField,
    MatLabel,
    MatNativeDateModule, // Add Material Datepicker modules
    MatInputModule, // Add MatInputModule here
  ],
  templateUrl: './progress.component.html',
})
export class ProgressComponent implements OnInit {
  chartData: ChartData[] = [];
  startDate: Date | null = null; // Use Date object for Material Datepicker
  endDate: Date | null = null;

  async ngOnInit() {
    await this.fetchChartData();
  }

  get filteredChartData(): ChartData[] {
    // Filter chart data based on the selected date range
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

  async fetchChartData() {
    try {
      // Fetch sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('session_id, date');

      if (sessionsError) throw sessionsError;

      // Fetch session_exercises
      const { data: sessionExercises, error: exercisesError } = await supabase
        .from('session_exercises')
        .select('session_id, exercise_title, reps, weight');

      if (exercisesError) throw exercisesError;

      // Debug logs
      console.log('Sessions:', sessions);
      console.log('Session Exercises:', sessionExercises);

      // Map data to chart format
      const chartDataMap: { [key: string]: any } = {};

      sessions.forEach((session) => {
        const sessionExercisesForSession = sessionExercises.filter(
          (exercise) => exercise.session_id === session.session_id
        );

        sessionExercisesForSession.forEach((exercise) => {
          // Skip if exercise_title or session.date is null
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

          // Find or create the entry for this date
          let dateEntry = chartDataMap[exercise.exercise_title].series.find(
            (entry: any) => entry.name === session.date
          );

          if (!dateEntry) {
            dateEntry = {
              name: session.date,
              value: 0, // Will be updated to the max weight
              sets: {}, // Will store aggregated reps and sets
            };
            chartDataMap[exercise.exercise_title].series.push(dateEntry);
          }

          // Update the max weight for the day
          dateEntry.value = Math.max(dateEntry.value, exercise.weight);

          // Aggregate reps and sets
          if (!dateEntry.sets[`${exercise.reps}`]) {
            dateEntry.sets[`${exercise.reps}`] = exercise.weight;
          }
        });
      });

      // Sort the series array by date for each exercise
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
    // Handle different date formats (e.g., DD.MM.YYYY)
    const parts = dateString.split('.');
    if (parts.length === 3) {
      // Convert DD.MM.YYYY to YYYY-MM-DD
      const formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      const date = new Date(formattedDate).getTime();
      if (isNaN(date)) {
        console.warn('Invalid date:', dateString);
        return 0;
      }
      return date;
    }
    // Fallback to default parsing
    const parsedDate = new Date(dateString).getTime();
    const date = new Date(dateString.trim()).getTime();
    if (isNaN(date)) {
      console.warn('Invalid date:', dateString);
      return 0;
    }
    return date;
  }
}

