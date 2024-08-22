import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    createEditor,
    Editor,
    Element as SlateElement,
    Node as SlateNode,
    Point,
    Range,
    Transforms,
    setNodes,
} from "slate";
import { withHistory } from "slate-history";
import {
    Editable,
    ReactEditor,
    Slate,
    useEditor,
    useSlateStatic,
    withReact,
} from "slate-react";
import JsxParser from "react-jsx-parser";

import Desmos from "./components/Desmos";
import Border from "./components/Border";
import Admonition from "./components/Admonition";
import Excalidraw from "./components/Excalidraw";
import Quiz from "./components/Quiz";

import "./editor.css";
import Quill from "./components/Quill";

const SHORTCUTS = {
    "*": "list-item",
    "-": "list-item",
    "+": "list-item",
    ">": "block-quote",
    "#": "heading-one",
    "##": "heading-two",
    "###": "heading-three",
    "####": "heading-four",
    "#####": "heading-five",
    "######": "heading-six",
};

const MarkdownShortcutsExample = () => {
    let [searchedComponent, setSearchedComponent] = useState("");
    let components = ["Desmos", "Excalidraw", "Admonition", "Quiz", "Math"];
    // console.log("searchedComp", searchedComponent);

    const renderElement = useCallback((props) => <Element {...props} />, []);
    const editor = useMemo(
        () =>
            withVoidComponents(
                withNewlineAfterBlock(
                    withShortcuts(withReact(withHistory(createEditor())))
                )
            ),
        []
    );

    const handleDOMBeforeInput = useCallback(
        (e) => {
            queueMicrotask(() => {
                const pendingDiffs = ReactEditor.androidPendingDiffs(editor);

                const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
                    if (!diff.text.endsWith(" ")) {
                        return false;
                    }

                    const { text } = SlateNode.leaf(editor, path);
                    const beforeText =
                        text.slice(0, diff.start) + diff.text.slice(0, -1);
                    if (!(beforeText in SHORTCUTS)) {
                        return;
                    }

                    const blockEntry = Editor.above(editor, {
                        at: path,
                        match: (n) =>
                            SlateElement.isElement(n) &&
                            Editor.isBlock(editor, n),
                    });
                    if (!blockEntry) {
                        return false;
                    }

                    const [, blockPath] = blockEntry;
                    return Editor.isStart(
                        editor,
                        Editor.start(editor, path),
                        blockPath
                    );
                });

                if (scheduleFlush) {
                    ReactEditor.androidScheduleFlush(editor);
                }
            });
        },
        [editor]
    );

    // console.log(editor);
    // editor.children.forEach((child, index) => {
    //     Transforms.setNodes(editor, [child], { at: [index] })
    // })

    const componentRef = useRef();
    const [targetRange, setTargetRange] = useState(null);

    useEffect(() => {
        if (targetRange) {
            const el = componentRef.current;
            const domRange = ReactEditor.toDOMRange(editor, targetRange);
            const rect = domRange.getBoundingClientRect();
            el.style.top = `${rect.top + window.scrollY + 24}px`;
            el.style.left = `${rect.left + window.scrollX}px`;
        }
    }, [editor, targetRange]);

    const initialValue = useMemo(
        () =>
            JSON.parse(localStorage.getItem("content")) || demoValue,
        []
    );

    return (
        <Slate
            editor={editor}
            initialValue={initialValue}
            onChange={(value) => {
                // console.log("change");
                const { selection } = editor;

                if (selection && Range.isCollapsed(selection)) {
                    const [start] = Range.edges(selection);
                    const wordBefore = Editor.before(editor, start, {
                        unit: "word",
                    });
                    const before =
                        wordBefore && Editor.before(editor, wordBefore);
                    const beforeRange =
                        before && Editor.range(editor, before, start);
                    const beforeText =
                        beforeRange && Editor.string(editor, beforeRange);
                    const beforeMatch =
                        beforeText && beforeText.match(/^<(\w+)$/);
                    const after = Editor.after(editor, start);
                    const afterRange = Editor.range(editor, start, after);
                    const afterText = Editor.string(editor, afterRange);
                    const afterMatch = afterText.match(/^(\s|$)/);

                    // console.log(beforeMatch, afterMatch);
                    if (beforeMatch && beforeMatch[1]) {
                        setSearchedComponent(beforeMatch[1]);
                        setTargetRange(beforeRange);
                        return;
                    }
                }

                setSearchedComponent("");
                setTargetRange(null);

                const isAstChange = editor.operations.some(
                    (op) => "set_selection" !== op.type
                );
                if (isAstChange) {
                    // Save the value to Local Storage.
                    const content = JSON.stringify(value);
                    localStorage.setItem("content", content);
                }
            }}
        >
            <Editable
                className="editor-container"
                onDOMBeforeInput={handleDOMBeforeInput}
                renderElement={renderElement}
                placeholder="Write some blinky..."
                renderPlaceholder={({ attributes, children }) => (
                    <span
                        {...attributes}
                        style={{
                            top: "unset",
                            position: "absolute",
                            fontStyle: "italic",
                            color: "gray",
                        }}
                    >
                        {children}
                    </span>
                )}
                spellCheck
                autoFocus
            />
            <div
                style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                }}
                ref={componentRef}
            >
                {searchedComponent &&
                    components
                        .filter((c) =>
                            c
                                .toLowerCase()
                                .startsWith(searchedComponent.toLowerCase())
                        )
                        .map((c) => {
                            return (
                                <button
                                    key={c}
                                    onClick={() => {
                                        let comp;
                                        switch (c) {
                                            case "Desmos":
                                                comp = {
                                                    type: "component-desmos",
                                                    exprs: "",
                                                    children: [{ text: "" }],
                                                };
                                                break;
                                            case "Admonition":
                                                comp = {
                                                    type: "component-admonition",
                                                    children: [{ text: "" }],
                                                };
                                                break;
                                            case "Excalidraw":
                                                comp = {
                                                    type: "component-excalidraw",
                                                    children: [{ text: "" }],
                                                };
                                                break;
                                            case "Quiz":
                                                comp = {
                                                    type: "component-quiz",
                                                    children: [{ text: "" }],
                                                };
                                                break;
                                            case "Math":
                                                comp = {
                                                    type: "component-quill",
                                                    latex: "",
                                                    children: [{ text: "" }],
                                                };
                                                break;
                                        }
                                        Transforms.setNodes(editor, comp);
                                    }}
                                >
                                    {c}
                                </button>
                            );
                        })}
            </div>
        </Slate>
    );
};

const withNewlineAfterBlock = (editor) => {
    const { normalizeNode } = editor;

    editor.normalizeNode = (entry) => {
        // console.log(editor);

        const [node, path] = entry;
        // console.log("at", node)
        // if there is a component that has no empty paragraph block after it, add it
        if (
            SlateElement.isElement(node) &&
            node.type.startsWith("component-")
        ) {
            // console.log("Checking nextNode: ", node, path, editor);
            let nextNode, nextPath;
            let prevNode, prevPath;
            try {
                [prevNode, prevPath] = Editor.previous(editor, { at: path });
                [nextNode, nextPath] = Editor.next(editor, { at: path });
            } catch {
                console.log("last el");
            }

            // const nextNode = nextPath && SlateNode.get(editor, nextPath);
            const isNextParagraph = nextNode && nextNode.type === "paragraph";
            const isEmptyNextParagraph =
                isNextParagraph && SlateNode.string(nextNode) === "";

            const isPrevParagraph = prevNode && prevNode.type === "paragraph";
            const isEmptyPrevParagraph =
                isPrevParagraph && SlateNode.string(nextNode) === "";

            let quit = false;

            if (!isEmptyNextParagraph) {
                console.log("Adding under");
                prevPath[0]++;

                Transforms.insertNodes(
                    editor,
                    {
                        type: "paragraph",
                        children: [{ text: "" }],
                    },
                    { at: nextPath }
                );
                quit = true;
            }

            if (!isEmptyPrevParagraph) {
                console.log("Adding over");
                Transforms.insertNodes(
                    editor,
                    {
                        type: "paragraph",
                        children: [{ text: "" }],
                    },
                    { at: prevPath }
                );
                quit = true;
            }

            if (quit) return;
        }

        // Fall back to the original `normalizeNode` to enforce other constraints.
        normalizeNode(entry);
    };

    return editor;
};

const withVoidComponents = (editor) => {
    editor.isVoid = (element) => {
        return (
            element.type === "component-border" ||
            element.type === "component-desmos" ||
            element.type === "component-excalidraw" ||
            element.type === "component-quiz" ||
            element.type === "component-quill"
        );
    };

    return editor;
};

const withShortcuts = (editor) => {
    const { deleteBackward, insertText } = editor;

    editor.insertText = (text) => {
        const { selection } = editor;

        if (text.endsWith(" ") && selection && Range.isCollapsed(selection)) {
            const { anchor } = selection;
            const block = Editor.above(editor, {
                match: (n) =>
                    SlateElement.isElement(n) && Editor.isBlock(editor, n),
            });
            const path = block ? block[1] : [];
            const start = Editor.start(editor, path);
            const range = { anchor, focus: start };
            const beforeText = Editor.string(editor, range) + text.slice(0, -1);
            const type = SHORTCUTS[beforeText];

            if (type) {
                Transforms.select(editor, range);

                if (!Range.isCollapsed(range)) {
                    Transforms.delete(editor);
                }

                const newProperties = {
                    type,
                };
                Transforms.setNodes(editor, newProperties, {
                    match: (n) =>
                        SlateElement.isElement(n) && Editor.isBlock(editor, n),
                });

                if (type === "list-item") {
                    const list = {
                        type: "bulleted-list",
                        children: [],
                    };
                    Transforms.wrapNodes(editor, list, {
                        match: (n) =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            n.type === "list-item",
                    });
                }

                return;
            }
        }

        insertText(text);
    };

    editor.deleteBackward = (...args) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const match = Editor.above(editor, {
                match: (n) =>
                    SlateElement.isElement(n) && Editor.isBlock(editor, n),
            });

            if (match) {
                const [block, path] = match;
                const start = Editor.start(editor, path);

                if (
                    !Editor.isEditor(block) &&
                    SlateElement.isElement(block) &&
                    block.type !== "paragraph" &&
                    Point.equals(selection.anchor, start)
                ) {
                    const newProperties = {
                        type: "paragraph",
                    };
                    Transforms.setNodes(editor, newProperties);

                    if (block.type === "list-item") {
                        Transforms.unwrapNodes(editor, {
                            match: (n) =>
                                !Editor.isEditor(n) &&
                                SlateElement.isElement(n) &&
                                n.type === "bulleted-list",
                            split: true,
                        });
                    }

                    return;
                }
            }

            deleteBackward(...args);
        }
    };

    return editor;
};

const Element = ({ attributes, children, element }) => {
    const editor = useSlateStatic();

    switch (element.type) {
        case "block-quote":
            return <blockquote {...attributes}>{children}</blockquote>;
        case "bulleted-list":
            return <ul {...attributes}>{children}</ul>;
        case "heading-one":
            return <h1 {...attributes}>{children}</h1>;
        case "heading-two":
            return <h2 {...attributes}>{children}</h2>;
        case "heading-three":
            return <h3 {...attributes}>{children}</h3>;
        case "heading-four":
            return <h4 {...attributes}>{children}</h4>;
        case "heading-five":
            return <h5 {...attributes}>{children}</h5>;
        case "heading-six":
            return <h6 {...attributes}>{children}</h6>;
        case "list-item":
            return <li {...attributes}>{children}</li>;
        case "component-admonition":
            return <Admonition attributes={attributes}>{children}</Admonition>;
        case "component-border":
            return <Border attributes={attributes}>{children}</Border>;
        case "component-desmos":
            const setExprs = (exprs) => {
                const ownPath = ReactEditor.findPath(editor, element);
                const updateSelf = () => {
                    setNodes(
                        editor,
                        {
                            exprs: exprs,
                        },
                        {
                            at: ownPath,
                        }
                    );
                };
                updateSelf();
            };
            return (
                <Desmos
                    exprs={element.exprs}
                    setExprs={setExprs}
                    attributes={attributes}
                >
                    {children}
                </Desmos>
            );
        case "component-excalidraw":
            return <Excalidraw attributes={attributes}>{children}</Excalidraw>;
        case "component-quiz":
            return <Quiz attributes={attributes}>{children}</Quiz>;
        case "component-quill":
            const setLatex = (latex) => {
                const ownPath = ReactEditor.findPath(editor, element);
                const updateSelf = () => {
                    setNodes(
                        editor,
                        {
                            latex: latex,
                        },
                        {
                            at: ownPath,
                        }
                    );
                };
                updateSelf();
            };

            return (
                <Quill
                    latex={element.latex}
                    setLatex={setLatex}
                    attributes={attributes}
                >
                    {children}
                </Quill>
            );
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const demoValue = [
    {
        type: "heading-one",
        children: [
            {
                text: "Hi! This is mdx.",
            },
        ],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "But it has been expanded.",
            },
        ],
    },
    {
        type: "component-admonition",
        children: [
            { type: "paragraph", children: [{ text: "Nested formatting!" }] },
        ],
    },
    { type: "paragraph", children: [{ text: "" }] },
    {
        type: "component-desmos",
        exprs: [],
        children: [{ text: "" }],
    },
    { type: "paragraph", children: [{ text: "" }] },
    {
        type: "component-excalidraw",
        children: [{ text: "" }],
    },
    { type: "paragraph", children: [{ text: "" }] },
    {
        type: "component-quiz",
        children: [{ text: "" }],
    },
    { type: "paragraph", children: [{ text: "" }] },
    {
        type: "component-quill",
        latex: "",
        children: [{ text: "" }],
    },
    { type: "paragraph", children: [{ text: "" }] },
];

export default MarkdownShortcutsExample;
