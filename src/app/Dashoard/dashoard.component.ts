import { Component } from '@angular/core';
import { WhatsnextService } from './whatsnext.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashoard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashoard.component.html',
})

export class DashoardComponent {
  WhatsnextDayList: string[];
  WhatsnextWorkoutsList: string[];

  indexArray: number[];

    constructor(service: WhatsnextService){
        this.WhatsnextDayList = service.getWhatsnextDay();
        this.WhatsnextWorkoutsList = service.getWhatsnextWorkout();

        const maxLength = Math.min(this.WhatsnextDayList.length, this.WhatsnextWorkoutsList.length);
        this.indexArray = Array.from({ length: maxLength }, (_, index) => index);
    }
}
