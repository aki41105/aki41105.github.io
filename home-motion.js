(() => {
  "use strict";

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const report = (area, error) => console.error(`[Home motion: ${area}]`, error);
  const safeHandler = (area, handler) => (...args) => {
    try {
      return handler(...args);
    } catch (error) {
      report(area, error);
      return undefined;
    }
  };
  const listen = (target, type, handler, options, area = type) => {
    if (target) target.addEventListener(type, safeHandler(area, handler), options);
  };

  const start = () => {
    const body = document.body;
    const main = body && body.querySelector("main");
    const canvas = document.getElementById("homeRippleCanvas");
    if (!body || !body.classList.contains("home-page") || !main || !(canvas instanceof HTMLCanvasElement)) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ripples = [];
    const excludedSelector = [
      "a",
      "button",
      "input",
      "textarea",
      "select",
      "option",
      "label",
      "img",
      "picture",
      "figure",
      "canvas",
      "summary",
      "[contenteditable='true']",
      "[role='button']",
      "[role='link']",
      ".card",
      ".membership-card",
      ".publication-card",
      ".timeline-item",
      ".gallery-card",
      ".resource-card",
      ".contact-card",
    ].join(",");

    let width = 1;
    let height = 1;
    let frame = 0;
    let lastTime = null;
    let documentVisible = !document.hidden;
    let pointerStart = null;
    let lastPointerRipple = 0;
    let rippleColor = "#3d8587";

    const maxRipples = () => (window.matchMedia("(max-width: 600px)").matches ? 6 : 8);

    const readColor = () => {
      const styles = getComputedStyle(body);
      return styles.getPropertyValue("--ripple-color").trim()
        || styles.getPropertyValue("--color-heading").trim()
        || "#3d8587";
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      if (!ripples.length) return;

      context.save();
      context.strokeStyle = rippleColor;
      ripples.forEach((ripple) => {
        const progress = clamp(ripple.age / ripple.duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 2.2);
        const radius = 5 + eased * Math.min(width, height) * 0.34 * ripple.strength;
        const x = ripple.pageX - window.scrollX;
        const y = ripple.pageY - window.scrollY;

        context.globalAlpha = Math.pow(1 - progress, 1.5) * 0.62;
        context.lineWidth = 0.8 + (1 - progress) * 1.2;
        for (let ring = 0; ring < 3; ring += 1) {
          const ringRadius = radius - ring * 13;
          if (ringRadius <= 0) continue;
          context.beginPath();
          context.ellipse(x, y, ringRadius, ringRadius * 0.42, 0, 0, Math.PI * 2);
          context.stroke();
        }
      });
      context.restore();
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = null;
    };

    const tick = safeHandler("pond ripple frame", (time) => {
      frame = 0;
      if (reducedMotion.matches || !documentVisible) {
        lastTime = null;
        draw();
        return;
      }

      const delta = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      ripples.forEach((ripple) => {
        ripple.age += delta;
      });
      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        if (ripples[index].age >= ripples[index].duration) ripples.splice(index, 1);
      }
      draw();
      if (ripples.length) frame = requestAnimationFrame(tick);
      else lastTime = null;
    });

    const updatePlayback = () => {
      if (!reducedMotion.matches && documentVisible && ripples.length) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        stop();
        draw();
      }
    };

    const addRipple = (pageX, pageY, strength = 1.15) => {
      const duration = 1.8 + clamp(strength, 0.4, 1.4) * 0.9;
      const ripple = {
        pageX,
        pageY,
        age: reducedMotion.matches ? duration * 0.38 : 0,
        duration,
        strength: clamp(strength, 0.4, 1.4),
      };
      ripples.push(ripple);
      while (ripples.length > maxRipples()) ripples.shift();
      draw();
      if (reducedMotion.matches) {
        window.setTimeout(safeHandler("pond ripple reduced cleanup", () => {
          const index = ripples.indexOf(ripple);
          if (index !== -1) ripples.splice(index, 1);
          draw();
        }), 280);
        return;
      }
      updatePlayback();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      rippleColor = readColor();
      draw();
    };

    listen(main, "pointerdown", (event) => {
      pointerStart = null;
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target.closest(excludedSelector)) return;
      pointerStart = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
        target,
        emitted: event.pointerType !== "touch",
      };
      if (pointerStart.emitted) {
        addRipple(event.pageX, event.pageY);
        lastPointerRipple = performance.now();
      }
    }, { passive: true }, "pond ripple pointer start");

    listen(main, "pointermove", (event) => {
      if (!pointerStart || event.pointerId !== pointerStart.id || event.pointerType === "touch") return;
      if (performance.now() - lastPointerRipple < 90) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target.closest(excludedSelector)) return;
      addRipple(event.pageX, event.pageY, 0.72);
      lastPointerRipple = performance.now();
    }, { passive: true }, "pond ripple pointer trail");

    listen(main, "pointerup", (event) => {
      if (!pointerStart || event.pointerId !== pointerStart.id || event.button !== 0) {
        pointerStart = null;
        return;
      }

      const startPoint = pointerStart;
      pointerStart = null;
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target.closest(excludedSelector) || startPoint.target.closest(excludedSelector)) return;
      if (startPoint.emitted) return;
      if (Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y) >= 8) return;
      if (performance.now() - startPoint.time > 650) return;
      const selection = window.getSelection && window.getSelection();
      if (selection && String(selection).trim()) return;
      addRipple(event.pageX, event.pageY);
    }, { passive: true }, "pond ripple pointer end");

    listen(main, "pointercancel", () => {
      pointerStart = null;
    }, { passive: true }, "pond ripple pointer cancel");
    listen(window, "scroll", () => {
      if (ripples.length) draw();
    }, { passive: true }, "pond ripple scroll");
    listen(document, "visibilitychange", () => {
      documentVisible = !document.hidden;
      updatePlayback();
    }, undefined, "pond ripple visibility");

    const onReducedMotion = () => {
      if (reducedMotion.matches) ripples.splice(0, ripples.length);
      updatePlayback();
    };
    if (typeof reducedMotion.addEventListener === "function") {
      listen(reducedMotion, "change", onReducedMotion, undefined, "pond ripple motion preference");
    } else if (typeof reducedMotion.addListener === "function") {
      reducedMotion.addListener(safeHandler("pond ripple motion preference", onReducedMotion));
    }

    const themeObserver = new MutationObserver(safeHandler("pond ripple theme", () => {
      rippleColor = readColor();
      draw();
    }));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    if ("ResizeObserver" in window) {
      new ResizeObserver(safeHandler("pond ripple resize", resize)).observe(canvas);
    } else {
      listen(window, "resize", resize, { passive: true }, "pond ripple resize");
    }
    resize();
    if (!reducedMotion.matches) {
      addRipple(window.scrollX + width * 0.5, window.scrollY + Math.min(height * 0.45, 360), 0.9);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeHandler("startup", start), { once: true });
  } else {
    start();
  }
})();
