<?php

namespace App\Enums;

enum BookStatus: string
{
    case AVAILABLE = 'available';
    case OUT_OF_STOCK = 'out_of_stock';
}

