import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { analyticsApi } from '@/api/services';
import type { TopBook, OverdueLoan } from '@/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [topBooksRes, overdueRes] = await Promise.all([
        analyticsApi.getTopBooks(10),
        analyticsApi.getOverdueLoans(),
      ]);
      setTopBooks(topBooksRes.data);
      setOverdueLoans(overdueRes.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Top Borrowed Books</span>
          </CardTitle>
          <CardDescription>Most popular books in the library</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Book ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Borrowed Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topBooks.map((book, index) => (
                  <TableRow key={book.book_id}>
                    <TableCell className="font-bold">#{index + 1}</TableCell>
                    <TableCell>{book.book_id}</TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {book.borrowed_count} times
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Overdue Loans</span>
          </CardTitle>
          <CardDescription>Loans that have passed their due date</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : overdueLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No overdue loans at the moment
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Fine Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueLoans.map((loan) => (
                  <TableRow key={loan.loan_id}>
                    <TableCell>{loan.loan_id}</TableCell>
                    <TableCell className="font-medium">{loan.book_title}</TableCell>
                    <TableCell>{loan.member_name}</TableCell>
                    <TableCell>{new Date(loan.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                        {loan.days_overdue} days
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-destructive">
                      {loan.fine_amount.toLocaleString()}đ
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

