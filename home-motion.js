(() => {
  "use strict";

  const report = (area, error) => {
    console.error(`[Home motion: ${area}]`, error);
  };

  const safeInit = (area, initializer) => {
    try {
      return initializer();
    } catch (error) {
      report(area, error);
      return null;
    }
  };

  const safeHandler = (area, handler) => (...args) => {
    try {
      return handler(...args);
    } catch (error) {
      report(area, error);
      return undefined;
    }
  };

  const listen = (target, type, handler, options, area = type) => {
    if (!target) return;
    target.addEventListener(type, safeHandler(area, handler), options);
  };

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  const start = () => {
    const body = document.body;
    if (!body || !body.classList.contains("home-page")) return;

    safeInit("hero rapport", () => {
      const canvas = document.getElementById("heroRapportCanvas");
      if (!(canvas instanceof HTMLCanvasElement)) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const defaultCenters = [
        { x: 0.34, y: 0.54 },
        { x: 0.67, y: 0.46 },
      ];
      const centers = defaultCenters.map((center) => ({ ...center }));
      let width = 1;
      let height = 1;
      let frame = 0;
      let lastTime = null;
      let phase = 0;
      let inView = true;
      let documentVisible = !document.hidden;
      let dragging = false;
      let pointerId = null;
      let selectedCenter = 0;
      let palette = null;

      const seededRandom = (seed) => {
        const value = Math.sin(seed * 47.173 + 13.619) * 21531.717;
        return value - Math.floor(value);
      };

      const makeParticles = (group, count = 12) =>
        Array.from({ length: count }, (_, index) => ({
          angle: seededRandom(group * 101 + index * 7 + 1) * Math.PI * 2,
          radius: 11 + seededRandom(group * 113 + index * 7 + 2) * 37,
          speed: 0.17 + seededRandom(group * 127 + index * 7 + 3) * 0.34,
          size: 1.15 + seededRandom(group * 139 + index * 7 + 4) * 1.65,
          pulse: seededRandom(group * 151 + index * 7 + 5) * Math.PI * 2,
          squash: 0.5 + seededRandom(group * 163 + index * 7 + 6) * 0.28,
        }));
      const groups = [makeParticles(0), makeParticles(1)];

      const readPalette = () => {
        const styles = getComputedStyle(canvas);
        const bodyStyles = getComputedStyle(body);
        const dark = document.documentElement.getAttribute("data-theme") === "dark";
        const getColor = (...names) => {
          for (const name of names) {
            const value = styles.getPropertyValue(name).trim() || bodyStyles.getPropertyValue(name).trim();
            if (value) return value;
          }
          return "";
        };
        return {
          human: getColor("--hero-rapport-human", "--rapport-human") || (dark ? "#e1b65d" : "#b7832f"),
          robot: getColor("--hero-rapport-robot", "--rapport-robot") || (dark ? "#8fc8bb" : "#4f9189"),
          connection: getColor("--hero-rapport-connection", "--rapport-connection", "--color-accent") || (dark ? "#d8c28e" : "#9c8455"),
          focus: getColor("--hero-rapport-focus", "--color-heading") || (dark ? "#f2e8d3" : "#245f62"),
        };
      };

      const isRunning = () => !reducedMotion.matches && documentVisible && inView;

      const particlePositions = () =>
        groups.map((particles, groupIndex) => {
          const center = centers[groupIndex];
          const direction = groupIndex === 0 ? 1 : -1;
          const cloudScale = clamp(Math.min(width, height) / 160, 0.45, 1);
          return particles.map((particle) => {
            const angle = particle.angle + phase * particle.speed * direction;
            const breathing = 0.87 + Math.sin(phase * 0.72 + particle.pulse) * 0.13;
            return {
              x: center.x * width + Math.cos(angle) * particle.radius * cloudScale * breathing,
              y: center.y * height + Math.sin(angle) * particle.radius * particle.squash * cloudScale * breathing,
              size: particle.size * (0.76 + cloudScale * 0.24),
            };
          });
        });

      const draw = () => {
        if (!palette) palette = readPalette();
        context.clearRect(0, 0, width, height);
        const positions = particlePositions();
        const first = { x: centers[0].x * width, y: centers[0].y * height };
        const second = { x: centers[1].x * width, y: centers[1].y * height };
        const centerDistance = Math.hypot(second.x - first.x, second.y - first.y);
        const proximity = clamp(1 - centerDistance / Math.max(width * 0.58, 150), 0, 1);

        context.save();
        context.strokeStyle = palette.connection;
        context.lineCap = "round";
        context.globalAlpha = 0.12 + proximity * 0.58;
        context.lineWidth = 0.8 + proximity * 1.25;
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.quadraticCurveTo(
          (first.x + second.x) / 2,
          (first.y + second.y) / 2 - 11 - proximity * 8,
          second.x,
          second.y
        );
        context.stroke();

        positions[0].forEach((human, index) => {
          const robot = positions[1][(index * 5) % positions[1].length];
          const distance = Math.hypot(robot.x - human.x, robot.y - human.y);
          const closeness = clamp(1 - distance / Math.max(width * 0.48, 130), 0, 1);
          if (closeness < 0.12) return;
          context.globalAlpha = closeness * (0.08 + proximity * 0.28);
          context.lineWidth = 0.55 + proximity * 0.5;
          context.beginPath();
          context.moveTo(human.x, human.y);
          context.lineTo(robot.x, robot.y);
          context.stroke();
        });
        context.restore();

        positions.forEach((particles, groupIndex) => {
          context.save();
          context.fillStyle = groupIndex === 0 ? palette.human : palette.robot;
          particles.forEach((particle, index) => {
            context.globalAlpha = index % 4 === 0 ? 0.12 : 0.07;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size * 2.7, 0, Math.PI * 2);
            context.fill();
            context.globalAlpha = 0.58 + (index % 3) * 0.12;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
          });
          context.restore();
        });

        [first, second].forEach((center, index) => {
          const active = index === selectedCenter && (dragging || document.activeElement === canvas);
          context.save();
          context.fillStyle = index === 0 ? palette.human : palette.robot;
          context.globalAlpha = 0.9;
          context.beginPath();
          context.arc(center.x, center.y, active ? 5.8 : 4.3, 0, Math.PI * 2);
          context.fill();
          if (active) {
            context.strokeStyle = palette.focus;
            context.globalAlpha = 0.72;
            context.lineWidth = 1.2;
            context.setLineDash([3, 4]);
            context.beginPath();
            context.arc(center.x, center.y, 13, 0, Math.PI * 2);
            context.stroke();
          }
          context.restore();
        });
      };

      const stop = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastTime = null;
      };

      const tick = safeHandler("hero rapport frame", (time) => {
        frame = 0;
        if (!isRunning()) {
          lastTime = null;
          draw();
          return;
        }
        const delta = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.04);
        lastTime = time;
        phase += delta;
        draw();
        frame = requestAnimationFrame(tick);
      });

      const updatePlayback = () => {
        canvas.classList.toggle("is-motion-paused", !isRunning());
        if (isRunning()) {
          if (!frame) frame = requestAnimationFrame(tick);
        } else {
          stop();
          draw();
        }
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
        draw();
      };

      const pointerPosition = (event) => {
        const rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      };

      const updateAccessibleLabel = () => {
        const isEnglish = document.documentElement.lang === "en";
        const selectedName = selectedCenter === 0 ? "黄土色の人の光" : "青磁色のロボットの光";
        const selectedNameEnglish = selectedCenter === 0 ? "The ochre human light" : "The celadon robot light";
        canvas.setAttribute("aria-label", isEnglish
          ? `Lights representing a human-robot relationship. ${selectedNameEnglish} is selected. Press Enter to switch lights and use the arrow keys to move it`
          : `人とロボットの関係を表す光。${selectedName}を選択中。Enterで光を切り替え、矢印キーで動かせます`);
        canvas.title = isEnglish
          ? "Focus with Tab, switch lights with Enter, and move with the arrow keys"
          : "Tabで選択し、Enterで光を切り替え、矢印キーで動かします";
      };

      const releasePointer = (event) => {
        if (!dragging || (pointerId !== null && event.pointerId !== pointerId)) return;
        dragging = false;
        if (pointerId !== null && canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
        pointerId = null;
        canvas.classList.remove("is-dragging");
        draw();
      };

      listen(canvas, "pointerdown", (event) => {
        const point = pointerPosition(event);
        const distances = centers.map((center) => Math.hypot(point.x - center.x * width, point.y - center.y * height));
        const nearest = distances[0] <= distances[1] ? 0 : 1;
        if (distances[nearest] > Math.min(82, width * 0.26)) return;
        selectedCenter = nearest;
        dragging = true;
        pointerId = event.pointerId;
        canvas.setPointerCapture(pointerId);
        canvas.classList.add("is-dragging");
        updateAccessibleLabel();
        draw();
        event.preventDefault();
      }, undefined, "hero rapport pointer start");

      listen(canvas, "pointermove", (event) => {
        if (!dragging || event.pointerId !== pointerId) return;
        const point = pointerPosition(event);
        centers[selectedCenter].x = clamp(point.x / width, 0.08, 0.92);
        centers[selectedCenter].y = clamp(point.y / height, 0.14, 0.86);
        draw();
      }, undefined, "hero rapport pointer move");
      listen(canvas, "pointerup", releasePointer, undefined, "hero rapport pointer end");
      listen(canvas, "pointercancel", releasePointer, undefined, "hero rapport pointer cancel");
      listen(canvas, "lostpointercapture", (event) => {
        if (!dragging || event.pointerId !== pointerId) return;
        dragging = false;
        pointerId = null;
        canvas.classList.remove("is-dragging");
        draw();
      }, undefined, "hero rapport lost pointer");

      listen(canvas, "keydown", (event) => {
        const step = event.shiftKey ? 0.075 : 0.035;
        let handled = true;
        if (event.key === "ArrowLeft") centers[selectedCenter].x -= step;
        else if (event.key === "ArrowRight") centers[selectedCenter].x += step;
        else if (event.key === "ArrowUp") centers[selectedCenter].y -= step;
        else if (event.key === "ArrowDown") centers[selectedCenter].y += step;
        else if (event.key === "Enter" || event.key === " ") selectedCenter = selectedCenter === 0 ? 1 : 0;
        else if (event.key === "Home") Object.assign(centers[selectedCenter], defaultCenters[selectedCenter]);
        else handled = false;
        if (!handled) return;
        event.preventDefault();
        centers[selectedCenter].x = clamp(centers[selectedCenter].x, 0.08, 0.92);
        centers[selectedCenter].y = clamp(centers[selectedCenter].y, 0.14, 0.86);
        updateAccessibleLabel();
        draw();
      }, undefined, "hero rapport keyboard");
      listen(canvas, "focus", () => {
        canvas.classList.add("is-keyboard-active");
        draw();
      }, undefined, "hero rapport focus");
      listen(canvas, "blur", () => {
        canvas.classList.remove("is-keyboard-active");
        draw();
      }, undefined, "hero rapport blur");

      listen(document, "visibilitychange", () => {
        documentVisible = !document.hidden;
        updatePlayback();
      }, undefined, "hero rapport visibility");
      const onReducedMotion = () => updatePlayback();
      if (typeof reducedMotion.addEventListener === "function") {
        listen(reducedMotion, "change", onReducedMotion, undefined, "hero rapport motion preference");
      } else if (typeof reducedMotion.addListener === "function") {
        reducedMotion.addListener(safeHandler("hero rapport motion preference", onReducedMotion));
      }

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          safeHandler("hero rapport visibility", (entries) => {
            const entry = entries[0];
            inView = Boolean(entry && entry.isIntersecting && entry.intersectionRatio > 0);
            updatePlayback();
          }),
          { rootMargin: "100px 0px", threshold: [0, 0.05, 0.25] }
        );
        observer.observe(canvas);
      }

      if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(safeHandler("hero rapport resize", resize));
        resizeObserver.observe(canvas);
      } else {
        listen(window, "resize", resize, { passive: true }, "hero rapport resize");
      }

      const themeObserver = new MutationObserver(
        safeHandler("hero rapport theme", () => {
          palette = readPalette();
          updateAccessibleLabel();
          draw();
        })
      );
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "lang"] });

      canvas.tabIndex = canvas.hasAttribute("tabindex") ? canvas.tabIndex : 0;
      canvas.setAttribute("role", "application");
      canvas.setAttribute("aria-keyshortcuts", "Enter Space ArrowUp ArrowDown ArrowLeft ArrowRight Home");
      canvas.style.touchAction = "none";
      updateAccessibleLabel();
      palette = readPalette();
      resize();
      updatePlayback();
    });

    safeInit("page ripples", () => {
      const main = body.querySelector("main");
      if (!main) return;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const activeRipples = [];
      let pointerStart = null;
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

      const removeRipple = (ripple) => {
        const index = activeRipples.indexOf(ripple);
        if (index !== -1) activeRipples.splice(index, 1);
        ripple.remove();
      };

      listen(main, "pointerdown", (event) => {
        pointerStart = null;
        if (reducedMotion.matches || event.defaultPrevented || event.button !== 0) return;
        const target = event.target instanceof Element ? event.target : null;
        if (!target || target.closest(excludedSelector)) return;
        pointerStart = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          time: performance.now(),
          target,
        };
      }, { passive: true }, "page ripple pointer start");

      listen(main, "pointerup", (event) => {
        if (!pointerStart || reducedMotion.matches || event.pointerId !== pointerStart.id || event.button !== 0) {
          pointerStart = null;
          return;
        }
        const start = pointerStart;
        pointerStart = null;
        const target = event.target instanceof Element ? event.target : null;
        if (!target || target.closest(excludedSelector) || start.target.closest(excludedSelector)) return;
        const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
        const duration = performance.now() - start.time;
        if (distance >= 8 || duration > 650) return;
        const selection = window.getSelection && window.getSelection();
        if (selection && String(selection).trim()) return;

        while (activeRipples.length >= 4) removeRipple(activeRipples[0]);
        const ripple = document.createElement("span");
        ripple.className = "home-click-ripple";
        ripple.setAttribute("aria-hidden", "true");
        ripple.style.left = `${event.pageX}px`;
        ripple.style.top = `${event.pageY}px`;
        ripple.style.position = "absolute";
        ripple.style.pointerEvents = "none";
        ripple.style.setProperty("--ripple-rotation", `${Math.round(Math.random() * 45 - 22)}deg`);
        for (let ring = 0; ring < 3; ring += 1) ripple.appendChild(document.createElement("i"));
        body.appendChild(ripple);
        activeRipples.push(ripple);
        window.setTimeout(safeHandler("page ripple cleanup", () => removeRipple(ripple)), 1500);
      }, { passive: true }, "page ripple pointer end");
      listen(main, "pointercancel", () => {
        pointerStart = null;
      }, { passive: true }, "page ripple pointer cancel");
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeHandler("startup", start), { once: true });
  } else {
    start();
  }
})();
