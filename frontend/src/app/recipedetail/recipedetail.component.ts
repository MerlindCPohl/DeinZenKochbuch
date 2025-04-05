import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rezept-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipedetail.component.html',
  styleUrls: ['./recipedetail.component.css']
})
export class RezeptDetailComponent implements OnInit {
  @Input() rezeptId!: number;
  @Output() close = new EventEmitter<void>();

  rezept: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.rezeptId) {
      this.ladeRezept(this.rezeptId);
    }
  }

  ladeRezept(id: number): void {
    this.http.get<any[]>(`/api/rezepte/${id}`).subscribe(data => {
      if (data.length > 0) {
        const name = data[0].rezept;
        const zutaten = data.map(e => ({
          name: e.zutat,
          menge: e.menge,
          mengeneinheit: e.mengeneinheit || ''
        }));

        this.rezept = {
          name,
          zutaten,
          anleitung: data[0].anleitung || '',
          vegan: data[0].vegan,
          vegetarisch: data[0].vegetarisch,
          rohkost: data[0].rohkost,
          glutenfrei: data[0].glutenfrei
        };
      }
    });
  }
  schliessen(): void {
    this.close.emit();
  }
}
