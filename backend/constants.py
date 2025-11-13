from enum import IntEnum


class LoanLimits(IntEnum):
    MAX_BOOKS_PER_MEMBER = 5
    LOAN_DURATION_DAYS = 14


class FineRates(IntEnum):
    FINE_PER_DAY = 1000

