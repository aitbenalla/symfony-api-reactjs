import {render, unmountComponentAtNode} from "react-dom";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useFetch, usePaginatedFetch} from "./hooks";
import {Icon} from "../components/Icon";
import {Field} from "../components/Field";

const dateFormat = {
    dateStyle: 'medium',
    timeStyle: 'short'
}

const VIEW = 'VIEW'
const EDIT = 'EDIT'

function Comments({post, user}) {

    const {items : comments, setItems: setComments, load, count, loading, hasMore} = usePaginatedFetch('/api/comments?post=' + post)

    useEffect(() => {
        load()
    }, [])

    const addComment = useCallback(comment => {
        setComments(comments => [comment, ...comments])
    }, [])

    const deleteComment = useCallback(comment => {
        setComments(comments => comments.filter(c => c !== comment))
    }, [])

    const updateComment = useCallback((newComment, oldComment) => {
        setComments(comments => comments.map(c => c === oldComment ? newComment : c))
    }, [])

    return <div>
        {user && <CommentForm post={post} onComment={addComment}/>}
        <Title count={count}/>
        {comments.map(c => <Comment key={c.id} comment={c} canEdit={c.author.id === user} onDelete={deleteComment} onUpdate={updateComment}/>)}
        {hasMore && <button disabled={loading} onClick={load} className="btn btn-primary">Load More Comments</button>}
    </div>
}

const CommentForm = React.memo(({post = null, onComment, comment = null, onCancel = null}) => {
    const ref = useRef(null)
    const method = comment ? 'PUT' : 'POST'
    const url = comment ? comment['@id'] : '/api/comments'
    const onSuccess = useCallback(comment => {
        onComment(comment)
        ref.current.value = ''
    }, [ref, onComment])
    const {load, loading, errors, clearError} = useFetch(url, method, onSuccess)
    const onSubmit = useCallback(e => {
        e.preventDefault()
        load({
            content: ref.current.value,
            post: '/api/posts/' + post
        })

    }, [load, ref, post])

    useEffect(() => {
        if (comment && comment.content && ref.current)
            ref.current.value = comment.content
    }, [comment, ref])

    return <div className="well">
        <form onSubmit={onSubmit}>
            {comment === null &&
            <fieldset>
                <legend>
                    <Icon icon="comment"/>Leave Comment
                </legend>
            </fieldset>
            }
            <Field ref={ref} onChange={clearError.bind(this, 'content')} required minLength={5} name="content"
                   help="help" error={errors['content']}>Your Comment:</Field>
            <div className="form-group">
                <button className="btn btn-primary" disabled={loading}>
                    <Icon icon="paper-plane"/> {comment === null ? 'Add Comment' : 'Update Comment'}
                </button>
                {onCancel && <button className="btn btn-default" onClick={onCancel}>Cancel</button>}
            </div>
        </form>
    </div>
})

const Comment = React.memo(({comment, onDelete, canEdit, onUpdate}) => {

    const date = new Date(comment.publishedAt)

    const [state, setState] = useState(VIEW)
    
    const toggleEdit = useCallback(() => setState(state => state === VIEW ? EDIT : VIEW), [])

    const onComment = useCallback((newComment) => {
        onUpdate(newComment, comment)
        toggleEdit()
    }, [comment])

    const onDeleteCallback = useCallback(() => onDelete(comment), [comment])

    const {loading: loadingDelete, load: loadDelete} = useFetch(comment['@id'], 'DELETE', onDeleteCallback)

    return <div className="row post-comment">
        <h4 className="col-sm-3">
            <strong>{comment.author.username}</strong>
            commented:
            <strong>{date.toLocaleString(undefined, dateFormat)}</strong>
        </h4>
        <div className="col-sm-9">
            {state === VIEW ? <p>{comment.content}</p> : <CommentForm comment={comment} onComment={onComment} onCancel={toggleEdit} />}
            {(canEdit && state !== EDIT) &&
                <div className="btn-group" role="group" aria-label="Basic example">
                    <button className="btn btn-sm btn-danger" onClick={loadDelete.bind(this, null)} disabled={loadingDelete}>
                       <Icon icon="trash" /> Delete
                    </button>
                    <button className="btn btn-sm btn-default" onClick={toggleEdit}>
                        <Icon icon="pen" /> Edit
                    </button>
                </div>
            }
        </div>

    </div>
})

function Title({count}) {
    return <h3>
        <Icon icon={'comments'}/> {count} Comment{count > 1 ? 's' : ''}
    </h3>
}

class CommentsElement extends HTMLElement {

    constructor() {
        super();
        this.observer = null
    }

    connectedCallback() {
        const post = parseInt(this.dataset.post, 10)
        const user = parseInt(this.dataset.user, 10) || null
        if (this.observer === null)
        {
            this.observer = new IntersectionObserver((entries, observer  ) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.target === this)
                    {
                        observer.disconnect()
                        render(<Comments post={post} user={user}/>, this)
                    }

                })
            })
        }

        this.observer.observe(this)
    }

    disconnectedCallback() {
        if (this.observer)
        {
            this.observer.disconnect()
        }
        unmountComponentAtNode(this)
    }
}

customElements.define('post-comment', CommentsElement)