<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Annotation\ApiResource;
use App\Controller\API\CreatComment;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\SearchFilter;
use function Symfony\Component\String\u;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity
 * @ORM\Table(name="symfony_demo_comment")
 * Defines the properties of the Comment entity to represent the blog comments.
 * See https://symfony.com/doc/current/doctrine.html#creating-an-entity-class
 *
 * Tip: if you have an existing database, you can generate these entity class automatically.
 * See https://symfony.com/doc/current/doctrine/reverse_engineering.html
 *
 * @author Ryan Weaver <weaverryan@gmail.com>
 * @author Javier Eguiluz <javier.eguiluz@gmail.com>
 */
#[
    ApiResource(
    collectionOperations: [
        'get',
        'post'=>[
            'controller' => CreatComment::class,
            'security' => 'is_granted("IS_AUTHENTICATED_FULLY")',
            'denormalization_context' => ['groups'=> ['create:comment']]
        ]
    ],
    itemOperations: [
        'get' => ['normalization_context' => ['groups'=> ['read:comment' , 'read:full:comment']]],
        'put' => [
            'security' => 'is_granted("EDIT_COMMENT", object)',
            'denormalization_context' => ['groups'=> ['update:comment']]
        ],
        'delete' => ['security' => 'is_granted("EDIT_COMMENT", object)'],
    ],
    attributes: [
        'order' => ['publishedAt' => 'DESC']
    ],
    normalizationContext: ['groups' => ['read:comment']],
    paginationItemsPerPage: 2
),
    ApiFilter(SearchFilter::class, properties: ['post'=>'exact'])
]
class Comment
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    #[Groups(['read:comment'])]
    private ?int $id = null;

    /**
     * @ORM\ManyToOne(targetEntity="Post", inversedBy="comments")
     * @ORM\JoinColumn(nullable=false)
     */
    #[Groups(['read:full:comment', 'create:comment'])]
    private ?Post $post = null;

    /**
     * @ORM\Column(type="text")
     */
    #[
        Assert\NotBlank(message: 'comment.blank'),
        Assert\Length(
            min: 5,
            max: 10000,
            minMessage: 'comment.too_short',
            maxMessage: 'comment.too_long',
        ),
        Groups(['read:comment', 'create:comment', 'update:comment'])
    ]
    private ?string $content = null;

    /**
     * @ORM\Column(type="datetime")
     */
    #[Groups(['read:comment'])]
    private \DateTime $publishedAt;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User")
     * @ORM\JoinColumn(nullable=false)
     */
    #[Groups(['read:comment'])]
    private ?User $author = null;

    public function __construct()
    {
        $this->publishedAt = new \DateTime();
    }

    #[Assert\IsTrue(message: 'comment.is_spam')]
    public function isLegitComment(): bool
    {
        $containsInvalidCharacters = null !== u($this->content)->indexOf('@');

        return !$containsInvalidCharacters;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): void
    {
        $this->content = $content;
    }

    public function getPublishedAt(): \DateTime
    {
        return $this->publishedAt;
    }

    public function setPublishedAt(\DateTime $publishedAt): void
    {
        $this->publishedAt = $publishedAt;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(User $author): void
    {
        $this->author = $author;
    }

    public function getPost(): ?Post
    {
        return $this->post;
    }

    public function setPost(Post $post): void
    {
        $this->post = $post;
    }
}
