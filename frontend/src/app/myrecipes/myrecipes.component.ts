import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Sonderzeichenservice } from '../services/sonderzeichenservice';

@Component({
  selector: 'app-myrecipes',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './myrecipes.component.html',
  styleUrl: './myrecipes.component.css'
})
export class MyrecipesComponent implements OnInit {
  meineRezepte: any[] = [];
  ausgewaehltZumLoeschen: any = null;
  ausgewaehltFuerModal: number | null = null;
  rezept: any = null;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private sonderzeichenservice: Sonderzeichenservice) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.http.get<any[]>(`/api/rezepteuser/${userId}`).subscribe(daten => {
      this.meineRezepte = daten;
    });
  }

  bestaetigeLoeschen(rezept: any) {
    this.ausgewaehltZumLoeschen = rezept;
  }

  loescheRezept(): void {
    if (!this.ausgewaehltZumLoeschen) return;

    const id = this.ausgewaehltZumLoeschen.id;

    this.http.delete(`/api/rezepte/${id}`).subscribe(() => {
      this.meineRezepte = this.meineRezepte.filter(r => r.id !== id);
      this.ausgewaehltZumLoeschen = null;
    });
  }

  bearbeiten(id: number): void {
    this.router.navigate(['/newrecipe'], { queryParams: { id } });
  }

  zeigeDetails(id: number) {
    if (this.ausgewaehltZumLoeschen) return;

    this.http.get<any>(`/api/rezeptdetail/${id}`).subscribe(data => {
      this.rezept = {
        ...data,
        zutaten: data.zutaten.map((z: any) => ({
          ...z,
          name: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(z.name),
          mengeneinheit: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(z.mengeneinheit)
        }))
      };
      this.ausgewaehltFuerModal = id;
    });
  }

  schliessen() {
    this.ausgewaehltFuerModal = null;
  }


}
