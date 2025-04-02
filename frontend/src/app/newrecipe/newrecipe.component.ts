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
  mengenEinheit: string;
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

  sucheZutat() {
    if (this.zutatInput.length > 1) {
      this.http.get<any[]>(`http://localhost:3000/zutaten?name=${this.zutatInput}`)
        .subscribe(data => this.zutatenVorschlaege = data);
    } else {
      this.zutatenVorschlaege = [];
    }
  }


  zutatAuswaehlen(zutat: any) {
    this.ausgewaehlteZutaten.push({ ...zutat, menge: '' });
    this.zutatInput = '';
    this.zutatenVorschlaege = [];
  }
  

  // Zutat entfernen
  entferneZutat(id: number) {
    this.ausgewaehlteZutaten = this.ausgewaehlteZutaten.filter((z) => z.id !== id);
  }

  // Rezept speichern
  onSubmit() {
    const rezeptData = {
      ...this.rezept,
      zutaten: this.ausgewaehlteZutaten
    };

    this.http.post('/api/rezepte', rezeptData).subscribe(
      () => alert('Rezept erfolgreich gespeichert!'),
      () => alert('Fehler beim Speichern des Rezepts.')
    );
  }

  ngOnInit(): void {
  }
}
