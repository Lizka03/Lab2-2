import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  overdueBooks: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadOverdueBooks();
  }

  // Загружаем список пользователей
  loadUsers(): void {
    this.http.get('http://localhost:5145/api/User').subscribe({
      next: (data: any) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Ошибка загрузки пользователей:', err);
      }
    });
  }

  // Загружаем список просроченных книг
  loadOverdueBooks(): void {
    this.http.get('http://localhost:5145/api/Book/overdue-books').subscribe({
      next: (data: any) => {
        this.overdueBooks = data;
      },
      error: (err) => {
        console.error('Ошибка загрузки просроченных книг:', err);
      }
    });
  }

  // Метод для группировки просроченных книг по пользователям
  getUsersWithOverdueBooks(): any[] {
    const usersWithBooks: any[] = [];

    this.overdueBooks.forEach((book: any) => {
      const user = usersWithBooks.find((u) => u.id === book.RentedByUserId);
      if (user) {
        user.books.push(book);
      } else {
        const rentedByUser = this.users.find((u) => u.Id === book.RentedByUserId);
        if (rentedByUser) {
          usersWithBooks.push({
            id: rentedByUser.Id,
            name: rentedByUser.Username,
            books: [book]
          });
        }
      }
    });

    return usersWithBooks;
  }
}
