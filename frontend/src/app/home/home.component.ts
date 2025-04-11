import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule]
})
export class HomeComponent {

  public chartLabels: string[] = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  public chartData: ChartData<'pie', number[], string> = {
    labels: this.chartLabels,
    datasets: [
      {
        data: Array(12).fill(1),
        backgroundColor: [
          '#e57373', '#64b5f6', '#ffd54f', '#b0bec5', '#81c784', '#f8bbd0',
          '#ffcc80', '#f06292', '#4db6ac', '#ffb74d', '#bcaaa4', '#90a4ae'
        ],
       // borderColor: '',
        //borderWidth: 2
      }
    ]
  };

  public chartType: 'pie' = 'pie';


  public chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false, // wichtig!
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: context => {
            return this.chartLabels[context.dataIndex];
          }
        }
      }
    }
  };
}
