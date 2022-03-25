import {render, unmountComponentAtNode} from "react-dom";
import React, {useCallback, useEffect, useRef} from "react";
import {useFetch, usePaginatedFetch} from "./hooks";
import {Icon} from "../components/Icon";
import {Field} from "../components/Field";

const dateFormat = {
    dateStyle: 'medium',
    timeStyle: 'short'
}

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

    return <div>
        {user && <CommentForm post={post} onComment={addComment}/>}
        <Title count={count}/>
        {comments.map(c => <Comment key={c.id} comment={c} canEdit={c.author.id === user} onDelete={deleteComment}/>)}
        {hasMore && <button disabled={loading} onClick={load} className="btn btn-primary">Load More Comments</button>}
    </div>
}

const CommentForm = React.memo(({post, onComment}) => {
    const ref = useRef(null)
    const onSuccess = useCallback(comment => {
        onComment(comment)
        ref.current.value = ''
    }, [ref, onComment])
    const {load, loading, errors, clearError} = useFetch('/api/comments', 'POST', onSuccess)
    const onSubmit = useCallback(e => {
        e.preventDefault()
        load({
            content: ref.current.value,
            post: '/api/posts/' + post
        })

    }, [load, ref, post])
    return <div className="well">
        <form onSubmit={onSubmit}>
            <fieldset>
                <legend>
                    <Icon icon="comment"/>Leave Comment
                </legend>
            </fieldset>
            <Field ref={ref} onChange={clearError.bind(this, 'content')} required minLength={5} name="content"
                   help="help" error={errors['content']}>Your Comment:</Field>
            <div className="form-group">
                <button className="btn btn-primary" disabled={loading}>
                    <Icon icon="paper-plane"/> Comment
                </button>
            </div>
        </form>
    </div>
})

const Comment = React.memo(({comment, onDelete, canEdit}) => {
    const date = new Date(comment.publishedAt)

    const onDeleteCallback = useCallback(() => {
        onDelete(comment)
    }, [comment])

    const {loading: loadingDelete, load: loadDelete} = useFetch(comment['@id'], 'DELETE', onDeleteCallback)

    return <div className="row post-comment">
        <h4 className="col-sm-3">
            <strong>{comment.author.username}</strong>
            commented:
            <strong>{date.toLocaleString(undefined, dateFormat)}</strong>
        </h4>
        <div className="col-sm-9">
            <p>{comment.content}</p>
            {canEdit &&
                <p>
                    <button className="btn btn-danger" onClick={loadDelete.bind(this, null)} disabled={loadingDelete}>
                       <Icon icon="trash" /> Delete
                    </button>
                </p>
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

    connectedCallback() {
        const post = parseInt(this.dataset.post, 10)
        const user = parseInt(this.dataset.user, 10) || null
        render(<Comments post={post} user={user}/>, this)
    }

    disconnectedCallback() {
        unmountComponentAtNode(this)
    }
}

customElements.define('post-comment', CommentsElement)