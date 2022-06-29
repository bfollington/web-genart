var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { Frame } from './Frame';
import { Bezier } from './sketches/Bezier';
import { EyeballSoup } from './sketches/EyeballSoup';
import { AudioViz } from './sketches/SynthAudioNodeViz';
function App() {
    return (_jsx("div", __assign({ className: "App" }, { children: _jsx(Frame, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(EyeballSoup, {}) }), _jsx(Route, { path: "/eyeball-soup", element: _jsx(EyeballSoup, {}) }), _jsx(Route, { path: "/bezier", element: _jsx(Bezier, {}) }), _jsx(Route, { path: "/audio-viz", element: _jsx(AudioViz, {}) })] }) }) }) })));
}
export default App;
