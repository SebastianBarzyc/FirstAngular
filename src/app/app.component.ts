import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './Nav/nav.component';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from "@vercel/analytics";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, NavComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  ngOnInit(): void {
    injectSpeedInsights({ debug: false });
    inject({ debug: false });
  }
}