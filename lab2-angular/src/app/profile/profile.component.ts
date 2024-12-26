import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    HttpClientModule,
    MatCardModule, 
    MatListModule, 
    MatIconModule,
    CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  user: any = null; // Данные пользователя
  books: string[] = []; // Массив названий книг
  login: string | null = null; // Логин пользователя
  
  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit(): void {
    this.getLoginFromStorage();
    if (this.login) {
      this.getUserIdByLogin();
    }
  }

  // Получаем логин из localStorage
  getLoginFromStorage(): void {
    this.login = localStorage.getItem('login');
  }

  // Получаем ID пользователя по логину
  getUserIdByLogin(): void {
    this.http.get(`http://localhost:5145/api/User/get-id-by-login/${this.login}`).subscribe(
      (response: any) => {
        console.log('Получен ID пользователя:', response.userId);

        // После получения ID пользователя, загружаем его данные
        this.getUserInfo(response.userId);
      },
      (error) => {
        console.error('Ошибка получения ID пользователя:', error);
      }
    );
  }

  // Получаем данные пользователя по ID
  getUserInfo(userId: number): void {
    this.http.get(`http://localhost:5145/api/User/${userId}`).subscribe(
      (response: any) => {
        console.log('Информация о пользователе:', response);
        this.user = response;
        if (this.user && typeof this.user.isAdmin === 'boolean') {
          localStorage.setItem('isAdmin', this.user.isAdmin.toString());
        }
        // Если у пользователя есть забронированные книги, получаем их названия
        if (this.user && this.user.rentedBookIds) {
          this.getBookNames(this.user.rentedBookIds);
        }
      },
      (error) => {
        console.error('Ошибка получения данных пользователя:', error);
      }
    );
  }

  // Получаем названия книг по их ID
  getBookNames(bookIds: number[]): void {
    const requests = bookIds.map((id) =>
      this.http.get(`http://localhost:5145/api/Book/${id}`)
    );

    forkJoin(requests).subscribe(
      (responses: any[]) => {
        this.books = responses.map((book) => book.title);
        console.log('Названия книг:', this.books);
      },
      (error) => {
        console.error('Ошибка получения названий книг:', error);
      }
    );
  }
  logout(): void {
    localStorage.removeItem('Token'); // Удаляем токен
    localStorage.removeItem('login');
    localStorage.removeItem('isAdmin');
    window.dispatchEvent(new Event('authChange'));
    this.router.navigate(['/login']); // Перенаправляем на страницу входа
  }
}
