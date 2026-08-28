(() => {
  "use strict";

  const body = document.body;
  if (!body || !body.classList.contains("animation-lab-page")) return;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const listen = (target, type, handler, options) => {
    if (target) target.addEventListener(type, handler, options);
  };

  const safeInit = (name, initializer) => {
    try {
      return initializer();
    } catch (error) {
      console.error(`[Animation Lab: ${name}]`, error);
      return null;
    }
  };

  const makeObserver = (element, onChange) => {
    let visible = true;
    const panel = element.closest(".animation-panel");
    body.classList.add("motion-ready");
    if (!("IntersectionObserver" in window)) {
      if (panel) panel.classList.add("is-in-view");
      onChange(true);
      return { disconnect() {} };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        visible = Boolean(entry && entry.isIntersecting && entry.intersectionRatio > 0);
        if (panel) panel.classList.toggle("is-in-view", visible);
        onChange(visible);
      },
      { rootMargin: "100px 0px", threshold: [0, 0.05, 0.25] }
    );
    observer.observe(element);
    return observer;
  };

  const createMotionController = () => {
    const toggle = document.getElementById("motionToggle");
    const reset = document.getElementById("resetAnimations");
    const status = document.getElementById("motionStatus");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let userEnabled = !reducedMotion.matches;
    let documentVisible = !document.hidden;

    const isRunning = () => userEnabled && documentVisible;

    const render = (reason = "update") => {
      const running = isRunning();
      body.classList.toggle("motion-paused", !running);
      body.dataset.motion = running ? "running" : "paused";
      body.style.setProperty("--motion-play-state", running ? "running" : "paused");

      if (toggle) {
        const pauseLabel = toggle.dataset.pauseLabel || "すべて停止";
        const playLabel = toggle.dataset.playLabel || "すべて再生";
        toggle.textContent = userEnabled ? pauseLabel : playLabel;
        toggle.setAttribute("aria-pressed", String(!userEnabled));
      }

      if (status) {
        if (!userEnabled && reducedMotion.matches) {
          status.textContent = "停止中（端末の設定）";
        } else if (!userEnabled) {
          status.textContent = "停止中";
        } else if (!documentVisible) {
          status.textContent = "一時停止中";
        } else {
          status.textContent = "再生中";
        }
        status.dataset.state = running ? "running" : "paused";
      }

      body.dispatchEvent(
        new CustomEvent("animationlab:motionchange", {
          detail: { running, userEnabled, reason },
        })
      );
    };

    listen(toggle, "click", () => {
      userEnabled = !userEnabled;
      render("control");
    });

    listen(reset, "click", () => {
      body.dispatchEvent(new CustomEvent("animationlab:reset"));
      if (status) {
        const previous = status.textContent;
        status.textContent = "初期状態に戻しました";
        window.setTimeout(() => {
          if (status.textContent === "初期状態に戻しました") {
            status.textContent = previous;
          }
        }, 1400);
      }
    });

    listen(document, "visibilitychange", () => {
      documentVisible = !document.hidden;
      render("visibility");
    });

    const onReducedMotionChange = (event) => {
      userEnabled = !event.matches;
      render("preference");
    };
    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", onReducedMotionChange);
    } else if (typeof reducedMotion.addListener === "function") {
      reducedMotion.addListener(onReducedMotionChange);
    }

    render("initial");
    return { isRunning, render };
  };

  const motion = safeInit("motion controls", createMotionController) || {
    isRunning: () => !document.hidden,
  };

  safeInit("tile", () => {
    const stage = document.getElementById("tileStage");
    const toggle = document.getElementById("tileToggle");
    const speed = document.getElementById("tileSpeed");
    const speedOutput = document.getElementById("tileSpeedOutput");
    if (!stage) return;

    const initialBloomed = stage.classList.contains("is-bloomed");
    const initialSpeed = speed ? speed.value : "1";
    let inView = true;

    const updateToggle = () => {
      if (!toggle) return;
      const bloomed = stage.classList.contains("is-bloomed");
      toggle.setAttribute("aria-pressed", String(bloomed));
      toggle.textContent = bloomed
        ? toggle.dataset.closeLabel || "模様を閉じる"
        : toggle.dataset.openLabel || "模様をひらく";
    };

    const updateSpeed = () => {
      if (!speed) return;
      const numeric = Number.parseFloat(speed.value);
      const multiplier = Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
      stage.style.setProperty("--tile-speed", String(multiplier));
      stage.style.setProperty("--tile-duration", `${clamp(18 / multiplier, 4.5, 36)}s`);
      stage.style.setProperty("--tile-duration-reverse", `${clamp(13 / multiplier, 3.25, 30)}s`);
      stage.dataset.speed = multiplier.toFixed(2);
      if (speedOutput) speedOutput.textContent = `${multiplier.toFixed(1)}×`;
    };

    const updatePlayback = () => {
      const running = motion.isRunning() && inView;
      stage.classList.toggle("is-motion-paused", !running);
      stage.style.setProperty("--tile-play-state", running ? "running" : "paused");
      stage.querySelectorAll(".tile-wheel, .tile-center-halo").forEach((element) => {
        element.style.animationPlayState = running ? "running" : "paused";
      });
    };

    listen(toggle, "click", () => {
      stage.classList.toggle("is-bloomed");
      updateToggle();
    });
    listen(stage, "click", () => {
      stage.classList.toggle("is-bloomed");
      updateToggle();
    });
    listen(speed, "input", updateSpeed);
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      stage.classList.toggle("is-bloomed", initialBloomed);
      if (speed) speed.value = initialSpeed;
      updateToggle();
      updateSpeed();
    });
    makeObserver(stage, (visible) => {
      inView = visible;
      updatePlayback();
    });

    updateToggle();
    updateSpeed();
    updatePlayback();
  });

  safeInit("wind", () => {
    const stage = document.getElementById("windStage");
    const leafLayer = document.getElementById("windLeaves") || stage;
    const strength = document.getElementById("windStrength");
    const strengthOutput = document.getElementById("windStrengthOutput");
    const gust = document.getElementById("windGust");
    if (!stage) return;

    const initialStrength = strength ? strength.value : "1";
    const leaves = [];
    let inView = true;
    let gustTimer = 0;

    const seededRandom = (seed) => {
      const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
      return value - Math.floor(value);
    };

    const createLeaves = () => {
      leafLayer.querySelectorAll('.wind-leaf[data-generated="true"]').forEach((leaf) => leaf.remove());
      leaves.length = 0;
      const fragment = document.createDocumentFragment();
      for (let index = 0; index < 24; index += 1) {
        const leaf = document.createElement("span");
        const random = (offset) => seededRandom(index * 7 + offset);
        leaf.className = "wind-leaf";
        leaf.dataset.generated = "true";
        leaf.setAttribute("aria-hidden", "true");
        leaf.style.setProperty("--leaf-index", String(index));
        leaf.style.setProperty("--leaf-x", `${-12 + random(1) * 118}%`);
        leaf.style.setProperty("--leaf-y", `${4 + random(2) * 78}%`);
        leaf.style.setProperty("--leaf-delay", `${(-random(3) * 12).toFixed(2)}s`);
        leaf.style.setProperty("--leaf-duration", `${(7 + random(4) * 9).toFixed(2)}s`);
        leaf.style.setProperty("--leaf-drift", `${(28 + random(5) * 74).toFixed(1)}px`);
        leaf.style.setProperty("--leaf-rise", `${(-12 + random(6) * 28).toFixed(1)}px`);
        leaf.style.setProperty("--leaf-spin", `${Math.round(160 + random(7) * 520)}deg`);
        leaf.style.setProperty("--leaf-scale", `${(0.62 + random(8) * 0.7).toFixed(2)}`);
        fragment.appendChild(leaf);
        leaves.push(leaf);
      }
      leafLayer.appendChild(fragment);
    };

    const getIntensity = () => {
      if (!strength) return 0.55;
      const min = Number.parseFloat(strength.min || "0");
      const max = Number.parseFloat(strength.max || "2");
      const value = Number.parseFloat(strength.value);
      if (!Number.isFinite(value) || max <= min) return 0.55;
      return clamp((value - min) / (max - min), 0, 1);
    };

    const updateStrength = () => {
      const intensity = getIntensity();
      stage.style.setProperty("--wind-strength", intensity.toFixed(3));
      stage.style.setProperty("--wind-duration-scale", (1.35 - intensity * 0.72).toFixed(3));
      stage.style.setProperty("--wind-duration", `${(7.2 - intensity * 4.1).toFixed(2)}s`);
      stage.style.setProperty("--wind-shift", `${(6 + intensity * 29).toFixed(1)}px`);
      stage.dataset.windLevel = intensity < 0.34 ? "calm" : intensity < 0.68 ? "breeze" : "strong";
      if (strengthOutput && strength) strengthOutput.textContent = strength.value;
      leaves.forEach((leaf, index) => {
        const threshold = (index + 1) / leaves.length;
        leaf.classList.toggle("is-resting", threshold > 0.24 + intensity * 0.76);
        leaf.style.animationPlayState = motion.isRunning() && inView && !leaf.classList.contains("is-resting") ? "running" : "paused";
      });
    };

    const updatePlayback = () => {
      const running = motion.isRunning() && inView;
      stage.classList.toggle("is-motion-paused", !running);
      stage.style.setProperty("--wind-play-state", running ? "running" : "paused");
      stage.querySelectorAll(".wind-light, .wind-branch, .wind-leaf").forEach((element) => {
        const restingLeaf = element.classList.contains("wind-leaf") && element.classList.contains("is-resting");
        element.style.animationPlayState = running && !restingLeaf ? "running" : "paused";
      });
    };

    listen(strength, "input", updateStrength);
    listen(gust, "click", () => {
      window.clearTimeout(gustTimer);
      stage.classList.remove("is-gusting");
      void stage.offsetWidth;
      stage.classList.add("is-gusting");
      if (motion.isRunning() && inView) {
        leaves.forEach((leaf) => { leaf.style.animationPlayState = "running"; });
      }
      gustTimer = window.setTimeout(() => {
        stage.classList.remove("is-gusting");
        updatePlayback();
      }, 1600);
    });
    listen(stage, "pointermove", (event) => {
      if (event.pointerType !== "mouse" && event.buttons === 0) return;
      const bounds = stage.getBoundingClientRect();
      const horizontal = clamp((event.clientX - bounds.left) / Math.max(bounds.width, 1), 0, 1);
      stage.style.setProperty("--wind-angle", `${((horizontal - 0.5) * 8).toFixed(2)}deg`);
    });
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      window.clearTimeout(gustTimer);
      stage.classList.remove("is-gusting");
      stage.style.setProperty("--wind-angle", "0deg");
      if (strength) strength.value = initialStrength;
      createLeaves();
      updateStrength();
      updatePlayback();
    });
    makeObserver(stage, (visible) => {
      inView = visible;
      updatePlayback();
    });

    createLeaves();
    updateStrength();
    updatePlayback();
  });

  safeInit("bird", () => {
    const svg = document.getElementById("birdFlightSvg");
    const bird = document.getElementById("motionBird");
    if (!svg || !bird) return;

    const paths = Array.from(svg.querySelectorAll("path.route-path[data-route]"));
    const buttons = Array.from(document.querySelectorAll("button[data-bird-route]"));
    if (!paths.length) return;

    const initialButton = buttons.find((button) => button.classList.contains("is-active") || button.getAttribute("aria-pressed") === "true");
    const initialRoute = initialButton ? initialButton.dataset.birdRoute : paths[0].dataset.route;
    let route = paths.find((path) => path.dataset.route === initialRoute) || paths[0];
    let progress = 0;
    let lastTime = null;
    let frame = 0;
    let inView = true;

    const updateButtons = () => {
      buttons.forEach((button) => {
        const active = button.dataset.birdRoute === route.dataset.route;
        button.classList.toggle("is-active", active);
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", String(active));
      });
      paths.forEach((path) => {
        path.classList.toggle("is-selected", path === route);
      });
    };

    const placeBird = () => {
      const length = route.getTotalLength();
      if (!Number.isFinite(length) || length <= 0) return;
      const distance = clamp(progress, 0, 0.99999) * length;
      const point = route.getPointAtLength(distance);
      const sampleDistance = distance < length - 1 ? distance + 1 : Math.max(0, distance - 1);
      const sample = route.getPointAtLength(sampleDistance);
      let angle = (Math.atan2(sample.y - point.y, sample.x - point.x) * 180) / Math.PI;
      if (sampleDistance < distance) angle += 180;
      angle += Number.parseFloat(bird.dataset.heading || "0") || 0;
      bird.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(2)})`);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = null;
    };

    const tick = (time) => {
      frame = 0;
      if (!motion.isRunning() || !inView) {
        lastTime = null;
        return;
      }
      if (lastTime !== null) {
        const configured = Number.parseFloat(route.dataset.duration || svg.dataset.duration || "9000");
        const duration = Number.isFinite(configured) && configured > 500 ? configured : 9000;
        progress = (progress + Math.min(time - lastTime, 64) / duration) % 1;
      }
      lastTime = time;
      placeBird();
      frame = requestAnimationFrame(tick);
    };

    const updatePlayback = () => {
      const running = motion.isRunning() && inView;
      bird.classList.toggle("is-resting", !running);
      if (running) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        stop();
      }
    };

    buttons.forEach((button) => {
      listen(button, "click", () => {
        const next = paths.find((path) => path.dataset.route === button.dataset.birdRoute);
        if (!next) return;
        route = next;
        progress = 0;
        lastTime = null;
        updateButtons();
        placeBird();
        updatePlayback();
      });
    });
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      route = paths.find((path) => path.dataset.route === initialRoute) || paths[0];
      progress = 0;
      lastTime = null;
      updateButtons();
      placeBird();
      updatePlayback();
    });
    makeObserver(svg, (visible) => {
      inView = visible;
      updatePlayback();
    });

    updateButtons();
    placeBird();
    updatePlayback();
  });

  safeInit("rapport canvas", () => {
    const canvas = document.getElementById("rapportCanvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const defaultCenters = [
      { x: 0.32, y: 0.53 },
      { x: 0.68, y: 0.47 },
    ];
    const centers = defaultCenters.map((center) => ({ ...center }));
    let width = 1;
    let height = 1;
    let frame = 0;
    let inView = true;
    let activeCenter = -1;
    let pointerId = null;

    const seededRandom = (seed) => {
      const value = Math.sin(seed * 93.989 + 41.23) * 11358.311;
      return value - Math.floor(value);
    };

    const createGroup = (group, count) =>
      Array.from({ length: count }, (_, index) => ({
        group,
        angle: seededRandom(index + group * 101) * Math.PI * 2,
        radius: 14 + seededRandom(index + group * 131 + 2) * 70,
        speed: 0.18 + seededRandom(index + group * 151 + 3) * 0.44,
        size: 1.2 + seededRandom(index + group * 181 + 4) * 2.8,
        wobble: seededRandom(index + group * 199 + 5) * Math.PI * 2,
      }));
    const groups = [createGroup(0, 22), createGroup(1, 22)];

    const readColors = () => {
      const styles = getComputedStyle(body);
      return {
        human: styles.getPropertyValue("--rapport-human").trim() || "#d8a847",
        robot: styles.getPropertyValue("--rapport-robot").trim() || "#69b7ae",
        connection: styles.getPropertyValue("--rapport-connection").trim() || "#d8bf83",
      };
    };
    let palette = readColors();

    const particlePositions = (time) =>
      groups.map((particles, groupIndex) => {
        const center = centers[groupIndex];
        return particles.map((particle) => {
          const angle = particle.angle + time * particle.speed * (groupIndex ? -1 : 1);
          const pulse = 0.82 + Math.sin(time * 0.9 + particle.wobble) * 0.18;
          return {
            x: center.x * width + Math.cos(angle) * particle.radius * pulse,
            y: center.y * height + Math.sin(angle) * particle.radius * 0.62 * pulse,
            size: particle.size,
          };
        });
      });

    const draw = (timestamp = 0) => {
      const time = timestamp / 1000;
      const positions = particlePositions(time);
      const first = { x: centers[0].x * width, y: centers[0].y * height };
      const second = { x: centers[1].x * width, y: centers[1].y * height };
      const centerDistance = Math.hypot(second.x - first.x, second.y - first.y);
      const proximity = 1 - clamp(centerDistance / Math.max(width * 0.62, 1), 0, 1);

      context.clearRect(0, 0, width, height);

      context.save();
      context.strokeStyle = palette.connection;
      context.lineWidth = 0.7 + proximity * 1.4;
      positions[0].forEach((human, index) => {
        const robot = positions[1][(index * 7) % positions[1].length];
        const distance = Math.hypot(robot.x - human.x, robot.y - human.y);
        const closeness = clamp(1 - distance / Math.max(width * 0.48, 170), 0, 1);
        if (closeness <= 0.05) return;
        context.globalAlpha = closeness * (0.1 + proximity * 0.38);
        context.beginPath();
        context.moveTo(human.x, human.y);
        context.lineTo(robot.x, robot.y);
        context.stroke();
      });

      context.globalAlpha = 0.12 + proximity * 0.62;
      context.lineWidth = 1 + proximity * 2;
      context.beginPath();
      context.moveTo(first.x, first.y);
      const curve = (second.y - first.y) * 0.2 - 18;
      context.quadraticCurveTo((first.x + second.x) / 2, (first.y + second.y) / 2 + curve, second.x, second.y);
      context.stroke();
      context.restore();

      positions.forEach((particles, groupIndex) => {
        context.save();
        context.fillStyle = groupIndex === 0 ? palette.human : palette.robot;
        particles.forEach((particle, index) => {
          const glow = index % 5 === 0 ? particle.size * 3.4 : particle.size * 1.9;
          context.globalAlpha = index % 5 === 0 ? 0.12 : 0.07;
          context.beginPath();
          context.arc(particle.x, particle.y, glow, 0, Math.PI * 2);
          context.fill();
          context.globalAlpha = 0.54 + (index % 4) * 0.1;
          context.beginPath();
          context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          context.fill();
        });
        context.restore();
      });

      [first, second].forEach((center, index) => {
        context.save();
        context.fillStyle = index === 0 ? palette.human : palette.robot;
        context.globalAlpha = activeCenter === index ? 0.95 : 0.72;
        context.beginPath();
        context.arc(center.x, center.y, activeCenter === index ? 6.5 : 4.5, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const tick = (time) => {
      frame = 0;
      draw(time);
      if (motion.isRunning() && inView) frame = requestAnimationFrame(tick);
    };

    const updatePlayback = () => {
      if (motion.isRunning() && inView) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        stop();
        draw(performance.now());
      }
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      draw(performance.now());
    };

    const pointerPosition = (event) => {
      const bounds = canvas.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    listen(canvas, "pointerdown", (event) => {
      const point = pointerPosition(event);
      const distances = centers.map((center) => Math.hypot(point.x - center.x * width, point.y - center.y * height));
      activeCenter = distances[0] <= distances[1] ? 0 : 1;
      if (distances[activeCenter] > Math.min(92, width * 0.22)) {
        activeCenter = -1;
        return;
      }
      pointerId = event.pointerId;
      canvas.setPointerCapture(pointerId);
      canvas.classList.add("is-dragging");
      event.preventDefault();
      draw(performance.now());
    });

    listen(canvas, "pointermove", (event) => {
      if (activeCenter < 0 || pointerId !== event.pointerId) return;
      const point = pointerPosition(event);
      centers[activeCenter].x = clamp(point.x / width, 0.1, 0.9);
      centers[activeCenter].y = clamp(point.y / height, 0.16, 0.84);
      draw(performance.now());
    });

    const releasePointer = (event) => {
      if (pointerId !== event.pointerId) return;
      if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
      pointerId = null;
      activeCenter = -1;
      canvas.classList.remove("is-dragging");
      draw(performance.now());
    };
    listen(canvas, "pointerup", releasePointer);
    listen(canvas, "pointercancel", releasePointer);
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      centers.forEach((center, index) => Object.assign(center, defaultCenters[index]));
      activeCenter = -1;
      canvas.classList.remove("is-dragging");
      draw(0);
      updatePlayback();
    });
    makeObserver(canvas, (visible) => {
      inView = visible;
      updatePlayback();
    });

    canvas.style.touchAction = "none";
    if (!canvas.hasAttribute("aria-label")) {
      canvas.setAttribute("aria-label", "人とロボットの光をドラッグして、関係の変化を観察する図");
    }
    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      listen(window, "resize", resize, { passive: true });
    }
    new MutationObserver(() => {
      palette = readColors();
      draw(performance.now());
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    resize();
    updatePlayback();
  });

  safeInit("yarn", () => {
    const stage = document.getElementById("yarnStage");
    const ball = document.getElementById("yarnBall");
    const cat = document.getElementById("playCat");
    if (!stage || !ball || !cat) return;

    const ballState = { x: 0, y: 0, vx: 0, vy: 0, rotation: 0 };
    const catState = { x: 0, y: 0, tilt: 0 };
    let bounds = { width: 1, height: 1 };
    let home = { x: 1, y: 1 };
    let radius = 20;
    let dragging = false;
    let pointerId = null;
    let lastPointer = null;
    let lastFrame = null;
    let frame = 0;
    let inView = true;

    const measure = (preservePosition = true) => {
      const oldWidth = bounds.width;
      const oldHeight = bounds.height;
      const rect = stage.getBoundingClientRect();
      bounds = { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
      radius = Math.max(12, ball.getBoundingClientRect().width / 2 || 20);
      home = { x: bounds.width * 0.64, y: bounds.height * 0.58 };
      if (preservePosition && oldWidth > 1 && oldHeight > 1) {
        ballState.x = (ballState.x / oldWidth) * bounds.width;
        ballState.y = (ballState.y / oldHeight) * bounds.height;
      } else {
        ballState.x = home.x;
        ballState.y = home.y;
      }
      ballState.x = clamp(ballState.x, radius, bounds.width - radius);
      ballState.y = clamp(ballState.y, radius, bounds.height - radius);
      render();
    };

    const render = () => {
      const deltaX = ballState.x - home.x;
      const deltaY = ballState.y - home.y;
      const targetCatX = deltaX * 0.2;
      const targetCatY = deltaY * 0.07;
      catState.x += (targetCatX - catState.x) * 0.13;
      catState.y += (targetCatY - catState.y) * 0.13;
      catState.tilt += (clamp(deltaX / Math.max(bounds.width, 1), -0.2, 0.2) * 20 - catState.tilt) * 0.1;

      ball.style.left = `${ballState.x.toFixed(2)}px`;
      ball.style.top = `${ballState.y.toFixed(2)}px`;
      ball.style.setProperty("--yarn-x", `${ballState.x.toFixed(2)}px`);
      ball.style.setProperty("--yarn-y", `${ballState.y.toFixed(2)}px`);
      ball.style.setProperty("--yarn-rotation", `${ballState.rotation.toFixed(2)}deg`);
      ball.style.transform = `rotate(${ballState.rotation.toFixed(2)}deg)`;

      cat.style.setProperty("--cat-follow-x", `${catState.x.toFixed(2)}px`);
      cat.style.setProperty("--cat-follow-y", `${catState.y.toFixed(2)}px`);
      cat.style.setProperty("--cat-shift-x", `${catState.x.toFixed(2)}px`);
      cat.style.setProperty("--cat-shift-y", `${catState.y.toFixed(2)}px`);
      cat.style.setProperty("--cat-tilt", `${catState.tilt.toFixed(2)}deg`);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = null;
    };

    const tick = (time) => {
      frame = 0;
      if (!motion.isRunning() || !inView) {
        lastFrame = null;
        return;
      }
      const dt = lastFrame === null ? 1 / 60 : Math.min((time - lastFrame) / 1000, 0.04);
      lastFrame = time;

      if (!dragging) {
        ballState.x += ballState.vx * dt;
        ballState.y += ballState.vy * dt;
        ballState.rotation += ballState.vx * dt * 0.18;
        const damping = Math.pow(0.91, dt * 60);
        ballState.vx *= damping;
        ballState.vy *= damping;

        if (ballState.x <= radius || ballState.x >= bounds.width - radius) {
          ballState.x = clamp(ballState.x, radius, bounds.width - radius);
          ballState.vx *= -0.46;
        }
        if (ballState.y <= radius || ballState.y >= bounds.height - radius) {
          ballState.y = clamp(ballState.y, radius, bounds.height - radius);
          ballState.vy *= -0.46;
        }
        if (Math.abs(ballState.vx) < 2) ballState.vx = 0;
        if (Math.abs(ballState.vy) < 2) ballState.vy = 0;
      }

      render();
      const catMoving = Math.abs((ballState.x - home.x) * 0.2 - catState.x) > 0.15 || Math.abs((ballState.y - home.y) * 0.07 - catState.y) > 0.15;
      if (dragging || ballState.vx || ballState.vy || catMoving) frame = requestAnimationFrame(tick);
    };

    const ensureTicking = () => {
      if (motion.isRunning() && inView && !frame) frame = requestAnimationFrame(tick);
    };

    const pointerPoint = (event) => {
      const rect = stage.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top, time: performance.now() };
    };

    listen(ball, "pointerdown", (event) => {
      dragging = true;
      pointerId = event.pointerId;
      lastPointer = pointerPoint(event);
      ballState.vx = 0;
      ballState.vy = 0;
      ball.classList.add("is-dragging");
      ball.setPointerCapture(pointerId);
      event.preventDefault();
      ensureTicking();
    });

    listen(ball, "pointermove", (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      const point = pointerPoint(event);
      const elapsed = Math.max(8, point.time - lastPointer.time) / 1000;
      const nextX = clamp(point.x, radius, bounds.width - radius);
      const nextY = clamp(point.y, radius, bounds.height - radius);
      const measuredVx = (nextX - ballState.x) / elapsed;
      const measuredVy = (nextY - ballState.y) / elapsed;
      ballState.vx = ballState.vx * 0.42 + measuredVx * 0.58;
      ballState.vy = ballState.vy * 0.42 + measuredVy * 0.58;
      ballState.rotation += (nextX - ballState.x) * 0.7;
      ballState.x = nextX;
      ballState.y = nextY;
      lastPointer = point;
      render();
      ensureTicking();
    });

    const releasePointer = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      if (ball.hasPointerCapture(pointerId)) ball.releasePointerCapture(pointerId);
      pointerId = null;
      lastPointer = null;
      ball.classList.remove("is-dragging");
      ensureTicking();
    };
    listen(ball, "pointerup", releasePointer);
    listen(ball, "pointercancel", releasePointer);
    listen(ball, "keydown", (event) => {
      const step = event.shiftKey ? 34 : 16;
      let moved = true;
      if (event.key === "ArrowLeft") ballState.x -= step;
      else if (event.key === "ArrowRight") ballState.x += step;
      else if (event.key === "ArrowUp") ballState.y -= step;
      else if (event.key === "ArrowDown") ballState.y += step;
      else moved = false;
      if (!moved) return;
      event.preventDefault();
      ballState.x = clamp(ballState.x, radius, bounds.width - radius);
      ballState.y = clamp(ballState.y, radius, bounds.height - radius);
      ballState.vx = 0;
      ballState.vy = 0;
      render();
      ensureTicking();
    });
    listen(body, "animationlab:motionchange", () => {
      if (motion.isRunning() && inView) ensureTicking();
      else stop();
    });
    listen(body, "animationlab:reset", () => {
      dragging = false;
      pointerId = null;
      ballState.vx = 0;
      ballState.vy = 0;
      ballState.rotation = 0;
      catState.x = 0;
      catState.y = 0;
      catState.tilt = 0;
      ball.classList.remove("is-dragging");
      measure(false);
    });
    makeObserver(stage, (visible) => {
      inView = visible;
      if (inView) ensureTicking();
      else stop();
    });

    ball.style.touchAction = "none";
    ball.setAttribute("draggable", "false");
    if ("ResizeObserver" in window) {
      new ResizeObserver(() => measure(true)).observe(stage);
    } else {
      listen(window, "resize", () => measure(true), { passive: true });
    }
    measure(false);
    ensureTicking();
  });
})();
