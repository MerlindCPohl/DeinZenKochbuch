import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Sonderzeichenservice {

  private readonly mengeneinheitMapping: { [key: string]: string } = {
    'Stueck': 'Stück',
    'g': 'Gramm',
    'l': 'Liter',
    'ml': 'Milliliter'
  };

  public uebersetzeMengeneinheit(einheit: string): string {
    const translated = this.mengeneinheitMapping[einheit] || einheit;
    return this.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(translated);
  }


  public ersetzeUmlauteUndSonderzeichenFuerSpeichernInDB(text: string): string {
    return text
      .replace(/ß/g, 'ss')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/Ä/g, 'Ae')
      .replace(/Ö/g, 'Oe')
      .replace(/Ü/g, 'Ue');
  }

  public uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(text: string): string {
    const original = text;

    text = text.replace(/weissweinessig/gi, 'Weißweinessig');
    text = text.replace(/gemuese paella/gi, 'Gemüse Paella');

    const ausnahmenSS = [ 'fassen', 'fasse', 'lasse', 'lassen','kuerbissuppe','moussaka','schuessel', 'kresse', 'passionsfrucht', 'essig', 'wasser', 'dressing'];
    const musterSSAusnahme = /(mousse|nuss|nuesse|nüsse|nuß|nuessen|nüssen|nussig|nussöl|nussoel)/i;
    const ausnahmeMitWeiss = /weissweinessig/i;

    if (ausnahmeMitWeiss.test(text)) {
      text = text.replace(/weiss/gi, 'weiß');
    }

    const istSSAusnahme = ausnahmenSS.some(a => text.toLowerCase().includes(a)) || musterSSAusnahme.test(text);
    if (!istSSAusnahme) {
      text = text.replace(/ss/g, 'ß');
    }

    const ausnahmenUmlaute = [ 'liptauer', 'sauer', 'paella', 'balsamicoessig', 'sauerampfer', 'boeuf stroganoff' ];
    const istUmlautAusnahme = ausnahmenUmlaute.some(a => original.toLowerCase().includes(a));

    if (!istUmlautAusnahme) {
      text = text
        .replace(/nuesse/gi, 'nüsse')
        .replace(/nuessen/gi, 'nüssen')
        .replace(/nuss/gi, 'nuss')
        // jetzt robust:
        .replace(/ue/gi, match => match === 'Ue' ? 'Ü' : 'ü')
        .replace(/oe/gi, match => match === 'Oe' ? 'Ö' : 'ö')
        .replace(/ae/gi, match => match === 'Ae' ? 'Ä' : 'ä');
    }

    return text;
  }


  public formatZutatName(text: string): string {
    return this.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(text);
  }

}
