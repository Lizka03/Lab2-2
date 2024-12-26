
import { Routes, CanActivateFn } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminBooksComponent } from './admin-books/admin-books.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminLoansComponent } from './admin-loans/admin-loans.component';

// Функция для проверки авторизации
const isAuthenticated: CanActivateFn = () => {
  const token = localStorage.getItem('Token');
  return !!token; // Возвращает true, если токен существует
};

// Функция для проверки роли администратора
const isAdmin: CanActivateFn = () => {
  const token = localStorage.getItem('Token');
  const adminStatus = localStorage.getItem('isAdmin') === 'true';
  return !!token && adminStatus; // Возвращает true, если токен существует и пользователь администратор
};

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent,canActivate: [isAuthenticated] },
  { path: 'admin-books', component: AdminBooksComponent,canActivate: [isAdmin] },
  { path: 'admin-users', component: AdminUsersComponent,canActivate: [isAdmin] },
  { path: 'admin-loans', component: AdminLoansComponent,canActivate: [isAdmin] },
];

