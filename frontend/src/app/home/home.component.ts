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
  public chartData: ChartData<'pie', number[], string> = {
    labels: [
      'Januar ❄️  ', 'Februar 🌱  ', 'März 🌿  ', 'April 🌷  ', 'Mai 🌳  ', 'Juni 🍓  ',
      'Juli 🌻  ', 'August 🌾  ', 'September 🌰  ', 'Oktober 🍂  ', 'November 🍄‍  ', 'Dezember 🕯️  '
    ],
    datasets: [
      {
        data: Array(12).fill(1),
        backgroundColor: [
          '#efdcc3', '#e9d0af', '#e4c49b', '#deb887', '#e4b981', '#eccf8a',
          '#e3cea1', '#d2b793', '#D2B48C' , '#c1b4a4', '#bcaaa4', '#bbb4aa'
        ],
        hoverOffset: 30, // sanft rauszoomen
        hoverBackgroundColor: [
          '#B8A179'
        ],
        borderColor: '#F5DEB3',
        borderWidth: 1
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
        backgroundColor: '#006D57 ',
        titleColor: '#f1f3f5',
        titleFont: { size: 12, weight: 'bold' },
        bodyColor:  '#f1f3f5',
        bodyFont: { size: 16 },
        padding: 10,
        cornerRadius: 15,
        callbacks: {
          // titel entfernen
          title: () => [],
          // Keine zusätzlichen Labels
          label: () => '',
          // nut monatsnamen
          beforeLabel: (context) => context.label || ''
        }
      },
      title: {
        display: false
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
