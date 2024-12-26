import { Component, OnInit} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-root',
  imports: [RouterModule,CommonModule,MatToolbarModule,MatIconModule,MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'lab2-angular';
  isAdmin = false; // Хранит статус администратора
  isLoggedIn = false; // Хранит статус авторизации

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Проверяем статус администратора из localStorage
    const adminStatus = localStorage.getItem('isAdmin');
    this.isAdmin = adminStatus === 'true'; // Если значение 'true', то пользователь админ
    this.updateAuthState();
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem('Token');
    this.isLoggedIn = !!token; // Если токен существует, пользователь авторизован
    // Подписка на глобальные события изменения аутентификации
    window.addEventListener('authChange', () => {
      this.updateAuthState();
    });
  }
  updateAuthState(): void {
    const token = localStorage.getItem('Token');
    const adminStatus = localStorage.getItem('isAdmin');
    
    this.isLoggedIn = !!token; // Проверяем, есть ли токен
    this.isAdmin = adminStatus === 'true'; // Устанавливаем роль администратора
  }
}
