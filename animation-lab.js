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

  safeInit("rain", () => {
    const stage = document.getElementById("rainStage");
    const layer = document.getElementById("rainLayer");
    const wiper = document.getElementById("rainWiper");
    const density = document.getElementById("rainDensity");
    const output = document.getElementById("rainDensityOutput");
    if (!stage || !layer) return;

    const initialDensity = density ? density.value : "50";
    let drops = [];
    let inView = true;
    let wipeTimer = 0;

    const seededRandom = (seed) => {
      const value = Math.sin(seed * 37.719 + 19.113) * 17561.914;
      return value - Math.floor(value);
    };

    const normalizedDensity = () => {
      if (!density) return 0.5;
      const min = Number.parseFloat(density.min || "0");
      const max = Number.parseFloat(density.max || "100");
      const value = Number.parseFloat(density.value);
      if (!Number.isFinite(value) || max <= min) return 0.5;
      return clamp((value - min) / (max - min), 0, 1);
    };

    const updatePlayback = () => {
      const running = motion.isRunning() && inView;
      stage.classList.toggle("is-motion-paused", !running);
      stage.style.setProperty("--rain-play-state", running ? "running" : "paused");
      drops.forEach((drop) => {
        drop.style.animationPlayState = running ? "running" : "paused";
      });
      if (wiper) wiper.style.animationPlayState = running ? "running" : "paused";
    };

    const createDrops = () => {
      layer.querySelectorAll('.rain-drop[data-generated="true"]').forEach((drop) => drop.remove());
      drops = [];
      const intensity = normalizedDensity();
      const compact = window.matchMedia("(max-width: 600px)").matches;
      const maximum = compact ? 34 : 58;
      const count = Math.round(8 + intensity * maximum);
      const fragment = document.createDocumentFragment();

      for (let index = 0; index < count; index += 1) {
        const random = (offset) => seededRandom(index * 11 + offset);
        const drop = document.createElement("span");
        drop.className = "rain-drop";
        drop.dataset.generated = "true";
        drop.setAttribute("aria-hidden", "true");
        drop.style.setProperty("--rain-x", `${(-5 + random(1) * 110).toFixed(2)}%`);
        drop.style.setProperty("--rain-delay", `${(-random(2) * 3.8).toFixed(2)}s`);
        drop.style.setProperty("--rain-duration", `${(0.7 + random(3) * 1.15 - intensity * 0.25).toFixed(2)}s`);
        drop.style.setProperty("--rain-length", `${(12 + random(4) * 25).toFixed(1)}px`);
        drop.style.setProperty("--rain-drift", `${(-8 - random(5) * 20).toFixed(1)}px`);
        drop.style.setProperty("--rain-opacity", `${(0.25 + random(6) * 0.55).toFixed(2)}`);
        fragment.appendChild(drop);
        drops.push(drop);
      }
      layer.appendChild(fragment);
      stage.style.setProperty("--rain-density", intensity.toFixed(3));
      if (output && density) output.textContent = density.value;
      updatePlayback();
    };

    const triggerWiper = () => {
      window.clearTimeout(wipeTimer);
      stage.classList.remove("is-wiping");
      void stage.offsetWidth;
      stage.classList.add("is-wiping");
      if (wiper) wiper.setAttribute("aria-pressed", "true");
      wipeTimer = window.setTimeout(() => {
        stage.classList.remove("is-wiping");
        if (wiper) wiper.setAttribute("aria-pressed", "false");
      }, 1250);
    };

    listen(density, "input", createDrops);
    listen(wiper, "click", triggerWiper);
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      window.clearTimeout(wipeTimer);
      stage.classList.remove("is-wiping");
      if (wiper) wiper.setAttribute("aria-pressed", "false");
      if (density) density.value = initialDensity;
      createDrops();
    });
    makeObserver(stage, (visible) => {
      inView = visible;
      updatePlayback();
    });

    createDrops();
  });

  safeInit("ripple canvas", () => {
    const canvas = document.getElementById("rippleCanvas");
    const clear = document.getElementById("rippleClear");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 1;
    let height = 1;
    let frame = 0;
    let lastTime = null;
    let inView = true;
    let pointerDown = false;
    let lastPointerRipple = 0;
    let ripples = [];
    const keyboardCursor = { x: 0.5, y: 0.5 };

    const readColor = () => {
      const styles = getComputedStyle(body);
      return styles.getPropertyValue("--ripple-color").trim() || styles.getPropertyValue("--color-heading").trim() || "#3d8587";
    };
    let rippleColor = readColor();

    const maxRipples = () => (window.matchMedia("(max-width: 600px)").matches ? 6 : 8);

    const addRipple = (x, y, strength = 1) => {
      ripples.push({
        x: clamp(x, 0, width),
        y: clamp(y, 0, height),
        age: 0,
        duration: 1.8 + clamp(strength, 0.4, 1.4) * 0.9,
        strength: clamp(strength, 0.4, 1.4),
      });
      while (ripples.length > maxRipples()) ripples.shift();
      draw();
      updatePlayback();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.strokeStyle = rippleColor;
      ripples.forEach((ripple) => {
        const progress = clamp(ripple.age / ripple.duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 2.2);
        const radius = 5 + eased * Math.min(width, height) * 0.34 * ripple.strength;
        context.globalAlpha = Math.pow(1 - progress, 1.5) * 0.62;
        context.lineWidth = 0.8 + (1 - progress) * 1.2;
        for (let ring = 0; ring < 3; ring += 1) {
          const ringRadius = radius - ring * 13;
          if (ringRadius <= 0) continue;
          context.beginPath();
          context.ellipse(ripple.x, ripple.y, ringRadius, ringRadius * 0.42, 0, 0, Math.PI * 2);
          context.stroke();
        }
      });
      context.restore();

      if (document.activeElement === canvas) {
        const x = keyboardCursor.x * width;
        const y = keyboardCursor.y * height;
        context.save();
        context.strokeStyle = rippleColor;
        context.globalAlpha = 0.55;
        context.setLineDash([2, 5]);
        context.beginPath();
        context.arc(x, y, 8, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      }
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
        draw();
        return;
      }
      const delta = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      ripples.forEach((ripple) => {
        ripple.age += delta;
      });
      ripples = ripples.filter((ripple) => ripple.age < ripple.duration);
      draw();
      if (ripples.length) frame = requestAnimationFrame(tick);
      else lastTime = null;
    };

    const updatePlayback = () => {
      if (motion.isRunning() && inView && ripples.length) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        stop();
        draw();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const oldWidth = width;
      const oldHeight = height;
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      if (oldWidth > 1 && oldHeight > 1) {
        ripples.forEach((ripple) => {
          ripple.x = (ripple.x / oldWidth) * width;
          ripple.y = (ripple.y / oldHeight) * height;
        });
      }
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      rippleColor = readColor();
      draw();
    };

    const eventPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    listen(canvas, "pointerdown", (event) => {
      pointerDown = true;
      canvas.setPointerCapture(event.pointerId);
      const point = eventPoint(event);
      addRipple(point.x, point.y, 1.15);
      lastPointerRipple = performance.now();
      event.preventDefault();
    });
    listen(canvas, "pointermove", (event) => {
      if (!pointerDown || performance.now() - lastPointerRipple < 90) return;
      const point = eventPoint(event);
      addRipple(point.x, point.y, 0.72);
      lastPointerRipple = performance.now();
    });
    const releasePointer = (event) => {
      pointerDown = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    listen(canvas, "pointerup", releasePointer);
    listen(canvas, "pointercancel", releasePointer);
    listen(canvas, "keydown", (event) => {
      const step = event.shiftKey ? 0.12 : 0.06;
      let handled = true;
      if (event.key === "ArrowLeft") keyboardCursor.x -= step;
      else if (event.key === "ArrowRight") keyboardCursor.x += step;
      else if (event.key === "ArrowUp") keyboardCursor.y -= step;
      else if (event.key === "ArrowDown") keyboardCursor.y += step;
      else if (event.key === "Enter" || event.key === " ") {
        addRipple(keyboardCursor.x * width, keyboardCursor.y * height, 1.1);
      } else handled = false;
      if (!handled) return;
      event.preventDefault();
      keyboardCursor.x = clamp(keyboardCursor.x, 0.06, 0.94);
      keyboardCursor.y = clamp(keyboardCursor.y, 0.08, 0.92);
      draw();
    });
    listen(canvas, "focus", draw);
    listen(canvas, "blur", draw);
    listen(clear, "click", () => {
      ripples = [];
      stop();
      draw();
    });
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      ripples = [];
      keyboardCursor.x = 0.5;
      keyboardCursor.y = 0.5;
      stop();
      addRipple(width * 0.5, height * 0.52, 0.9);
    });
    makeObserver(canvas, (visible) => {
      inView = visible;
      updatePlayback();
    });

    canvas.tabIndex = canvas.hasAttribute("tabindex") ? canvas.tabIndex : 0;
    canvas.style.touchAction = "none";
    if (!canvas.hasAttribute("aria-label")) {
      canvas.setAttribute("aria-label", "触れると水紋が広がる水面。矢印キーで位置を選び、Enterキーでも水紋を作れます");
    }
    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      listen(window, "resize", resize, { passive: true });
    }
    resize();
    addRipple(width * 0.5, height * 0.52, 0.9);
  });

  safeInit("type wave", () => {
    const stage = document.getElementById("typeStage");
    const phrase = document.getElementById("typePhrase");
    const amplitude = document.getElementById("typeAmplitude");
    const output = document.getElementById("typeAmplitudeOutput");
    const readable = document.getElementById("typeReadable");
    if (!stage || !phrase) return;

    const initialPhrase = phrase.value;
    const initialAmplitude = amplitude ? amplitude.value : "1";
    let letters = [];
    let inView = true;

    const graphemes = (value) => {
      const text = value.slice(0, 80);
      if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
        const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
        return Array.from(segmenter.segment(text), (part) => part.segment);
      }
      return Array.from(text);
    };

    const updatePlayback = () => {
      const running = motion.isRunning() && inView;
      stage.classList.toggle("is-motion-paused", !running);
      stage.style.setProperty("--type-play-state", running ? "running" : "paused");
      letters.forEach((letter) => {
        letter.style.animationPlayState = running ? "running" : "paused";
      });
    };

    const updateAmplitude = () => {
      const numeric = amplitude ? Number.parseFloat(amplitude.value) : 1;
      const value = Number.isFinite(numeric) ? numeric : 1;
      stage.style.setProperty("--wave-distance", `${(-6 * value).toFixed(2)}px`);
      if (output) output.textContent = `${value.toFixed(1)}×`;
    };

    const rebuild = () => {
      stage.querySelectorAll('.type-letter[data-generated="true"]').forEach((letter) => letter.remove());
      Array.from(stage.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      });
      const fragment = document.createDocumentFragment();
      const characters = graphemes(phrase.value);
      letters = characters.map((character, index) => {
        const letter = document.createElement("span");
        letter.className = "type-letter";
        letter.dataset.generated = "true";
        letter.textContent = character === " " ? "\u00a0" : character;
        letter.style.setProperty("--letter-index", String(index));
        letter.style.setProperty("--letter-delay", `${(index * -0.055).toFixed(3)}s`);
        letter.setAttribute("aria-hidden", "true");
        fragment.appendChild(letter);
        return letter;
      });
      stage.appendChild(fragment);
      stage.setAttribute("aria-label", phrase.value || "文字が入力されていません");
      stage.classList.toggle("is-empty", characters.length === 0);
      if (readable) readable.textContent = phrase.value;
      updatePlayback();
    };

    listen(phrase, "input", rebuild);
    listen(amplitude, "input", updateAmplitude);
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      phrase.value = initialPhrase;
      if (amplitude) amplitude.value = initialAmplitude;
      updateAmplitude();
      rebuild();
    });
    makeObserver(stage, (visible) => {
      inView = visible;
      updatePlayback();
    });

    updateAmplitude();
    rebuild();
  });

  safeInit("constellation", () => {
    const svg = document.getElementById("constellationSvg");
    const randomize = document.getElementById("constellationRandomize");
    if (!(svg instanceof SVGElement)) return;

    const namespace = "http://www.w3.org/2000/svg";
    const initialSeed = 41205;
    let seed = initialSeed;
    let points = [];
    let stars = [];
    let hitTargets = [];
    let lines = [];
    let selectedIndex = 0;
    let inView = true;

    const dimensions = () => {
      const box = svg.viewBox && svg.viewBox.baseVal;
      return {
        x: box && box.width ? box.x : 0,
        y: box && box.height ? box.y : 0,
        width: box && box.width ? box.width : 600,
        height: box && box.height ? box.height : 300,
      };
    };

    const randomGenerator = (value) => {
      let state = value >>> 0;
      return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
      };
    };

    const updatePlayback = () => {
      const running = motion.isRunning() && inView;
      svg.classList.toggle("is-motion-paused", !running);
      [...stars, ...lines].forEach((element) => {
        element.style.animationPlayState = running ? "running" : "paused";
      });
    };

    const selectStar = (index, focus = false) => {
      if (!stars.length) return;
      selectedIndex = (index + stars.length) % stars.length;
      stars.forEach((star, starIndex) => {
        star.classList.toggle("is-selected", starIndex === selectedIndex);
      });
      hitTargets.forEach((target, starIndex) => {
        const selected = starIndex === selectedIndex;
        target.classList.toggle("is-selected", selected);
        target.setAttribute("aria-pressed", String(selected));
      });
      lines.forEach((line) => {
        const connected = Number(line.dataset.a) === selectedIndex || Number(line.dataset.b) === selectedIndex;
        line.classList.toggle("is-selected", connected);
      });
      if (focus && hitTargets[selectedIndex]) hitTargets[selectedIndex].focus();
    };

    const build = (nextSeed) => {
      seed = nextSeed;
      svg.querySelectorAll('[data-constellation-generated="true"]').forEach((element) => element.remove());
      points = [];
      stars = [];
      hitTargets = [];
      lines = [];
      const box = dimensions();
      const compact = window.matchMedia("(max-width: 600px)").matches;
      const count = compact ? 15 : 22;
      const random = randomGenerator(seed);
      const marginX = box.width * 0.08;
      const marginY = box.height * 0.12;

      for (let index = 0; index < count; index += 1) {
        points.push({
          x: box.x + marginX + random() * (box.width - marginX * 2),
          y: box.y + marginY + random() * (box.height - marginY * 2),
          radius: 2.4 + random() * 2.3,
          glow: random(),
        });
      }

      const edges = new Map();
      points.forEach((point, index) => {
        const nearest = points
          .map((other, otherIndex) => ({ otherIndex, distance: Math.hypot(other.x - point.x, other.y - point.y) }))
          .filter((candidate) => candidate.otherIndex !== index)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2);
        nearest.forEach(({ otherIndex, distance }) => {
          if (distance > box.width * 0.28) return;
          const a = Math.min(index, otherIndex);
          const b = Math.max(index, otherIndex);
          edges.set(`${a}-${b}`, { a, b, distance });
        });
      });

      const lineFragment = document.createDocumentFragment();
      edges.forEach(({ a, b, distance }) => {
        const line = document.createElementNS(namespace, "line");
        line.classList.add("constellation-line");
        line.dataset.constellationGenerated = "true";
        line.dataset.a = String(a);
        line.dataset.b = String(b);
        line.setAttribute("x1", points[a].x.toFixed(2));
        line.setAttribute("y1", points[a].y.toFixed(2));
        line.setAttribute("x2", points[b].x.toFixed(2));
        line.setAttribute("y2", points[b].y.toFixed(2));
        line.style.setProperty("--line-opacity", `${clamp(1 - distance / (box.width * 0.32), 0.14, 0.72).toFixed(2)}`);
        lineFragment.appendChild(line);
        lines.push(line);
      });
      svg.appendChild(lineFragment);

      const starFragment = document.createDocumentFragment();
      points.forEach((point, index) => {
        const star = document.createElementNS(namespace, "circle");
        star.classList.add("constellation-star");
        star.dataset.constellationGenerated = "true";
        star.dataset.starIndex = String(index);
        star.setAttribute("cx", point.x.toFixed(2));
        star.setAttribute("cy", point.y.toFixed(2));
        star.setAttribute("r", point.radius.toFixed(2));
        star.style.setProperty("--star-delay", `${(-point.glow * 3.6).toFixed(2)}s`);
        star.style.setProperty("--star-scale", `${(0.78 + point.glow * 0.62).toFixed(2)}`);
        star.setAttribute("aria-hidden", "true");
        starFragment.appendChild(star);
        stars.push(star);

        const hit = document.createElementNS(namespace, "circle");
        hit.classList.add("constellation-star-hit");
        hit.dataset.constellationGenerated = "true";
        hit.dataset.starIndex = String(index);
        hit.setAttribute("cx", point.x.toFixed(2));
        hit.setAttribute("cy", point.y.toFixed(2));
        hit.setAttribute("r", "24");
        hit.setAttribute("fill", "transparent");
        hit.setAttribute("stroke", "transparent");
        hit.setAttribute("tabindex", "0");
        hit.setAttribute("role", "button");
        hit.setAttribute("aria-label", `星 ${index + 1}`);
        hit.setAttribute("aria-pressed", "false");
        listen(hit, "pointerenter", () => selectStar(index));
        listen(hit, "click", () => selectStar(index, true));
        listen(hit, "focus", () => selectStar(index));
        listen(hit, "keydown", (event) => {
          let next = index;
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index - 1;
          else if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index + 1;
          else if (event.key === "Enter" || event.key === " ") next = index;
          else return;
          event.preventDefault();
          selectStar(next, true);
        });
        starFragment.appendChild(hit);
        hitTargets.push(hit);
      });
      svg.appendChild(starFragment);
      selectStar(clamp(selectedIndex, 0, stars.length - 1));
      updatePlayback();
    };

    listen(svg, "pointermove", (event) => {
      if (!points.length) return;
      const rect = svg.getBoundingClientRect();
      const box = dimensions();
      const x = box.x + ((event.clientX - rect.left) / Math.max(rect.width, 1)) * box.width;
      const y = box.y + ((event.clientY - rect.top) / Math.max(rect.height, 1)) * box.height;
      let nearest = 0;
      let nearestDistance = Infinity;
      points.forEach((point, index) => {
        const distance = Math.hypot(point.x - x, point.y - y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });
      if (nearestDistance < box.width * 0.13) selectStar(nearest);
    });
    listen(randomize, "click", () => {
      selectedIndex = 0;
      build((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    });
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      selectedIndex = 0;
      build(initialSeed);
    });
    makeObserver(svg, (visible) => {
      inView = visible;
      updatePlayback();
    });

    svg.setAttribute("role", "group");
    build(initialSeed);
  });

  safeInit("magnet canvas", () => {
    const canvas = document.getElementById("magnetCanvas");
    const polarityButton = document.getElementById("magnetPolarity");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 1;
    let height = 1;
    let particles = [];
    let frame = 0;
    let lastTime = null;
    let phase = 0;
    let inView = true;
    let polarity = 1;
    let magnet = { x: 0.5, y: 0.5 };
    let palette = null;

    const seededRandom = (seed) => {
      const value = Math.sin(seed * 71.17 + 11.93) * 23841.71;
      return value - Math.floor(value);
    };

    const readPalette = () => {
      const styles = getComputedStyle(body);
      return {
        grain: styles.getPropertyValue("--magnet-grain").trim() || styles.getPropertyValue("--color-text").trim() || "#283735",
        north: styles.getPropertyValue("--magnet-north").trim() || "#b7684f",
        south: styles.getPropertyValue("--magnet-south").trim() || "#3c7d82",
        halo: styles.getPropertyValue("--magnet-halo").trim() || styles.getPropertyValue("--color-accent").trim() || "#c19751",
      };
    };

    const desiredParticleCount = () => {
      const compact = window.matchMedia("(max-width: 600px)").matches;
      return compact ? 150 : 320;
    };

    const createParticles = () => {
      const count = desiredParticleCount();
      particles = Array.from({ length: count }, (_, index) => ({
        x: 0.025 + seededRandom(index * 5 + 1) * 0.95,
        y: 0.04 + seededRandom(index * 5 + 2) * 0.92,
        length: 0.62 + seededRandom(index * 5 + 3) * 0.78,
        weight: 0.5 + seededRandom(index * 5 + 4) * 0.95,
        phase: seededRandom(index * 5 + 5) * Math.PI * 2,
      }));
    };

    const draw = () => {
      if (!palette) palette = readPalette();
      context.clearRect(0, 0, width, height);
      const magnetX = magnet.x * width;
      const magnetY = magnet.y * height;
      const influence = Math.max(120, Math.min(width, height) * 0.82);

      context.save();
      context.strokeStyle = palette.grain;
      context.fillStyle = polarity > 0 ? palette.north : palette.south;
      particles.forEach((particle) => {
        const x = particle.x * width;
        const y = particle.y * height;
        const dx = magnetX - x;
        const dy = magnetY - y;
        const distance = Math.max(12, Math.hypot(dx, dy));
        const strength = clamp(1 - distance / influence, 0, 1);
        const fieldCurve = Math.sin(distance * 0.018 + particle.phase) * (1 - strength) * 0.28;
        const angle = Math.atan2(dy, dx) + fieldCurve + (polarity < 0 ? Math.PI : 0);
        const jitter = Math.sin(phase * 1.7 + particle.phase) * 0.045 * (1 - strength);
        const length = (4 + strength * 9) * particle.length;
        const half = length * 0.5;
        const cosine = Math.cos(angle + jitter);
        const sine = Math.sin(angle + jitter);
        const x1 = x - cosine * half;
        const y1 = y - sine * half;
        const x2 = x + cosine * half;
        const y2 = y + sine * half;

        context.globalAlpha = 0.24 + strength * 0.66;
        context.lineWidth = particle.weight;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.globalAlpha = 0.3 + strength * 0.55;
        context.beginPath();
        context.arc(x2, y2, 0.65 + strength * 0.8, 0, Math.PI * 2);
        context.fill();
      });
      context.restore();

      const gradient = context.createRadialGradient(magnetX, magnetY, 2, magnetX, magnetY, 34);
      gradient.addColorStop(0, polarity > 0 ? palette.north : palette.south);
      gradient.addColorStop(0.3, palette.halo);
      gradient.addColorStop(1, "transparent");
      context.save();
      context.globalAlpha = 0.5;
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(magnetX, magnetY, 34, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 0.95;
      context.fillStyle = polarity > 0 ? palette.north : palette.south;
      context.beginPath();
      context.arc(magnetX, magnetY, 5.5, 0, Math.PI * 2);
      context.fill();
      context.restore();
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
        draw();
        return;
      }
      const delta = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.04);
      lastTime = time;
      phase += delta;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const updatePlayback = () => {
      if (motion.isRunning() && inView) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        stop();
        draw();
      }
    };

    const updatePolarity = () => {
      const reversed = polarity < 0;
      canvas.classList.toggle("is-reversed", reversed);
      canvas.dataset.polarity = reversed ? "south" : "north";
      if (polarityButton) {
        polarityButton.setAttribute("aria-pressed", String(reversed));
        polarityButton.textContent = reversed
          ? polarityButton.dataset.negativeLabel || "元の極性へ戻す"
          : polarityButton.dataset.positiveLabel || "極性を反転する";
      }
      draw();
    };

    const togglePolarity = () => {
      polarity *= -1;
      updatePolarity();
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
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      if (particles.length !== desiredParticleCount()) createParticles();
      palette = readPalette();
      draw();
    };

    const moveMagnet = (event) => {
      const rect = canvas.getBoundingClientRect();
      magnet.x = clamp((event.clientX - rect.left) / Math.max(rect.width, 1), 0.04, 0.96);
      magnet.y = clamp((event.clientY - rect.top) / Math.max(rect.height, 1), 0.06, 0.94);
      draw();
    };

    listen(canvas, "pointermove", moveMagnet);
    listen(canvas, "pointerdown", (event) => {
      moveMagnet(event);
      if (typeof canvas.setPointerCapture === "function") canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    listen(canvas, "keydown", (event) => {
      const step = event.shiftKey ? 0.12 : 0.055;
      let handled = true;
      if (event.key === "ArrowLeft") magnet.x -= step;
      else if (event.key === "ArrowRight") magnet.x += step;
      else if (event.key === "ArrowUp") magnet.y -= step;
      else if (event.key === "ArrowDown") magnet.y += step;
      else if (event.key === "Enter" || event.key === " ") togglePolarity();
      else handled = false;
      if (!handled) return;
      event.preventDefault();
      magnet.x = clamp(magnet.x, 0.04, 0.96);
      magnet.y = clamp(magnet.y, 0.06, 0.94);
      draw();
    });
    listen(polarityButton, "click", togglePolarity);
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      magnet = { x: 0.5, y: 0.5 };
      polarity = 1;
      phase = 0;
      updatePolarity();
      updatePlayback();
    });
    makeObserver(canvas, (visible) => {
      inView = visible;
      updatePlayback();
    });

    canvas.tabIndex = canvas.hasAttribute("tabindex") ? canvas.tabIndex : 0;
    canvas.style.touchAction = "none";
    if (!canvas.hasAttribute("aria-label")) {
      canvas.setAttribute("aria-label", "磁石を動かすと砂鉄の向きが変わる図。矢印キーでも磁石を動かせます");
    }
    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      listen(window, "resize", resize, { passive: true });
    }
    createParticles();
    updatePolarity();
    resize();
    updatePlayback();
  });

  safeInit("pendulum", () => {
    const stage = document.getElementById("pendulumStage");
    const syncButton = document.getElementById("pendulumSync");
    const tempo = document.getElementById("pendulumTempo");
    const output = document.getElementById("pendulumTempoOutput");
    if (!stage) return;

    const initialTempo = tempo ? tempo.value : "72";
    let pendulums = [];
    let synchronized = false;
    let inView = true;

    const tempoDetails = () => {
      const numeric = tempo ? Number.parseFloat(tempo.value) : 72;
      const value = Number.isFinite(numeric) && numeric > 0 ? numeric : 72;
      const maximum = tempo ? Number.parseFloat(tempo.max || "120") : 120;
      const multiplierMode = Number.isFinite(maximum) && maximum <= 4;
      return {
        value,
        duration: multiplierMode ? clamp(2.4 / value, 0.7, 5) : clamp(120 / value, 0.7, 4.8),
        label: multiplierMode ? `${value.toFixed(1)}×` : `${Math.round(value)} BPM`,
      };
    };

    const updatePlayback = () => {
      const running = motion.isRunning() && inView;
      stage.classList.toggle("is-motion-paused", !running);
      stage.style.setProperty("--pendulum-play-state", running ? "running" : "paused");
      pendulums.forEach((pendulum) => {
        pendulum.style.animationPlayState = running ? "running" : "paused";
      });
    };

    const updateSyncButton = () => {
      stage.classList.toggle("is-synchronized", synchronized);
      if (!syncButton) return;
      syncButton.setAttribute("aria-pressed", String(synchronized));
      syncButton.textContent = synchronized
        ? syncButton.dataset.unsyncLabel || "同期をほどく"
        : syncButton.dataset.syncLabel || "振り子を同期する";
    };

    const updateTempo = () => {
      const details = tempoDetails();
      stage.style.setProperty("--pendulum-tempo", String(details.value));
      stage.style.setProperty("--pendulum-sync-duration", `${details.duration.toFixed(3)}s`);
      if (output) output.textContent = details.label;
      pendulums.forEach((pendulum, index) => {
        const center = (pendulums.length - 1) / 2;
        const spread = synchronized ? 1 : 1 + (index - center) * 0.035;
        const duration = clamp(details.duration * spread, 0.58, 5.2);
        const delay = synchronized ? 0 : -index * details.duration * 0.115;
        const angle = 13 + Math.abs(index - center) * 1.8;
        pendulum.style.setProperty("--pendulum-duration", `${duration.toFixed(3)}s`);
        pendulum.style.setProperty("--pendulum-delay", `${delay.toFixed(3)}s`);
        pendulum.style.setProperty("--pendulum-angle", `${angle.toFixed(1)}deg`);
        pendulum.style.setProperty("--pendulum-angle-negative", `${(-angle).toFixed(1)}deg`);
      });
    };

    const desiredCount = () => {
      return 5;
    };

    const rebuild = () => {
      stage.querySelectorAll('.pendulum[data-generated="true"]').forEach((pendulum) => pendulum.remove());
      const count = desiredCount();
      const fragment = document.createDocumentFragment();
      pendulums = Array.from({ length: count }, (_, index) => {
        const pendulum = document.createElement("div");
        const string = document.createElement("span");
        const bob = document.createElement("span");
        pendulum.className = "pendulum";
        pendulum.dataset.generated = "true";
        pendulum.setAttribute("aria-hidden", "true");
        pendulum.style.setProperty("--pendulum-index", String(index));
        string.className = "pendulum-string";
        bob.className = "pendulum-bob";
        pendulum.append(string, bob);
        fragment.appendChild(pendulum);
        return pendulum;
      });
      stage.appendChild(fragment);
      updateTempo();
      updatePlayback();
    };

    listen(tempo, "input", updateTempo);
    listen(syncButton, "click", () => {
      synchronized = !synchronized;
      updateSyncButton();
      updateTempo();
    });
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      synchronized = false;
      if (tempo) tempo.value = initialTempo;
      updateSyncButton();
      updateTempo();
    });
    makeObserver(stage, (visible) => {
      inView = visible;
      updatePlayback();
    });

    if ("ResizeObserver" in window) {
      let lastCount = 0;
      new ResizeObserver(() => {
        const nextCount = desiredCount();
        if (nextCount !== lastCount) {
          lastCount = nextCount;
          rebuild();
        }
      }).observe(stage);
    }
    updateSyncButton();
    rebuild();
  });

  safeInit("season", () => {
    const stage = document.getElementById("seasonStage");
    const slider = document.getElementById("seasonSlider");
    const output = document.getElementById("seasonOutput");
    if (!stage || !slider) return;

    const initialValue = slider.value;
    const seasons = [
      { key: "spring", label: "春", particle: "season-petal" },
      { key: "summer", label: "夏", particle: "season-sprout" },
      { key: "autumn", label: "秋", particle: "season-leaf" },
      { key: "winter", label: "冬", particle: "season-snow" },
    ];
    let particles = [];
    let inView = true;

    const seededRandom = (seed) => {
      const value = Math.sin(seed * 54.913 + 23.71) * 19831.137;
      return value - Math.floor(value);
    };

    const currentIndex = () => {
      const min = Number.parseFloat(slider.min || "0");
      const max = Number.parseFloat(slider.max || "3");
      const value = Number.parseFloat(slider.value);
      if (!Number.isFinite(value) || max <= min) return 0;
      return clamp(Math.round(((value - min) / (max - min)) * 3), 0, 3);
    };

    const updatePlayback = () => {
      const running = motion.isRunning() && inView;
      stage.classList.toggle("is-motion-paused", !running);
      stage.style.setProperty("--season-play-state", running ? "running" : "paused");
      particles.forEach((particle) => {
        particle.style.animationPlayState = running ? "running" : "paused";
      });
    };

    const rebuild = () => {
      stage.querySelectorAll('.season-particle[data-generated="true"]').forEach((particle) => particle.remove());
      const index = currentIndex();
      const season = seasons[index];
      const compact = window.matchMedia("(max-width: 600px)").matches;
      const count = compact ? 15 : 24;
      const fragment = document.createDocumentFragment();
      particles = [];

      seasons.forEach((item) => stage.classList.toggle(`is-${item.key}`, item === season));
      stage.dataset.season = season.key;
      stage.style.setProperty("--season-progress", String(index / 3));
      stage.setAttribute("aria-label", `現在の季節は${season.label}`);
      if (output) output.textContent = season.label;

      for (let particleIndex = 0; particleIndex < count; particleIndex += 1) {
        const random = (offset) => seededRandom(index * 211 + particleIndex * 13 + offset);
        const particle = document.createElement("span");
        particle.className = `season-particle ${season.particle}`;
        particle.dataset.generated = "true";
        particle.setAttribute("aria-hidden", "true");
        particle.style.setProperty("--particle-x", `${(-6 + random(1) * 112).toFixed(2)}%`);
        particle.style.setProperty("--particle-y", `${(-12 + random(2) * 108).toFixed(2)}%`);
        particle.style.setProperty("--particle-delay", `${(-random(3) * 9).toFixed(2)}s`);
        particle.style.setProperty("--particle-duration", `${(5.5 + random(4) * 7.5).toFixed(2)}s`);
        particle.style.setProperty("--particle-drift", `${(-44 + random(5) * 88).toFixed(1)}px`);
        particle.style.setProperty("--particle-size", `${(6 + random(6) * 8).toFixed(1)}px`);
        particle.style.setProperty("--particle-spin", `${Math.round(120 + random(7) * 560)}deg`);
        fragment.appendChild(particle);
        particles.push(particle);
      }
      stage.appendChild(fragment);
      updatePlayback();
    };

    listen(slider, "input", rebuild);
    listen(body, "animationlab:motionchange", updatePlayback);
    listen(body, "animationlab:reset", () => {
      slider.value = initialValue;
      rebuild();
    });
    makeObserver(stage, (visible) => {
      inView = visible;
      updatePlayback();
    });

    rebuild();
  });

  safeInit("random exhibit", () => {
    const button = document.getElementById("randomExhibit");
    if (!button) return;
    const panels = Array.from(document.querySelectorAll(".animation-panel"));
    if (!panels.length) return;
    let previousIndex = -1;
    let highlightTimer = 0;

    const clearHighlight = () => {
      window.clearTimeout(highlightTimer);
      panels.forEach((panel) => panel.classList.remove("is-random-highlight"));
    };

    listen(button, "click", () => {
      clearHighlight();
      let nextIndex = Math.floor(Math.random() * panels.length);
      if (panels.length > 1 && nextIndex === previousIndex) nextIndex = (nextIndex + 1) % panels.length;
      previousIndex = nextIndex;
      const panel = panels[nextIndex];
      panel.classList.add("is-random-highlight");
      panel.scrollIntoView({ behavior: motion.isRunning() ? "smooth" : "auto", block: "center" });
      highlightTimer = window.setTimeout(() => panel.classList.remove("is-random-highlight"), 1800);
    });
    listen(body, "animationlab:reset", () => {
      previousIndex = -1;
      clearHighlight();
    });
  });
})();
