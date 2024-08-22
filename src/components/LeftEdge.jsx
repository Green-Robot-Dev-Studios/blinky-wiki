import React from "react"

export default function ({color, children, attributes}) {
    return <div {...attributes} style={{margin: "1rem", borderRadius: "0.4rem", borderLeft: color, borderLeftWidth: "0.4rem", borderLeftStyle: "inset", overflow: "hidden", boxShadow: "0 0 0px 1px"}}>
        {children}
    </div>
}
