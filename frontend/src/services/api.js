import axios from 'axios';

const API_URL = import.meta.env.PROD 
    ? 'https://beta-api.gigafit.space' 
    : 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const BASE_URL = API_URL;

// books
export const getBooks = (params) => api.get('/books/', { params });
export const getBookById = (id) => api.get(`/books/${id}`);
export const createBook = (data) => api.post('/books/', data); 
export const updateBook = (bookId, data) => api.put(`/books/${bookId}`, data);
export const deleteBook = (bookId) => api.delete(`/books/${bookId}`);

// loans
export const getLoans = () => api.get('/loans/');
export const borrowBook = (data) => api.post('/loans/borrow', data);
export const returnBook = (loanId) => api.post(`/loans/return/${loanId}`);
export const checkLoanAccess = (bookId, memberId) => api.get(`/loans/check-access`, { params: { book_id: bookId, member_id: memberId } });

// members
export const getMembers = () => api.get('/members/');
export const createMember = (data) => api.post('/members/', data); 
export const updateMember = (id, data) => api.put(`/members/${id}`, data);
export const deleteMember = (id) => api.delete(`/members/${id}`);

// reservations
export const getReservations = () => api.get('/reservations/');
export const createReservation = (data) => api.post('/reservations/reserve', data);
export const deleteReservation = (id) => api.delete(`/reservations/${id}`);

// analytics
export const getDashboardStats = () => api.get('/analytics/dashboard');
export const getTopBooks = () => api.get('/analytics/top-books');
export const getOverdueList = () => api.get('/analytics/overdue-list');

export default api;