<?php

namespace App\Controller\API;

use App\Entity\Comment;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Security;

class CreatComment extends AbstractController
{
    public function __invoke(Comment $data)
    {
        $data->setAuthor($this->getUser());

        return $data;
    }
}