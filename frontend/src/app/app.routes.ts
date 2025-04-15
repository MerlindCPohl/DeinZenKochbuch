import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { MyrecipesComponent } from './myrecipes/myrecipes.component';
import { NewrecipeComponent } from './newrecipe/newrecipe.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './shared/auth/auth.guard';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { AllrecipesComponent } from './allrecipes/allrecipes.component';
import { MonthsComponent } from './months/months.component';
import {AboutComponent} from './about/about.component';


export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: 'full' },
  { path: "register", title: "Registrieren", component: RegisterComponent },
  { path: "login", title: "Login", component: LoginComponent },
  { path: "home", title: "Startseite", component: HomeComponent },
  { path: "myrecipes", title: "Meine Rezepte", component: MyrecipesComponent, canActivate: [AuthGuard] },
  { path: "newrecipe", title: "Meine Rezepte", component: NewrecipeComponent, canActivate: [AuthGuard] },
  { path: "user-settings", title: "Einstellungen", component: UserSettingsComponent, canActivate: [AuthGuard] },
  { path: "allrecipes", title: "Alle Rezepte", component: AllrecipesComponent },
  { path: "months", title: "Jahresuhr", component: MonthsComponent, canActivate: [AuthGuard] },
  { path: 'about', title:"Mehr erfahren", component: AboutComponent, canActivate: [AuthGuard] },
  { path: "**", redirectTo: "login" } //fallback falss falsche url eingabe

];
