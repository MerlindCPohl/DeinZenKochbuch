import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {CommonModule} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {RezeptDetailComponent} from '../recipedetail/recipedetail.component';

@Component({
  selector: 'app-allrecipes',
  standalone: true,
  imports: [CommonModule, MatIconModule, RezeptDetailComponent],
  templateUrl: './allrecipes.component.html'
})
export class AllrecipesComponent implements OnInit {
  allRecipes: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/rezepte').subscribe(data => {
      this.allRecipes = data;
    });
  }

  zeigeDetails(id: number): void {
    this.router.navigate(['/rezept-detail'], { queryParams: { id } });
  }

  seite = 1;
  seitenGroesse = 10;
  ausgewaehlt: number | null = null;

  get paginierteRezepte() {
    const start = (this.seite - 1) * this.seitenGroesse;
    return this.allRecipes.slice(start, start + this.seitenGroesse);
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


}
