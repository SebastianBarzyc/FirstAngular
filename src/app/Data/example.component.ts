import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class ExampleComponent implements OnInit {
  data: any;
  title: string = '';
  description: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getData().subscribe(response => {
      this.data = response;
    });
  }

  onSubmit() {
    this.dataService.submitData(this.title, this.description).subscribe(response => {
      console.log('Data submitted:', response);
    });
  }
}
