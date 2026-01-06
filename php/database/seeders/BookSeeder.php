<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $books = [
            ['title' => 'Clean Code: A Handbook of Agile Software Craftsmanship', 'author' => 'Robert C. Martin', 'edition' => '1st Edition', 'publication_year' => 2008, 'isbn' => '9780132350884', 'total_copies' => 5, 'available_copies' => 3, 'image_path' => null],
            ['title' => 'The Pragmatic Programmer', 'author' => 'Andrew Hunt, David Thomas', 'edition' => '2nd Edition', 'publication_year' => 2019, 'isbn' => '9780135957059', 'total_copies' => 3, 'available_copies' => 2, 'image_path' => null],
            ['title' => 'Design Patterns: Elements of Reusable Object-Oriented Software', 'author' => 'Gang of Four', 'edition' => '1st Edition', 'publication_year' => 1994, 'isbn' => '9780201633610', 'total_copies' => 4, 'available_copies' => 4, 'image_path' => null],
            ['title' => 'Refactoring: Improving the Design of Existing Code', 'author' => 'Martin Fowler', 'edition' => '2nd Edition', 'publication_year' => 2018, 'isbn' => '9780134757599', 'total_copies' => 2, 'available_copies' => 0, 'image_path' => null],
            ['title' => 'You Don\'t Know JS: Up & Going', 'author' => 'Kyle Simpson', 'edition' => '1st Edition', 'publication_year' => 2015, 'isbn' => '9781491924464', 'total_copies' => 3, 'available_copies' => 1, 'image_path' => null],
            ['title' => 'Eloquent JavaScript', 'author' => 'Marijn Haverbeke', 'edition' => '3rd Edition', 'publication_year' => 2018, 'isbn' => '9781593279509', 'total_copies' => 6, 'available_copies' => 5, 'image_path' => null],
            ['title' => 'Introduction to Algorithms', 'author' => 'Thomas H. Cormen, Charles E. Leiserson', 'edition' => '4th Edition', 'publication_year' => 2022, 'isbn' => '9780262046305', 'total_copies' => 2, 'available_copies' => 2, 'image_path' => null],
            ['title' => 'The Art of Computer Programming', 'author' => 'Donald E. Knuth', 'edition' => '1st Edition', 'publication_year' => 1968, 'isbn' => '9780201896831', 'total_copies' => 1, 'available_copies' => 0, 'image_path' => null],
            ['title' => 'Head First Design Patterns', 'author' => 'Eric Freeman, Elisabeth Robson', 'edition' => '2nd Edition', 'publication_year' => 2020, 'isbn' => '9781492078005', 'total_copies' => 4, 'available_copies' => 3, 'image_path' => null],
            ['title' => 'Code Complete', 'author' => 'Steve McConnell', 'edition' => '2nd Edition', 'publication_year' => 2004, 'isbn' => '9780735619678', 'total_copies' => 3, 'available_copies' => 2, 'image_path' => null],
            ['title' => 'The Clean Coder', 'author' => 'Robert C. Martin', 'edition' => '1st Edition', 'publication_year' => 2011, 'isbn' => '9780137081073', 'total_copies' => 5, 'available_copies' => 4, 'image_path' => null],
            ['title' => 'Effective Java', 'author' => 'Joshua Bloch', 'edition' => '3rd Edition', 'publication_year' => 2018, 'isbn' => '9780134685991', 'total_copies' => 4, 'available_copies' => 3, 'image_path' => null],
            ['title' => 'Python Crash Course', 'author' => 'Eric Matthes', 'edition' => '2nd Edition', 'publication_year' => 2019, 'isbn' => '9781593279288', 'total_copies' => 6, 'available_copies' => 5, 'image_path' => null],
            ['title' => 'JavaScript: The Good Parts', 'author' => 'Douglas Crockford', 'edition' => '1st Edition', 'publication_year' => 2008, 'isbn' => '9780596517748', 'total_copies' => 3, 'available_copies' => 2, 'image_path' => null],
            ['title' => 'Learning React', 'author' => 'Alex Banks, Eve Porcello', 'edition' => '2nd Edition', 'publication_year' => 2020, 'isbn' => '9781492051725', 'total_copies' => 4, 'available_copies' => 3, 'image_path' => null],
            ['title' => 'Node.js Design Patterns', 'author' => 'Mario Casciaro, Luciano Mammino', 'edition' => '3rd Edition', 'publication_year' => 2020, 'isbn' => '9781839214110', 'total_copies' => 2, 'available_copies' => 1, 'image_path' => null],
            ['title' => 'System Design Interview', 'author' => 'Alex Xu', 'edition' => '1st Edition', 'publication_year' => 2020, 'isbn' => '9781736049100', 'total_copies' => 5, 'available_copies' => 4, 'image_path' => null],
            ['title' => 'Database Design for Mere Mortals', 'author' => 'Michael J. Hernandez', 'edition' => '3rd Edition', 'publication_year' => 2013, 'isbn' => '9780321884497', 'total_copies' => 3, 'available_copies' => 2, 'image_path' => null],
            ['title' => 'HTTP: The Definitive Guide', 'author' => 'David Gourley, Brian Totty', 'edition' => '1st Edition', 'publication_year' => 2002, 'isbn' => '9781565925090', 'total_copies' => 2, 'available_copies' => 1, 'image_path' => null],
            ['title' => 'The DevOps Handbook', 'author' => 'Gene Kim, Jez Humble', 'edition' => '1st Edition', 'publication_year' => 2016, 'isbn' => '9781942788003', 'total_copies' => 4, 'available_copies' => 3, 'image_path' => null],
        ];

        foreach ($books as $book) {
            Book::create($book);
        }
    }
}

