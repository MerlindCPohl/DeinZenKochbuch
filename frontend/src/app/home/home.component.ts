import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule]
})

export class HomeComponent {


  constructor(private router: Router) {
  }


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
        ]
      }
    ]
  };

  public chartType: 'pie' = 'pie';

  public chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      intersect: true
    },
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

  chartClick(event: { event?: any, active?: any[] }): void {
    const nativeEvent = event.event?.native;
    const chart: Chart = event.event?.chart;

    if (!chart || !nativeEvent) return;

    const activeElements = chart.getElementsAtEventForMode(
      nativeEvent,
      'nearest', // oder 'index' auch möglich
      {intersect: true},
      false
    );
    if (activeElements.length > 0) {
      const firstElement = activeElements[0];
      const index = firstElement.index;

      console.log('Index erkannt:', index); // Test
      this.router.navigate(['/months'], {queryParams: {monat: index}});
    }
  }

}
