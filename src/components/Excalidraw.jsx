import React from "react";
import Admonition from "./Admonition";
import { Excalidraw } from "@excalidraw/excalidraw";
import LeftEdge from "./LeftEdge";

export default function (props) {
    return (
        <LeftEdge attributes={props.attributes}>
            <div style={{ height: "500px" }} contentEditable={false}>
                {props.children}
                <Excalidraw initialData={props.file} />
            </div>
        </LeftEdge>
    );
}
