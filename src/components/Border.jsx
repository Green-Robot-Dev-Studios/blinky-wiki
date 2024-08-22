import React from 'react'

export default (props) => {
    return (
        <div {...props.attributes} style={{borderWidth: 2}}>
            {props.children}
        </div>
    )
};
