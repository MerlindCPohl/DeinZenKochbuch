export interface User {
  id?: number; // Optional, da es automatisch von der Datenbank generiert wird
  name: string; // Entspricht dem "Nutzername" Feld
  passwort: string; // Entspricht dem "Passwort" Feld
}
