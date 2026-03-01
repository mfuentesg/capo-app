import * as React from "react"

const PanelGroup = ({ children, ...props }) => React.createElement("div", props, children)
const Panel = ({ children, ...props }) => React.createElement("div", props, children)
const PanelResizeHandle = ({ children, ...props }) => React.createElement("div", props, children)

export { PanelGroup, Panel, PanelResizeHandle }
