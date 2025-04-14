import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertComponent } from '../alert/alert.component';
import { AlertService } from '../services/alertservice';
import { Sonderzeichenservice } from '../services/sonderzeichenservice';

@Component({
  selector: 'app-months',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent],
  templateUrl: './months.component.html',
  styleUrl: './months.component.css'
})
export class MonthsComponent implements OnInit {
  monatIndex: number = 0;
  monatName: string = '';
  suchbegriff: string = '';
  vorschlaege: any[] = [];
  rezepte: any[] = [];
  paginierteRezepte: any[] = [];
  seite: number = 1;
  seitenGroesse: number = 9;

  rezept: any = null;
  ausgewaehlt: number | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    public sonderzeichenservice: Sonderzeichenservice,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const index = parseInt(params['monat'], 10);
      if (!isNaN(index)) {
        this.monatIndex = index;
        this.monatName = this.monatsname(index);
        this.rezepteLaden();
      }
    });
  }

  monatsname(index: number): string {
    const namen = ['Januar ❄️', 'Februar 🌱', 'März 🌿', 'April 🌷', 'Mai 🌳', 'Juni 🍓', 'Juli 🌻', 'August 🌾', 'September 🌰', 'Oktober 🍂', 'November 🍄‍', 'Dezember 🕯️'];
    return namen[index] || '';
  }

  rezepteLaden(): void {
    this.http.get<any[]>(`/api/rezepte-saison/${this.monatIndex}`).subscribe(data => {
      this.rezepte = data;
      this.setPaginierteRezepte();
    });
  }

  setPaginierteRezepte(): void {
    const start = (this.seite - 1) * this.seitenGroesse;
    const ende = start + this.seitenGroesse;
    this.paginierteRezepte = this.rezepte.slice(start, ende);
  }

  vorherigeSeite(): void {
    if (this.seite > 1) {
      this.seite--;
      this.setPaginierteRezepte();
    }
  }

  naechsteSeite(): void {
    if (this.seite * this.seitenGroesse < this.rezepte.length) {
      this.seite++;
      this.setPaginierteRezepte();
    }
  }

  eingabeLeeren(): void {
    this.suchbegriff = '';
    this.vorschlaege = [];
    this.rezepteLaden();
  }

  sucheVorschlaege(): void {
    if (this.suchbegriff.length < 2) {
      this.vorschlaege = [];
      return;
    }

    this.http.get<any[]>(`/api/suchvorschlaege?begriff=${encodeURIComponent(this.suchbegriff)}`).subscribe(data => {
      this.vorschlaege = data;
    });
  }

  vorschlagAuswaehlen(v: any): void {
    const original = v.begriff;
    this.suchbegriff = original;
    this.vorschlaege = [];

    if (v.typ === 'rezeptname') {
      const rezept = this.rezepte.find(r =>
        this.sonderzeichenservice
          .uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(r.name)
          .toLowerCase()
          .includes(original.toLowerCase())
      );

      if (rezept) {
        this.zeigeDetails(rezept.id);
      } else {
        this.alertService.zeigeAlert('Kein passendes Rezept gefunden');
        this.rezepteLaden();
      }
    } else {
      this.http.get<any[]>(`/api/rezepte/suche?begriff=${encodeURIComponent(original)}`).subscribe(data => {
        if (data.length === 0) {
          this.alertService.zeigeAlert('Keine passenden Rezepte gefunden');
          this.rezepteLaden();
        } else {
          this.rezepte = data;
          this.setPaginierteRezepte();
          this.seite = 1;
        }
      });
    }
  }

  zeigeDetails(id: number): void {
    this.http.get<any>(`/api/rezeptdetail/${id}`).subscribe(data => {
      this.rezept = {
        ...data,
        zutaten: data.zutaten.map((z: any) => ({
          ...z,
          name: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(z.name),
          mengeneinheit: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(z.mengeneinheit)
        }))
      };
      this.ausgewaehlt = id;
    });
  }

  schliessen(): void {
    this.ausgewaehlt = null;
    this.rezept = null;
  }
}

