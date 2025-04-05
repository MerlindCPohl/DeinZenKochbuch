import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-myrecipes',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './myrecipes.component.html',
  styleUrl: './myrecipes.component.css'
})


export class MyrecipesComponent  {
  myRecipes: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.http.get<any[]>(`/api/rezepte/user/${userId}`).subscribe(daten => {
      this.myRecipes = daten;
    });
  }

  bearbeiten(id: number): void {
    this.router.navigate(['/newrecipe'], { queryParams: { id } });
  }

  loeschen(id: number): void {
    if (confirm('Möchtest du das Rezept wirklich löschen?')) {
      this.http.delete(`/api/rezepte/${id}`).subscribe(() => {
        this.myRecipes = this.myRecipes.filter(r => r.id !== id);
      });
    }
  }
}

