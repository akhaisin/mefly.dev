import { jsxs as v, jsx as r } from "react/jsx-runtime";
import { useState as w, useRef as g, useEffect as f } from "react";
import { useLocation as E, useNavigate as y } from "react-router-dom";
const N = "_root_1ildn_1", L = "_trigger_1ildn_12", b = "_menu_1ildn_33", x = "_item_1ildn_42", k = "_disabled_1ildn_58", S = "_icon_1ildn_62", I = "_label_1ildn_70", A = "_devOnly_1ildn_79", O = "_active_1ildn_87", i = {
  root: N,
  trigger: L,
  menu: b,
  item: x,
  disabled: k,
  icon: S,
  label: I,
  devOnly: A,
  active: O
};
function T({ items: o, activeId: d, style: u, activationMode: l = "click", onSelect: c }) {
  const [s, t] = w(!1), a = g(null);
  f(() => {
    if (!s || l !== "click") return;
    function e(m) {
      a.current && !a.current.contains(m.target) && t(!1);
    }
    function n(m) {
      m.key === "Escape" && t(!1);
    }
    return document.addEventListener("mousedown", e), document.addEventListener("keydown", n), () => {
      document.removeEventListener("mousedown", e), document.removeEventListener("keydown", n);
    };
  }, [s, l]), f(() => {
    if (l !== "hover" || !a.current) return;
    const e = a.current, n = () => t(!0), m = () => t(!1);
    return e.addEventListener("mouseenter", n), e.addEventListener("mouseleave", m), () => {
      e.removeEventListener("mouseenter", n), e.removeEventListener("mouseleave", m);
    };
  }, [l]);
  function h(e, n) {
    c && (e.preventDefault(), c(n)), t(!1);
  }
  return /* @__PURE__ */ v("div", { ref: a, className: i.root, style: u, children: [
    s && /* @__PURE__ */ r("ul", { className: i.menu, children: o.map((e) => /* @__PURE__ */ r("li", { children: e.disabled ? /* @__PURE__ */ v("span", { className: `${i.item} ${i.disabled}`, children: [
      /* @__PURE__ */ r("img", { src: e.iconUrl, alt: "", className: i.icon }),
      /* @__PURE__ */ r("span", { className: i.label, children: e.label })
    ] }) : /* @__PURE__ */ v(
      "a",
      {
        href: e.url,
        className: [
          i.item,
          e.devOnly ? i.devOnly : "",
          e.id === d ? i.active : ""
        ].filter(Boolean).join(" "),
        onClick: (n) => h(n, e),
        children: [
          /* @__PURE__ */ r("img", { src: e.iconUrl, alt: "", className: i.icon }),
          /* @__PURE__ */ r("span", { className: i.label, children: e.label })
        ]
      }
    ) }, e.id)) }),
    /* @__PURE__ */ r(
      "button",
      {
        className: i.trigger,
        onClick: l === "click" ? () => t((e) => !e) : void 0,
        "aria-label": "Open navigation menu",
        "aria-expanded": s,
        children: /* @__PURE__ */ v("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": "true", children: [
          /* @__PURE__ */ r("rect", { x: "1", y: "1", width: "6", height: "6", rx: "1" }),
          /* @__PURE__ */ r("rect", { x: "9", y: "1", width: "6", height: "6", rx: "1" }),
          /* @__PURE__ */ r("rect", { x: "1", y: "9", width: "6", height: "6", rx: "1" }),
          /* @__PURE__ */ r("rect", { x: "9", y: "9", width: "6", height: "6", rx: "1" })
        ] })
      }
    )
  ] });
}
const _ = [];
function p(o, d, u) {
  return !!(d.includes(o) || u && /^https?:\/\/localhost(:\d+)?$/.test(o));
}
function M({
  trustedOrigins: o = _,
  allowLocalhost: d = !0,
  style: u,
  activationMode: l
}) {
  const [c, s] = w(null);
  if (f(() => {
    function h(e) {
      if (!p(e.origin, o, d)) return;
      const n = e.data;
      (n == null ? void 0 : n.type) === "MEFLY_MENU" && s({ items: n.items, activeId: n.activeId });
    }
    return window.addEventListener("message", h), () => window.removeEventListener("message", h);
  }, [o, d]), !c || c.items.length === 0) return null;
  const t = window.parent !== window;
  function a(h) {
    window.parent.postMessage({ type: "MEFLY_NAV_SELECT", item: h }, "*");
  }
  return /* @__PURE__ */ r(
    T,
    {
      items: c.items,
      activeId: c.activeId,
      style: u,
      activationMode: l,
      onSelect: t ? a : void 0
    }
  );
}
function R(o = _, d = !0) {
  const u = E(), l = y();
  f(() => {
    window.parent !== window && window.parent.postMessage(
      { type: "HASH_CHANGED", hash: u.hash, pathname: u.pathname },
      "*"
    );
  }, [u]), f(() => {
    if (window.parent === window) return;
    function c(s) {
      var h;
      if (!p(s.origin, o, d) || ((h = s.data) == null ? void 0 : h.type) !== "NAVIGATE_TO_HASH" || s.data.hash === void 0) return;
      const t = s.data.hash, a = t.startsWith("#") ? t.slice(1) : t;
      if (a.startsWith("/"))
        l(a);
      else {
        const e = `#${a}`;
        window.location.hash !== e && (window.location.hash = e);
      }
    }
    return window.addEventListener("message", c), () => window.removeEventListener("message", c);
  }, [o, d, l]);
}
export {
  T as MeflyNav,
  M as MeflyNavReceiver,
  R as useHostSync
};
