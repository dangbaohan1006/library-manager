import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 60000,
});

export const BASE_URL = API_URL;

// Books
export const getBooks = (params) => api.get('/books/', { params });
export const getBookById = (id) => api.get(`/books/${id}`);

export const createBook = (formData) => api.post('/books/', formData); 

export const updateBook = (bookId, bookData) => api.put(`/books/${bookId}`, bookData);
export const deleteBook = (bookId) => api.delete(`/books/${bookId}`);

// Loans
export const getLoans = () => api.get('/loans/');
export const borrowBook = (data) => api.post('/loans/borrow', data);
export const returnBook = (loanId) => api.post(`/loans/return/${loanId}`);
export const checkLoanAccess = (bookId, memberId) => api.get(`/loans/check-access?book_id=${bookId}&member_id=${memberId}`);

// Members
export const getMembers = () => api.get('/members/');
export const createMember = (data) => api.post('/members/', data); 
export const updateMember = (id, data) => api.put(`/members/${id}`, data);
export const deleteMember = (id) => api.delete(`/members/${id}`);

// Analytics
export const getDashboardStats = () => api.get('/analytics/dashboard');
export const getTopBooks = () => api.get('/analytics/top-books');

export default api;