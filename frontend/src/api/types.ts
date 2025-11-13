export interface Book {
  book_id: number;
  title: string;
  author: string;
  quantity: number;
  borrowed_count: number;
}

export interface BookCreate {
  title: string;
  author: string;
  quantity: number;
}

export interface BookUpdate {
  title?: string;
  author?: string;
  quantity?: number;
}

export interface Member {
  member_id: number;
  name: string;
  email: string;
  join_date: string;
}

export interface MemberCreate {
  name: string;
  email: string;
}

export interface MemberUpdate {
  name?: string;
  email?: string;
}

export interface Loan {
  loan_id: number;
  book_id: number;
  member_id: number;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  fine_amount: number;
}

export interface LoanCreate {
  book_id: number;
  member_id: number;
}

export interface ReturnRequest {
  loan_id: number;
}

export interface Reservation {
  res_id: number;
  book_id: number;
  member_id: number;
  res_date: string;
}

export interface ReservationCreate {
  book_id: number;
  member_id: number;
}

export interface TopBook {
  book_id: number;
  title: string;
  author: string;
  borrowed_count: number;
}

export interface OverdueLoan {
  loan_id: number;
  book_title: string;
  member_name: string;
  due_date: string;
  days_overdue: number;
  fine_amount: number;
}

