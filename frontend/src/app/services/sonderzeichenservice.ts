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

  private readonly ausnahmenSS = ['kresse', 'passionsfrucht'];
  private readonly ausnahmenUmlaute = ['balsamicoessig', 'sauerampfer', 'liptauer','boeuf stroganoff'];

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

    const ausnahmenSS = ['lassen','kuerbissuppe','moussaka','schuessel', 'kresse', 'passionsfrucht', 'essig', 'wasser', 'dressing'];
    const musterSSAusnahme = /(mousse|nuss|nuesse|nüsse|nuß|nuessen|nüssen|nussig|nussöl|nussoel)/i;
    const ausnahmeMitWeiss = /weissweinessig/i;

    if (ausnahmeMitWeiss.test(text)) {
      text = text.replace(/weiss/gi, 'weiß');
    }

    // ss ersetzen → ß (wenn KEINE Ausnahme zutrifft)
    const istSSAusnahme = ausnahmenSS.some(a => text.toLowerCase().includes(a)) || musterSSAusnahme.test(text);
    if (!istSSAusnahme) {
      text = text.replace(/ss/g, 'ß');
    }

    // Umlaute ersetzen, wenn keine inhaltlichen Ausnahmen wie „boeuf stroganoff“ etc.
    const ausnahmenUmlaute = [ 'sauer', 'paella', 'balsamicoessig', 'sauerampfer', 'boeuf stroganoff'];
    const istUmlautAusnahme = ausnahmenUmlaute.some(a => original.toLowerCase().includes(a));
    if (!istUmlautAusnahme) {
      text = text
        .replace(/nuesse/gi, 'nüsse')
        .replace(/nuessen/gi, 'nüssen')
        .replace(/nuss/gi, 'nuss') // bewusst nicht ersetzt
        .replace(/ae/g, 'ä')
        .replace(/oe/g, 'ö')
        .replace(/ue/g, 'ü')
        .replace(/Ae/g, 'Ä')
        .replace(/Oe/g, 'Ö')
        .replace(/Ue/g, 'Ü');
    }

    return text;
  }


  public formatZutatName(text: string): string {
    return this.uebersetzeUmlauteUndSonderzeichenAusDBFuerAnzeigeImFrontend(text);
  }

}
