import { useState, useEffect } from 'react';
import { ArrowRightLeft, BookOpen, User, Calendar } from 'lucide-react';
import { loansApi, booksApi, membersApi } from '@/api/services';
import type { Loan, Book, Member, LoanCreate } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import toast from 'react-hot-toast';

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [borrowForm, setBorrowForm] = useState<LoanCreate>({
    book_id: 0,
    member_id: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, booksRes, membersRes] = await Promise.all([
        loansApi.getAll(),
        booksApi.getAll(),
        membersApi.getAll(),
      ]);
      setLoans(loansRes.data);
      setBooks(booksRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loansApi.borrow(borrowForm);
      toast.success('Book borrowed successfully');
      setIsBorrowDialogOpen(false);
      setBorrowForm({ book_id: 0, member_id: 0 });
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to borrow book');
    }
  };

  const handleReturn = async () => {
    if (!selectedLoan) return;
    try {
      await loansApi.return({ loan_id: selectedLoan.loan_id });
      toast.success('Book returned successfully');
      setIsReturnDialogOpen(false);
      setSelectedLoan(null);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to return book');
    }
  };

  const openReturnDialog = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsReturnDialogOpen(true);
  };

  const getBookTitle = (bookId: number) => {
    return books.find((b) => b.book_id === bookId)?.title || 'Unknown';
  };

  const getMemberName = (memberId: number) => {
    return members.find((m) => m.member_id === memberId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Borrow Book</span>
            </CardTitle>
            <CardDescription>Borrow a book from the library</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsBorrowDialogOpen(true)} className="w-full">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Borrow Book
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>
          <CardDescription>View all loan records</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Loan Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Fine</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.loan_id}>
                    <TableCell>{loan.loan_id}</TableCell>
                    <TableCell className="font-medium">{getBookTitle(loan.book_id)}</TableCell>
                    <TableCell>{getMemberName(loan.member_id)}</TableCell>
                    <TableCell>{new Date(loan.loan_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(loan.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {loan.return_date ? new Date(loan.return_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>{loan.fine_amount > 0 ? `${loan.fine_amount.toLocaleString()}đ` : '-'}</TableCell>
                    <TableCell className="text-right">
                      {!loan.return_date && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReturnDialog(loan)}
                        >
                          Return
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrow Book</DialogTitle>
            <DialogDescription>Select a book and member to create a loan</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBorrow}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="book">Book</Label>
                <Select
                  id="book"
                  value={borrowForm.book_id}
                  onChange={(e) => setBorrowForm({ ...borrowForm, book_id: parseInt(e.target.value) })}
                  required
                >
                  <option value={0}>Select a book</option>
                  {books.map((book) => (
                    <option key={book.book_id} value={book.book_id}>
                      {book.title} - {book.author}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member">Member</Label>
                <Select
                  id="member"
                  value={borrowForm.member_id}
                  onChange={(e) => setBorrowForm({ ...borrowForm, member_id: parseInt(e.target.value) })}
                  required
                >
                  <option value={0}>Select a member</option>
                  {members.map((member) => (
                    <option key={member.member_id} value={member.member_id}>
                      {member.name} - {member.email}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsBorrowDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Borrow</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
            <DialogDescription>Confirm book return</DialogDescription>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-2 py-4">
              <p><strong>Book:</strong> {getBookTitle(selectedLoan.book_id)}</p>
              <p><strong>Member:</strong> {getMemberName(selectedLoan.member_id)}</p>
              <p><strong>Due Date:</strong> {new Date(selectedLoan.due_date).toLocaleDateString()}</p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn}>Confirm Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

