<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontReport = [
        //
    ];

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e)
    {
        // Match FastAPI error format: {"detail": "message"}
        if ($e instanceof ValidationException) {
            return response()->json([
                'detail' => $e->getMessage()
            ], 422);
        }

        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            return response()->json([
                'detail' => 'Not found'
            ], 404);
        }

        // For other exceptions, return FastAPI-style error format
        if ($request->expectsJson()) {
            $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
            return response()->json([
                'detail' => $e->getMessage() ?: 'Internal server error'
            ], $statusCode);
        }

        return parent::render($request, $e);
    }
}

