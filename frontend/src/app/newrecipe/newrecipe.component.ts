import {Component, OnInit} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Sonderzeichenservice} from '../services/sonderzeichenservice';

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
  bearbeiteId: number | null = null;
  formularUngueltig = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    protected sonderzeichenservice: Sonderzeichenservice
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.bearbeiteId = +id;
      this.ladeRezeptZurBearbeitung(this.bearbeiteId);
    }
  }

  ladeRezeptZurBearbeitung(id: number) {
    this.http.get<any>(`/api/rezeptdetail/${id}`).subscribe(data => {
      this.rezept = {
        name: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(data.name),
        anleitung: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(data.anleitung),
        anzahlportionen: data.anzahlportionen ?? 1,
        zubereitungszeitmin: data.zubereitungszeitmin ?? 0,
        rohkost: data.rohkost,
        vegan: data.vegan,
        vegetarisch: data.vegetarisch,
        glutenfrei: data.glutenfrei
      };

      this.ausgewaehlteZutaten = data.zutaten.map((z: any) => ({
        id: z.id,
        menge: z.menge,
        name: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(z.name),
        mengeneinheit: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(z.mengeneinheit)

      }));
      console.log('Zutaten aus der API:', data.zutaten);

    });
  }

  // hinzufügen einer zutat
  zutatAuswaehlen(zutat: any) {
    const bereitsHinzugefuegt = this.ausgewaehlteZutaten.find(z => z.id === zutat.id);

    if (!bereitsHinzugefuegt) {
      this.ausgewaehlteZutaten.push({
        ...zutat,
        name: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(zutat.name),
        menge: '',
        mengeneinheit: this.sonderzeichenservice.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(zutat.mengeneinheit)
      });
    }

    this.zutatInput = '';
    this.zutatenVorschlaege = [];
  }


  sucheZutat() {
    if (this.zutatInput.length >= 1) {
      const suchbegriff = this.sonderzeichenservice.ersetzeUmlauteUndSonderzeichenFuerSpeichernInDB(this.zutatInput);
      this.http.get<any[]>(`/api/zutaten?name=${suchbegriff}`)
        .subscribe(data => this.zutatenVorschlaege = data);
    } else {
      this.zutatenVorschlaege = [];
    }
  }

  // Zutat entfernen
  entferneZutat(id: number) {
    this.ausgewaehlteZutaten = this.ausgewaehlteZutaten.filter((z) => z.id !== id);
  }

  onSubmit(form: NgForm) {
    this.formularUngueltig = form.invalid || this.rezept.anzahlportionen <= 0 || this.rezept.zubereitungszeitmin <= 0;

    if (this.formularUngueltig) return;
    this.formularUngueltig = false;

    if (this.ausgewaehlteZutaten.length < 2) {
      this.snackbarAnzeigen('Bitte fülle alle Felder korrekt aus und gib mindestens zwei Zutaten an.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Du musst eingeloggt sein, um ein Rezept zu speichern.');
      return;
    }
    //umwandlen von feldern für db
    const rezeptMitErsetzterSchreibweise = {
      ...this.rezept,
      name: this.sonderzeichenservice.ersetzeUmlauteUndSonderzeichenFuerSpeichernInDB(this.rezept.name),
      anleitung: this.sonderzeichenservice.ersetzeUmlauteUndSonderzeichenFuerSpeichernInDB(this.rezept.anleitung),
      anzahlportionen: this.rezept.anzahlportionen,
      zubereitungszeitmin: this.rezept.zubereitungszeitmin
    };

    // zutatenschreibweise umwandeln
    const zutatenKonvertiert = this.ausgewaehlteZutaten.map(zutat => ({
      id: zutat.id,
      menge: Number(zutat.menge),
      name: this.sonderzeichenservice.ersetzeUmlauteUndSonderzeichenFuerSpeichernInDB(zutat.name),
      mengeneinheit: this.sonderzeichenservice.ersetzeUmlauteUndSonderzeichenFuerSpeichernInDB(zutat.mengeneinheit)
    }));

    //hier mit user id aus login speuchern
    const rezeptData = {
      ...rezeptMitErsetzterSchreibweise,
      zutaten: zutatenKonvertiert,
      userId: +userId
    };

    console.log('Rezept-Daten zur Speicherung:', rezeptData);

    if (this.bearbeiteId) {
      this.http.put(`/api/updaterezepte/${this.bearbeiteId}`, rezeptData).subscribe(
        () => {
          this.snackbarAnzeigen('Rezept aktualisiert!');
          setTimeout(() => {
            this.router.navigate(['/myrecipes']);
          }, 2000);
        },
        () => this.snackbarAnzeigen('Fehler beim Aktualisieren.')
      );
    } else {
      this.http.post('api/rezept', rezeptData).subscribe(
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
  }

  snackbarText = '';
  snackbarVisible = false;

  snackbarAnzeigen(text: string) {
    this.snackbarText = text;
    this.snackbarVisible = true;
    setTimeout(() => this.snackbarVisible = false, 3000);
  }

  abbrechen() {
    this.router.navigate(['/home']);
  }

}
