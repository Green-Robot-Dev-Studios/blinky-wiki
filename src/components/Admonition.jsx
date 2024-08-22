import React from "react"

export default function ({type="plain", children, attributes}) {
    let colors = {
        "plain": "rgb(253, 253, 253)",
        "normal": "#ddffdd",
        "danger": "#ffdddd",
        "idea": "#fffedd",
    }

    return <div {...attributes} style={{backgroundColor: colors[type], margin: "1rem", padding: "1rem", borderRadius: "0.4rem", borderLeft: "#00000099", borderLeftWidth: "0.4rem", borderLeftStyle: "inset", boxShadow: "0 0 0px 1px"}}>
        {children}
    </div>
}
