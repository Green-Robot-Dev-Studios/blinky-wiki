import React, { useState } from "react";
import { addStyles, EditableMathField } from "react-mathquill";

addStyles();

export default function ({ latex, setLatex, attributes, children }) {
    return (
        <div {...attributes} contentEditable={false}>
            {children}
            <EditableMathField
                latex={latex}
                onChange={(mathField) => {
                    setLatex(mathField.latex());
                }}
            />
            <p style={{color: "#00000057"}}>{latex}</p>
        </div>
    );
}
