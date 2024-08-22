import React, { useEffect, useRef } from "react";
import Admonition from "./Admonition";
import LeftEdge from "./LeftEdge";

export default ({ exprs, setExprs, attributes, children }) => {
    useEffect(() => {
        const body = document.body;
        const script = document.createElement("script");
        const url =
            "https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
        script.setAttribute("src", url);
        script.onload = () => {
            const scriptBody = document.createElement("script");
            let scriptBodyText = `
                if (typeof variable === 'undefined') {
                    console.log('Desmos not loaded')
                    const elt = document.getElementById('calculator'); 
                    window.calculator = Desmos.GraphingCalculator(elt);
                }
            `;

            // cells &&
            //     cells.forEach((cell, i) => {
            //         scriptBodyText += `
            //         window.calculator.setExpression({ id: '${i}', latex: '${cell}' });
            //     `;
            //     });
            scriptBody.innerHTML = scriptBodyText;
            body.appendChild(scriptBody);


            window.calculator.observeEvent("change", () => {
                if (window.calculator) {
                    const expressions = window.calculator.getExpressions();
                    setExprs(expressions);
                }
            })
        };
        body.appendChild(script);
    }, []);

    if (window.calculator && window.calculator.setExpressions) {
        window.calculator.setExpressions(exprs.map(({domain, ...keep}) => keep));
    }

    return (
        <LeftEdge
            attributes={attributes}
            color={"#3dff14"}
        >
            {children}
            <div contentEditable={false} id="calculator" style={{ width: "100%", height: 500 }}></div>
        </LeftEdge>
    );
};
