import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';

interface Zutat {
  id: number;
  name: string;
  mengeneinheit: string;
  menge?: number;
}

@Component({
  selector: 'app-newrecipe',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule],
  templateUrl: './newrecipe.component.html',
  styleUrl: './newrecipe.component.css'
})

export class NewrecipeComponent implements OnInit {

  rezept = {
    name: '',
    anleitung: '',
    anzahlportionen: 1,
    zubereitungszeitmin: 0,
    rohkost: false,
    vegan: false,
    vegetarisch: false,
    glutenfrei: false,
  };

  zutatInput = '';
  zutatenVorschlaege: Zutat[] = [];
  ausgewaehlteZutaten: Zutat[] = [];

  constructor(private http: HttpClient) {}

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

    // ausnahmen wo ss greifen soll
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

  public formatZutatName(text: string): string {
    const mitUmlauten = this.ersetzeUmlaute(text);
    return this.ersetzeSS(mitUmlauten);
  }

  private ersetzeUmlaute(text: string): string {
    // hier kommen die ausnahmen hin
    const ausnahmenUmlaute = ['balsamicoessig', 'sauerampfer'];

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


  // mengeneinheit richtig ausschreiben
  private uebersetzeMengeneinheit(mengeneinheit: string): string {
    const translated = this.mengeneinheitMapping[mengeneinheit] || mengeneinheit;
    return this.ersetzeUmlaute(translated);
  }



  // hinzufügen einer zutat
  zutatAuswaehlen(zutat: any) {
    this.ausgewaehlteZutaten.push({
      ...zutat,
      menge: '',
      mengeneinheit: this.uebersetzeMengeneinheit(zutat.mengeneinheit)
    });
    this.zutatInput = '';
    this.zutatenVorschlaege = [];
  }


  sucheZutat() {
    if (this.zutatInput.length >= 1) {
      const suchbegriff = this.normalisiereEingabe(this.zutatInput);
      this.http.get<any[]>(`/api/zutaten?name=${suchbegriff}`)
        .subscribe(data => this.zutatenVorschlaege = data);
    } else {
      this.zutatenVorschlaege = [];
    }
  }

  private normalisiereEingabe(text: string): string {
    return text
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss');
  }

  // Zutat entfernen
  entferneZutat(id: number) {
    this.ausgewaehlteZutaten = this.ausgewaehlteZutaten.filter((z) => z.id !== id);
  }


  // Rezept speichern + bedenken, dass alle ß wieder ss werden, ebenso umlaute, sonst db nicht lesbar
  private ersetzeFuerSpeicherung(text: string): string {
    return text
      .replace(/ß/g, 'ss')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/Ä/g, 'Ae')
      .replace(/Ö/g, 'Oe')
      .replace(/Ü/g, 'Ue');
  }


  onSubmit() {

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Du musst eingeloggt sein, um ein Rezept zu speichern.');
      return;
    }
    //umwandlen von feldern für db
    const rezeptMitErsetzterSchreibweise = {
      ...this.rezept,
      name: this.ersetzeFuerSpeicherung(this.rezept.name),
      anleitung: this.ersetzeFuerSpeicherung(this.rezept.anleitung),
    };

    // zutatenschreibweise umwandeln
    const zutatenKonvertiert = this.ausgewaehlteZutaten.map(zutat => ({
      ...zutat,
      name: this.ersetzeFuerSpeicherung(zutat.name),
      mengeneinheit: this.ersetzeFuerSpeicherung(zutat.mengeneinheit)
    }));

    //hier mit user id aus login speuchern
    const rezeptData = {
      ...rezeptMitErsetzterSchreibweise,
      zutaten: zutatenKonvertiert,
      userId: +userId
    };


    this.http.post('/api/rezept', rezeptData).subscribe(
      () => {
        this.snackbarAnzeigen('Rezept erfolgreich gespeichert!');
        setTimeout(() => {
          this.rezept = {
            name: '',
            anleitung: '',
            anzahlportionen: 0,
            zubereitungszeitmin: 0,
            rohkost: false,
            vegan: false,
            vegetarisch: false,
            glutenfrei: false
          };
          this.ausgewaehlteZutaten = [];
        }, 2000);
      },
      () => this.snackbarAnzeigen('Fehler beim Speichern des Rezepts.')
    );
  }

  snackbarText = '';
  snackbarVisible = false;

  snackbarAnzeigen(text: string) {
    this.snackbarText = text;
    this.snackbarVisible = true;
    setTimeout(() => this.snackbarVisible = false, 3000);
  }

  ngOnInit(): void {
  }
}
