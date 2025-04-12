import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {CommonModule} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {Sonderzeichenservice} from '../services/sonderzeichenservice';


@Component({
  selector: 'app-allrecipes',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
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
    private router: Router,
    private sonderzeichenservice: Sonderzeichenservice,
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

    this.http.get<{ begriff: string, typ: string }[]>(`/api/suchvorschlaege?query=${this.suchbegriff}`)
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
        this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(r.name) === original
      );
      if (rezept) {
        this.zeigeDetails(rezept.id);
      }
    } else {
      this.http.get<any[]>(`/api/rezepte/suche?begriff=${encodeURIComponent(original)}`)
        .subscribe(data => {
          this.gefilterteRezepte = data;
          this.seite = 1;
        });
    }
  }

  public uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(text: string): string {
    return this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(text);
  }

}
