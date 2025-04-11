import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {CommonModule} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-allrecipes',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './allrecipes.component.html'
})
export class AllrecipesComponent{
  allRecipes: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/rezepte').subscribe(data => {
      this.allRecipes = data;
    });
  }

  ausgewaehlt: number | null = null;
  rezept: any = null;

  zeigeDetails(id: number): void {
    console.log('Klick auf:', id);
    this.ausgewaehlt = id;

    this.http.get(`/api/rezeptdetail/${id}`).subscribe((data: any) => {
      data.name = this.ersetzeSS(this.ersetzeUmlaute(data.name));
      data.anleitung = this.ersetzeSS(this.ersetzeUmlaute(data.anleitung));

      data.zutaten = data.zutaten.map((zutat: any) => ({
        ...zutat,
        name: this.formatZutatName(zutat.name),
        mengeneinheit: this.uebersetzeMengeneinheit(zutat.mengeneinheit)
      }));

      this.rezept = data;
      console.log('Rezept geladen und formatiert:', data);
    });
  }


  schliessen() {
    this.ausgewaehlt = null;
    this.rezept = null;
  }


  seite = 1;
  seitenGroesse = 10;

  gefilterteRezepte: any[] = [];


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

  ersetzeUmlauteUndSonderzeichen(text: string): string {
    const ausnahmen = ['kresse', 'passionsfrucht', 'nuss', 'nuesse', 'nüsse', 'essig', 'Essig', 'wasser', 'Wasser'];

    // wenn keine ausnahme
    const istAusnahme = ausnahmen.some(ausnahme => text.toLowerCase().includes(ausnahme.toLowerCase()));
    if (!istAusnahme) {
      text = text.replace(/ss/g, 'ß');
    }

    const ausnahmenUmlaute = ['balsamicoessig', 'sauerampfer', 'boeuf stroganoff'];
    const istUmlautAusnahme = ausnahmenUmlaute.some(a => text.toLowerCase().includes(a));
    if (!istUmlautAusnahme) {
      text = text
        .replace(/ae/g, 'ä')
        .replace(/oe/g, 'ö')
        .replace(/ue/g, 'ü')
        .replace(/Ae/g, 'Ä')
        .replace(/Oe/g, 'Ö')
        .replace(/Ue/g, 'Ü');
    }

    return text;
  }

  private mengeneinheitMapping: { [key: string]: string } = {
    'Stueck': 'Stück',
    'g': 'Gramm',
    'l': 'Liter',
    'ml': 'Milliliter'
  };

  private ersetzeSS(text: string): string {
    const ausnahmen = ['kresse', 'passionsfrucht'];
    const patternNuss = /nuss|nuesse|nüsse/i;
    const patternEssig = /essig/i;
    const patternWasser = /wasser/i;
    const ausnahmeMitWeiss = /weissweinessig/i;

    if (ausnahmeMitWeiss.test(text)) {
      return text.replace(/weiss/i, 'weiß');
    }

    const lowerText = text.toLowerCase();
    if (
      ausnahmen.includes(lowerText) ||
      patternNuss.test(lowerText) ||
      patternEssig.test(lowerText) ||
      patternWasser.test(lowerText)
    ) {
      return text;
    }

    return text.replace(/ss/g, 'ß');
  }

  private ersetzeUmlaute(text: string): string {
    const ausnahmenUmlaute = ['balsamicoessig', 'sauerampfer', 'boeuf stroganoff'];

    if (ausnahmenUmlaute.includes(text.toLowerCase())) {
      return text;
    }

    return text
      .replace(/ae/g, 'ä')
      .replace(/oe/g, 'ö')
      .replace(/ue/g, 'ü')
      .replace(/Ae/g, 'Ä')
      .replace(/Oe/g, 'Ö')
      .replace(/Ue/g, 'Ü');
  }

  public formatZutatName(text: string): string {
    const mitUmlauten = this.ersetzeUmlaute(text);
    return this.ersetzeSS(mitUmlauten);
  }

  public uebersetzeMengeneinheit(mengeneinheit: string): string {
    const translated = this.mengeneinheitMapping[mengeneinheit] || mengeneinheit;
    return this.ersetzeUmlaute(translated);
  }


  suchbegriff: string = '';
  vorschlaege: { begriff: string, typ: string }[] = [];

  sucheVorschlaege() {
    if (this.suchbegriff.length < 3) {
      this.vorschlaege = [];
      return;
    }

    this.http.get<{ begriff: string, typ: string }[]>(`/api/suchvorschlaege?query=${this.suchbegriff}`)
      .subscribe(data => {
        this.vorschlaege = data.map(v => ({
          ...v,
          begriff: this.ersetzeSS(this.ersetzeUmlaute(v.begriff))
        }));
      });
  }


  vorschlagAuswaehlen(vorschlag: { begriff: string, typ: string }) {
    const original = vorschlag.begriff;
    this.suchbegriff = original;
    this.vorschlaege = [];

    if (vorschlag.typ === 'rezeptname') {
      // Finde das Rezept aus allRecipes, um das Modal zu öffnen
      const rezept = this.allRecipes.find(r =>
        this.ersetzeSS(this.ersetzeUmlaute(r.name)) === original
      );
      if (rezept) {
        this.zeigeDetails(rezept.id);
      }
    } else {
      // Zutaten/Zutatensynonyme/Rezeptsynonyme
      this.http.get<any[]>(`/api/rezepte/suche?begriff=${encodeURIComponent(original)}`)
        .subscribe(data => {
          this.gefilterteRezepte = data;
          this.seite = 1; // Reset auf erste Seite
        });
    }
  }

  filternachBegriff(begriff: string) {
    const lower = begriff.toLowerCase();
    this.http.get<any[]>('/api/rezepte').subscribe(rezepte => {
      this.gefilterteRezepte = rezepte.filter(r =>
        r.name.toLowerCase().includes(lower) || this.ersetzeUmlauteUndSonderzeichen(r.name.toLowerCase()).includes(lower)
      );
    });
  }

  clearSearch(event: Event) {
    event.preventDefault();
    this.suchbegriff = '';
    this.vorschlaege = [];
  }




}
