import {render, unmountComponentAtNode} from "react-dom";
import React, {useEffect, useRef} from "react";
import {usePaginatedFetch} from "./hooks";
import {Icon} from "../components/Icon";
import {Field} from "../components/Field";

const dateFormat = {
    dateStyle: 'medium',
    timeStyle: 'short'
}

function Comments({post, user}) {
    const {items, load, count, loading, hasMore} = usePaginatedFetch('/api/comments?post='+post)
    useEffect(() => {
        load()
    }, [])

    return <div>
        <Title count={count} />
        {user && <CommentForm post={post} />}
        {loading && 'Loading...'}
        {items.map(c => <Comment key={c.id} comment={c} /> )}
        {hasMore && <button disabled={loading} onClick={load} className="btn btn-primary">Load More Comments</button>}
    </div>
}

function CommentForm ({post})
{
    const ref = useRef(null)
    console.log(ref)
    return <div className="well">
        <form>
            <fieldset>
                <legend>
                    <Icon icon="comment" />Leave Comment
                </legend>
            </fieldset>
            <Field ref={ref} name="content" help="help">Your Comment:</Field>
            <div className="form-group">
                <button className="btn btn-primary">
                    <Icon icon="paper-plane" /> Comment
                </button>
            </div>
        </form>
    </div>
}

const Comment = React.memo(({comment}) =>
{
    console.log('render')
    const date = new Date(comment.publishedAt)

    return <div className="row post-comment">
        <h4 className="col-sm-3">
            <strong>{comment.author.username}</strong>
            commented:
            <strong>{date.toLocaleString(undefined, dateFormat)}</strong>
        </h4>
        <div className="col-sm-9">
            <p>{comment.content}</p>
        </div>

    </div>
})

function Title({count})
{
    return <h3>
        <Icon icon={'comments'} /> {count} Comment{count > 1 ? 's' : ''}
    </h3>
}

class CommentsElement extends HTMLElement {

    connectedCallback ()
    {
        const post = parseInt(this.dataset.post, 10)
        const user = parseInt(this.dataset.user, 10) || null
        render(<Comments post={post} user={user}/>, this)
    }

    disconnectedCallback ()
    {
        unmountComponentAtNode(this)
    }
}

customElements.define('post-comment', CommentsElement)