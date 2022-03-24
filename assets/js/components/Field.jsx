import React from "react";

export const Field = React.forwardRef(({help,name,children}, ref) => {
    return <div className="form-group">
        <label htmlFor={name} className="control-label">{children}</label>
        <textarea ref={ref} className="form-control" name={name} id={name} cols="30" rows="10"/>
        {help && <div className="help-block">Help</div>}
    </div>
})