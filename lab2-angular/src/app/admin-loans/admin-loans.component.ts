import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Для работы с ngModel
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-admin-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule,MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,MatOptionModule], // Добавляем CommonModule и FormsModule
  templateUrl: './admin-loans.component.html',
  styleUrls: ['./admin-loans.component.css'],
})
export class AdminLoansComponent implements OnInit {
  users: any[] = []; // Список пользователей
  books: any[] = []; // Список доступных книг
  rentedBooks: any[] = []; // Список арендованных книг
  selectedUserId: number | null = null; // Выбранный пользователь
  selectedBookId: number | null = null; // Выбранная книга
  returnBookId: number | null = null; // ID книги для возврата

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadBooks();
    this.loadRentedBooks();
  }

  // Загрузка списка пользователей
  loadUsers(): void {
    this.http.get('http://localhost:5145/api/User').subscribe({
      next: (data: any) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Ошибка загрузки пользователей:', err);
      },
    });
  }

  // Загрузка списка доступных книг
  loadBooks(): void {
    this.http.get('http://localhost:5145/api/Book').subscribe({
      next: (data: any) => {
        this.books = data.filter((book: any) => book.IsAvailable); // Только доступные книги
      },
      error: (err) => {
        console.error('Ошибка загрузки книг:', err);
      },
    });
  }

  // Загрузка списка арендованных книг
  loadRentedBooks(): void {
    this.http.get('http://localhost:5145/api/Book').subscribe({
      next: (data: any) => {
        this.rentedBooks = data.filter((book: any) => !book.IsAvailable); // Только арендованные книги
      },
      error: (err) => {
        console.error('Ошибка загрузки арендованных книг:', err);
      },
    });
  }

  // Резервирование книги
  reserveBook(): void {
    if (!this.selectedUserId || !this.selectedBookId) {
      alert('Выберите пользователя и книгу!');
      return;
    }

    const url = `http://localhost:5145/api/Book/${this.selectedBookId}/rent-to-user/${this.selectedUserId}`;
    console.log('Отправка запроса на резервирование книги:', url);

    this.http.post(url, null).subscribe({
      next: (response: any) => {
        alert(response.message || 'Книга успешно зарезервирована!');
        this.loadBooks(); // Обновляем список доступных книг
        this.loadRentedBooks(); // Обновляем список арендованных книг
        this.selectedBookId = null;
        this.selectedUserId = null;
      },
      error: (err) => {
        console.error('Ошибка при резервировании книги:', err);
        alert(`Ошибка резервирования: ${err.error?.message || 'Не удалось зарезервировать книгу.'}`);
      },
    });
  }

  // Возврат книги
  returnBook(): void {
    if (!this.returnBookId) {
      alert('Выберите книгу для возврата!');
      return;
    }

    const url = `http://localhost:5145/api/Book/${this.returnBookId}/return`;
    this.http.post(url, null).subscribe({
      next: () => {
        alert('Книга успешно возвращена!');
        this.loadBooks(); // Обновляем список доступных книг
        this.loadRentedBooks(); // Обновляем список арендованных книг
        this.returnBookId = null;
      },
      error: (err) => {
        console.error('Ошибка при возврате книги:', err);
        alert(`Ошибка возврата: ${err.error?.message || 'Не удалось вернуть книгу.'}`);
      },
    });
  }
}
