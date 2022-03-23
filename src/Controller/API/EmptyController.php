<?php

namespace App\Controller\API;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class EmptyController
{
    public function __invoke()
    {
        return new JsonResponse();
    }
}