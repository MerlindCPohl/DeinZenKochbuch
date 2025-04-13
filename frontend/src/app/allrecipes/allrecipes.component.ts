import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {CommonModule} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {Sonderzeichenservice} from '../services/sonderzeichenservice';
import { AlertService } from '../services/alertservice';
import {AlertComponent} from '../alert/alert.component';


@Component({
  selector: 'app-allrecipes',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, AlertComponent],
  templateUrl: './allrecipes.component.html'
})

export class AllrecipesComponent {
  allRecipes: any[] = [];
  ausgewaehlt: number | null = null;
  rezept: any = null;
  seite = 1;
  seitenGroesse = 10;
  gefilterteRezepte: any[] = [];
  suchbegriff: string = '';
  vorschlaege: { begriff: string, typ: string }[] = [];


  constructor(
    private http: HttpClient,
    private sonderzeichenservice: Sonderzeichenservice,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/rezepte').subscribe(data => {
      this.allRecipes = data;
    });
  }

  zeigeDetails(id: number): void {
    if (this.ausgewaehlt) return;
    this.ausgewaehlt = id;

    this.http.get(`/api/rezeptdetail/${id}`).subscribe((data: any) => {
      data.name = this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(data.name);
      data.anleitung = this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(data.anleitung);

      data.zutaten = data.zutaten.map((zutat: any) => ({
        ...zutat,
        name: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(zutat.name),
        mengeneinheit: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(zutat.mengeneinheit)
      }));

      this.rezept = data;
    });
  }

  schliessen(): void {
    this.ausgewaehlt = null;
    this.rezept = null;
  }

  get paginierteRezepte() {
    const rezepte = this.gefilterteRezepte.length > 0 ? this.gefilterteRezepte : this.allRecipes;
    const start = (this.seite - 1) * this.seitenGroesse;
    return rezepte.slice(start, start + this.seitenGroesse);
  }

  vorherigeSeite() {
    if (this.seite > 1) this.seite--;
  }

  naechsteSeite() {
    if (this.seite * this.seitenGroesse < this.allRecipes.length) this.seite++;
  }

  sucheVorschlaege() {
    if (this.suchbegriff.length < 3) {
      this.vorschlaege = [];
      return;
    }

    const normalisiert = this.sonderzeichenservice.ersetzeUmlauteUndSonderzeichenFuerSpeichernInDB(this.suchbegriff);

    this.http.get<{ begriff: string, typ: string }[]>(`/api/suchvorschlaege?query=${normalisiert}`)
      .subscribe(data => {
        this.vorschlaege = data.map(v => ({
          ...v,
          begriff: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(v.begriff)
        }));
      });
  }


  vorschlagAuswaehlen(vorschlag: { begriff: string, typ: string }) {
    const original = vorschlag.begriff;
    this.suchbegriff = original;
    this.vorschlaege = [];

    if (vorschlag.typ === 'rezeptname') {
      const rezept = this.allRecipes.find(r =>
        this.sonderzeichenservice
          .uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(r.name)
          .toLowerCase()
          .includes(original.toLowerCase())
      );

      if (rezept) {
        this.zeigeDetails(rezept.id);
      } else {
        this.snackbarZeigenUndAlleRezepteLaden();
      }
    } else {
      this.http.get<any[]>(`/api/rezepte/suche?begriff=${encodeURIComponent(original)}`)
        .subscribe(data => {
          if (data.length === 0) {
            this.snackbarZeigenUndAlleRezepteLaden();
          } else {
            this.gefilterteRezepte = data;
            this.seite = 1;
          }
        });
    }
  }

  eingabeLeeren() {
    this.suchbegriff = '';
    this.vorschlaege = [];
    this.gefilterteRezepte = []; // <- zeigt wieder alle an
    this.seite = 1;
  }


  snackbarZeigenUndAlleRezepteLaden() {
    this.alertService.zeigeAlert('Keine passenden Rezepte gefunden', 1500);

    setTimeout(() => {
      this.gefilterteRezepte = [];
      this.seite = 1;
    }, 1500);
  }

  public uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(text: string): string {
    return this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(text);
  }


}
