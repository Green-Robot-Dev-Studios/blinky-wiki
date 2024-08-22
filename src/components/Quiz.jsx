import React, { createRef, useEffect, useRef, useState } from "react";
// import Admonition from "@theme/Admonition";
import katex from "katex/dist/contrib/auto-render";
import Admonition from "./Admonition";

const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export default ({
    question = "Question?",
    answers = ["A", "B", "C", "D"],
    correct = answers[0],
    children,
    attributes,
}) => {
    let shuffle = true;
    if (answers[0] == "A" || answers[0] == "a") shuffle = false;
    const [isClient, setIsClient] = useState(false)
    const form = useRef();

    let quiz = createRef(null);
    useEffect(() => {
        setIsClient(true)
        if (quiz.current) 
            katex(quiz.current, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false },
                    { left: "\\(", right: "\\)", display: false },
                    { left: "\\[", right: "\\]", display: true },
                ],
            });
    });

    const handleClick = () => {
        // const selected = document.querySelector('input[name="answer"]:checked');

        // use form ref to get checked box
        const selected = form.current.querySelector('input[name="answer"]:checked');

        if (!selected) return;
        if (selected.value === correct) {
            selected.parentElement.style.backgroundColor = "#8bc34a";
        } else {
            selected.parentElement.style.backgroundColor = "#f44336";
        }
        form.current.querySelectorAll('input[name="answer"]').forEach((input) => {
            if (input.value === correct) {
                input.parentElement.style.backgroundColor = "#8bc34a";
            }
            input.disabled = true;
        });
    }

    if (!isClient) return <></> 
    return (
        <Admonition type="normal" title="Quiz" icon="📋" attributes={attributes}>
            <div id="quiz" ref={quiz} contentEditable={false}>
                <h3>{question}</h3>
                {children}
                <form id="answers" ref={form}>
                    {(shuffle ? shuffleArray(answers) : answers).map(
                        (answer, i) => (
                            <div key={i} className="answer" style={{padding: "0.2rem"}}>
                                <input
                                    type="radio"
                                    id={`answer-${i}`}
                                    name="answer"
                                    value={answer}
                                />
                                <label htmlFor={`answer-${i}`} id="answer" style={{marginLeft: "1rem"}}>
                                    {answer}
                                </label>
                            </div>
                        )
                    )}
                </form>
                {/* backgroundColor: "#8bc34a" */}
                <button onClick={handleClick} id="submit" style={{padding: "0.3rem", paddingLeft: "0.5rem", paddingRight: "0.5rem", marginTop: "0.4rem", borderRadius: "0.3rem", borderColor: "#0000005c"}}>Check</button>
            </div>
        </Admonition>
    );
};
