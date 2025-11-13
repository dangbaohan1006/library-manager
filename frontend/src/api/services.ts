import apiClient from './client';
import type {
  Book,
  BookCreate,
  BookUpdate,
  Member,
  MemberCreate,
  MemberUpdate,
  Loan,
  LoanCreate,
  ReturnRequest,
  Reservation,
  ReservationCreate,
  TopBook,
  OverdueLoan,
} from './types';

// Books API
export const booksApi = {
  getAll: () => apiClient.get<Book[]>('/books'),
  getById: (id: number) => apiClient.get<Book>(`/books/${id}`),
  create: (book: BookCreate) => apiClient.post<Book>('/books', book),
  update: (id: number, book: BookUpdate) => apiClient.put<Book>(`/books/${id}`, book),
  delete: (id: number) => apiClient.delete(`/books/${id}`),
};

// Members API
export const membersApi = {
  getAll: () => apiClient.get<Member[]>('/members'),
  getById: (id: number) => apiClient.get<Member>(`/members/${id}`),
  create: (member: MemberCreate) => apiClient.post<Member>('/members', member),
  update: (id: number, member: MemberUpdate) => apiClient.put<Member>(`/members/${id}`, member),
  delete: (id: number) => apiClient.delete(`/members/${id}`),
};

// Loans API
export const loansApi = {
  getAll: () => apiClient.get<Loan[]>('/loans'),
  getActive: () => apiClient.get<Loan[]>('/loans/active'),
  borrow: (loan: LoanCreate) => apiClient.post<Loan>('/loans/borrow', loan),
  return: (returnReq: ReturnRequest) => apiClient.post<Loan>('/loans/return', returnReq),
};

// Reservations API
export const reservationsApi = {
  getAll: () => apiClient.get<Reservation[]>('/reservations'),
  reserve: (reservation: ReservationCreate) => apiClient.post<Reservation>('/reservations/reserve', reservation),
  delete: (id: number) => apiClient.delete(`/reservations/${id}`),
};

// Analytics API
export const analyticsApi = {
  getTopBooks: (limit: number = 10) => apiClient.get<TopBook[]>(`/analytics/top-books?limit=${limit}`),
  getOverdueLoans: () => apiClient.get<OverdueLoan[]>('/analytics/overdue-loans'),
};

