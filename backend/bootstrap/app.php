<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                $statusCode = 500;
                $message = 'Server Error';
                $errors = [];

                if ($e instanceof ValidationException) {
                    $statusCode = 422;
                    $message = 'The given data was invalid.';
                    $errors = $e->errors();
                } elseif ($e instanceof AuthenticationException) {
                    $statusCode = 401;
                    $message = 'Unauthenticated.';
                } elseif ($e instanceof AuthorizationException || $e instanceof AccessDeniedHttpException) {
                    $statusCode = 403;
                    $message = $e->getMessage() ?: 'This action is unauthorized.';
                } elseif ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                    $statusCode = 404;
                    $message = 'Resource not found.';
                } else {
                    $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                    $message = config('app.debug') ? $e->getMessage() : 'Server Error';
                }

                $response = [
                    'success' => false,
                    'message' => $message,
                    'meta'    => [
                        'timestamp' => now()->toIso8601String(),
                    ],
                ];

                if (! empty($errors)) {
                    $response['errors'] = $errors;
                }

                // Add trace if debug is true
                if (config('app.debug') && $statusCode >= 500) {
                    $response['trace'] = $e->getTrace();
                }

                return response()->json($response, $statusCode);
            }
        });
    })->create();
