const slides = Array.from(document.querySelectorAll(".slide"));
const app = document.getElementById("app");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const state = {
  currentIndex: 0,
  maxUnlockedIndex: 0,
  autoAdvanceTimer: null,
  isAnimating: false,
  touchStartY: 0,
  answers: {
    height: null,
    weight: null,
    flexibility: null,
    grip: null,
    preference: null
  },
  sessionId: crypto.randomUUID(),
  createdAt: new Date().toISOString()
};

const questions = [
  {
    id: "height",
    container: "options-q1",
    scene: "scene-q1",
    options: [
      { label: "A", value: "short", text: "门框？什么门框？我只看到了自由" },
      { label: "B", value: "medium", text: "不用低头，但门框在用眼神警告我" },
      { label: "C", value: "tall", text: "我每次进去都在向厕所低头致敬" }
    ]
  },
  {
    id: "weight",
    container: "options-q2",
    scene: "scene-q2",
    options: [
      { label: "A", value: "light", text: "随便坐，凳子对我来说只是一个人生道具" },
      { label: "B", value: "medium", text: "偶尔听到凳子发出不明声响，我假装没听见" },
      { label: "C", value: "heavy", text: "我会先跟凳子进行灵魂对视，确认它做好了心理准备" }
    ]
  },
  {
    id: "flexibility",
    container: "options-q3",
    scene: "scene-q3",
    options: [
      { label: "A", value: "high", text: "手不仅碰到地，我已经可以顺手拖个地了" },
      { label: "B", value: "medium", text: "刚好摸到，同时膝盖在小声抗议" },
      { label: "C", value: "low", text: "弯腰很累诶，蹲一下又能怎？" }
    ]
  },
  {
    id: "grip",
    container: "options-q4",
    scene: "scene-q4",
    options: [
      { label: "A", value: "low", text: "我和瓶盖之间存在无法调和的矛盾" },
      { label: "B", value: "medium", text: "正常拧开，毫无故事可讲" },
      { label: "C", value: "high", text: "我曾经拧开一瓶出厂就没打算被打开的矿泉水，厂家至今不知道" }
    ]
  },
  {
    id: "preference",
    container: "options-q5",
    scene: null,
    options: [
      {
        label: "A",
        value: "bouldering",
        text: "反复研究同一关卡，死一百次也要找到最优解，通关那一刻眼眶湿润（Soullike game 赛高）"
      },
      {
        label: "B",
        value: "lead",
        text: "管他什么路线，先跑起来再说，死了重来继续冲，爽就一个字！对吗老铁！"
      }
    ]
  }
];

const COPY = {
  height: {
    short: "门框对你来说形同虚设，但这恰恰是你的隐藏优势——重心低，稳如泰山，在岩壁上你就是最灵活的存在。",
    medium: "你和门框之间维持着一种微妙的和平关系，不高不矮刚刚好，在岩壁上你拥有最均衡的身体比例。",
    tall: "你拥有令人羡慕的臂展，别人拼命够不到的点位对你来说只是顺手一摸，岩壁就是你的伸展台。"
  },
  weight: {
    light: "体重是你最大的盟友，每一次抓握你的手指负担都比别人小，挂在岩壁上对你来说就像挂在沙发上一样自然。",
    medium: "体重控制得恰到好处，不会给手指太大压力，也不会被风吹跑——凳子对你的信任度也刚好及格。",
    heavy: "虽然凳子见到你会紧张，但重量带来的力量感是真实的，一旦你抓稳了，谁也别想把你从岩壁上晃下来。"
  },
  flexibility: {
    high: "你的柔韧性让你在岩壁上多了一套别人没有的动作库——高抬腿、侧身、劈叉上墙，对你来说都是基本操作。",
    medium: "柔韧性中规中矩，大部分动作都能完成，偶尔遇到需要劈叉的路线时，你的膝盖会发表一些不同意见。",
    low: "柔韧性不是你的强项，但没关系，攀岩又不是体操——你可以用力量和策略弥补，蹲下去捡东西也是一种智慧。"
  },
  grip: {
    low: "你和瓶盖之间的矛盾暂时无法调和，但攀岩会改变这一切——几次训练之后，瓶盖会开始怕你。",
    medium: "握力够用，拧瓶盖毫无故事可讲，在岩壁上你能稳稳抓住大部分点位，不会轻易滑落。",
    high: "你的手指是经过认证的——连出厂就没打算被打开的瓶盖都臣服于你，岩壁上的点位对你来说就像门把手一样随意。"
  },
  preference: {
    bouldering: "你骨子里是个死磕型选手——同一面墙、同一条路线，死一百次也要找到最优解。抱石，就是你的修行。",
    lead: "你天生就是往上冲的人——管它什么路线，先爬起来再说。爬高模式就是你的主场，越高越兴奋。"
  },
  guide: "你的攀岩DNA已解锁，去小程序看看真正适合你的路线吧 →"
};

const TITLE_RULES = [
  { title: "岩壁上的长臂猿", match: (a) => a.height === "tall" && a.weight === "light" },
  { title: "人形登山杖", match: (a) => a.height === "tall" && a.grip === "high" },
  { title: "高空作业持证选手", match: (a) => a.height === "tall" && a.preference === "lead" },
  { title: "温柔的巨人", match: (a) => a.height === "tall" && a.grip === "low" },
  { title: "低空战斗机", match: (a) => a.height === "short" && a.grip === "high" },
  { title: "岩壁小蜘蛛", match: (a) => a.height === "short" && a.weight === "light" && a.flexibility === "high" },
  { title: "倔强的小精灵", match: (a) => a.height === "short" && a.preference === "bouldering" },
  { title: "口袋里的攀岩王者", match: (a) => a.height === "short" && a.grip === "high" && a.preference === "lead" },
  { title: "人形攀岩锤", match: (a) => a.weight === "heavy" && a.grip === "high" },
  { title: "稳如磐石本石", match: (a) => a.weight === "heavy" && a.preference === "bouldering" },
  { title: "凳子终结者", match: (a) => a.weight === "heavy" && a.flexibility === "low" },
  { title: "岩壁上的瑜伽大师", match: (a) => a.flexibility === "high" && a.grip === "high" },
  { title: "柔软的征服者", match: (a) => a.flexibility === "high" && a.weight === "light" },
  { title: "铁手指联盟会长", match: (a) => a.grip === "high" && a.flexibility === "high" },
  { title: "瓶盖克星·岩壁新星", match: (a) => a.grip === "high" && a.preference === "lead" },
  { title: "六边形攀岩战士", match: (a) => a.height === "medium" && a.weight === "medium" && a.flexibility === "medium" && a.grip === "medium" },
  { title: "佛系攀岩人", match: (a) => a.flexibility === "low" && a.grip === "low" },
  { title: "潜力无限的攀岩新星", match: () => true }
];

function init() {
  renderWelcomeScene();
  renderQuestions();
  bindEvents();
  updateProgress();
  updateSlides();
  renderResult();
  persistUserData();
}

function renderQuestions() {
  questions.forEach((question) => {
    const container = document.getElementById(question.container);
    const selected = state.answers[question.id];

    container.innerHTML = question.options.map((option) => {
      const isSelected = selected === option.value;
      const isDimmed = selected && selected !== option.value;
      const extraClass = [
        "option-card",
        question.id === "preference" ? "preference-card" : "",
        isSelected ? "selected" : "",
        isDimmed ? "dimmed" : ""
      ].filter(Boolean).join(" ");

      if (question.id === "preference") {
        return `
          <button class="${extraClass}" data-question="${question.id}" data-value="${option.value}">
            <div class="mini-scene">${renderPreferenceScene(option.value)}</div>
            <div>
              <span class="option-label">${option.label}</span>
              <p>${option.text}</p>
            </div>
          </button>
        `;
      }

      return `
        <button class="${extraClass}" data-question="${question.id}" data-value="${option.value}">
          <span class="option-label">${option.label}</span>
          <p>${option.text}</p>
        </button>
      `;
    }).join("");

    if (question.scene) {
      document.getElementById(question.scene).innerHTML = renderQuestionScene(question.id, selected);
    }
  });
}

function bindEvents() {
  document.getElementById("startButton").addEventListener("click", () => {
    state.maxUnlockedIndex = Math.max(state.maxUnlockedIndex, 1);
    goToSlide(1);
  });
  document.addEventListener("click", handleClick);
  document.addEventListener("wheel", handleWheel, { passive: false });
  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });
  document.addEventListener("keydown", handleKeydown);
  document.getElementById("miniProgramButton").addEventListener("click", handleMiniProgram);
  document.getElementById("gameButton").addEventListener("click", handleGameLink);
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("qrModal").addEventListener("click", (event) => {
    if (event.target.dataset.close === "modal") {
      closeModal();
    }
  });
}

function handleClick(event) {
  const optionButton = event.target.closest("[data-question]");
  if (!optionButton) {
    return;
  }

  const { question, value } = optionButton.dataset;
  selectAnswer(question, value);
}

function selectAnswer(questionId, value) {
  state.answers[questionId] = value;
  const questionIndex = questions.findIndex((question) => question.id === questionId);
  const slideIndex = questionIndex + 1;
  state.maxUnlockedIndex = Math.max(state.maxUnlockedIndex, slideIndex + 1);

  renderQuestions();
  renderResult();
  persistUserData();
  updateProgress();

  clearTimeout(state.autoAdvanceTimer);
  state.autoAdvanceTimer = setTimeout(() => {
    goToSlide(Math.min(slideIndex + 1, slides.length - 1));
  }, 800);
}

function getActiveSlide() {
  return slides[state.currentIndex];
}

function canScrollSlide(slide) {
  return slide && slide.scrollHeight - slide.clientHeight > 8;
}

function isSlideAtTop(slide) {
  return !slide || slide.scrollTop <= 2;
}

function isSlideAtBottom(slide) {
  return !slide || slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 2;
}

function handleWheel(event) {
  const activeSlide = getActiveSlide();

  if (canScrollSlide(activeSlide)) {
    const scrollingDownInside = event.deltaY > 0 && !isSlideAtBottom(activeSlide);
    const scrollingUpInside = event.deltaY < 0 && !isSlideAtTop(activeSlide);

    if (scrollingDownInside || scrollingUpInside) {
      event.preventDefault();
      activeSlide.scrollTop += event.deltaY;
      return;
    }
  }

  event.preventDefault();
  if (state.isAnimating || Math.abs(event.deltaY) < 20) {
    return;
  }
  tryStep(event.deltaY > 0 ? 1 : -1);
}

function handleTouchStart(event) {
  state.touchStartY = event.changedTouches[0].clientY;
  const activeSlide = getActiveSlide();
  state.touchStartScrollTop = activeSlide ? activeSlide.scrollTop : 0;
}

function handleTouchEnd(event) {
  const endY = event.changedTouches[0].clientY;
  const delta = state.touchStartY - endY;
  const activeSlide = getActiveSlide();

  if (Math.abs(delta) < 40 || state.isAnimating) {
    return;
  }

  if (canScrollSlide(activeSlide)) {
    const movedByNativeScroll = Math.abs((activeSlide?.scrollTop || 0) - state.touchStartScrollTop) > 8;
    if (movedByNativeScroll) {
      return;
    }

    if (delta > 0 && !isSlideAtBottom(activeSlide)) {
      return;
    }

    if (delta < 0 && !isSlideAtTop(activeSlide)) {
      return;
    }
  }

  tryStep(delta > 0 ? 1 : -1);
}

function handleKeydown(event) {
  if (["ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    tryStep(1);
  }
  if (["ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    tryStep(-1);
  }
  if (event.key === "Escape") {
    closeModal();
  }
}

function tryStep(direction) {
  const nextIndex = state.currentIndex + direction;
  if (nextIndex < 0 || nextIndex > state.maxUnlockedIndex) {
    return;
  }
  goToSlide(nextIndex);
}

function goToSlide(index) {
  if (index < 0 || index > state.maxUnlockedIndex) {
    return;
  }

  clearTimeout(state.autoAdvanceTimer);
  state.currentIndex = index;
  state.isAnimating = true;
  updateSlides();
  updateProgress();
  window.setTimeout(() => {
    state.isAnimating = false;
  }, 720);
}

function updateSlides() {
  app.style.transform = `translateY(-${state.currentIndex * window.innerHeight}px)`;
  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === state.currentIndex);
  });

  if (state.currentIndex === slides.length - 1) {
    slides[slides.length - 1].scrollTop = 0;
  }
}

function updateProgress() {
  const answeredCount = Object.values(state.answers).filter(Boolean).length;
  progressFill.style.width = `${(answeredCount / questions.length) * 100}%`;

  if (state.currentIndex === 0) {
    progressText.textContent = "准备出发";
    return;
  }

  if (answeredCount === questions.length && state.currentIndex === slides.length - 1) {
    progressText.textContent = "人格已生成";
    state.maxUnlockedIndex = slides.length - 1;
    return;
  }

  progressText.textContent = `已解锁 ${Math.min(state.maxUnlockedIndex, 5)}/5 题`;
}

function renderWelcomeScene() {
  document.getElementById("welcomeScene").innerHTML = "";
}

function renderQuestionScene(questionId, selected) {
  switch (questionId) {
    case "height":
      return renderHeightScene(selected);
    case "weight":
      return renderWeightScene(selected);
    case "flexibility":
      return renderFlexibilityScene(selected);
    case "grip":
      return renderGripScene(selected);
    default:
      return "";
  }
}

function renderHeightScene(selected) {
  const pose = selected || "default";
  const headY = { default: 150, short: 152, medium: 130, tall: 112 }[pose];
  const bodyEnd = { default: 235, short: 237, medium: 220, tall: 210 }[pose];
  const topLine = pose === "tall" ? "rotate(-16 340 205)" : "";
  const caption = { default: "门口停顿中", short: "门框？什么门框？", medium: "门框在看我", tall: "哐一下，头先进去" }[pose];
  const eye = pose === "medium" ? `<g class="blink"><circle cx="490" cy="95" r="16" fill="#f3efe5"/><circle cx="486" cy="92" r="5" fill="#1a1d1f"/></g>` : "";
  const star = pose === "tall" ? `<path class="bounce" d="M410 88 l10 18 l18 10 l-18 10 l-10 18 l-10 -18 l-18 -10 l18 -10 z" fill="#fd7a1e"/>` : "";
  return `
    <svg class="scene-svg" viewBox="0 0 760 340" aria-hidden="true">
      <path d="M500 54 H640 V280 H500" fill="none" stroke="#697171" stroke-width="10" stroke-linecap="round"></path>
      <path d="M500 64 H620" stroke="#c8ff4d" stroke-width="4" opacity="0.35"></path>
      ${eye}
      ${star}
      <text x="80" y="74" fill="#c8ff4d" font-size="24" font-family="Rubik, sans-serif">${caption}</text>
      <g transform="${topLine}" class="${pose === "tall" ? "wiggle" : pose === "short" ? "floaty" : ""} scene-pop">
        <circle cx="340" cy="${headY}" r="18" fill="#f3efe5"></circle>
        <path d="M340 ${headY + 18} L340 ${bodyEnd} M340 ${headY + 44} L308 218 M340 ${headY + 44} L374 205 M340 ${bodyEnd} L314 274 M340 ${bodyEnd} L370 274" stroke="#f3efe5" stroke-width="8" stroke-linecap="round"></path>
      </g>
      <path d="M90 286 H668" stroke="#2b3436" stroke-width="6" stroke-linecap="round"></path>
    </svg>
  `;
}

function renderWeightScene(selected) {
  const pose = selected || "default";
  const seatClass = pose === "medium" ? "wiggle" : pose === "heavy" ? "bounce" : "";
  const bodyWidth = { default: 0, light: 0, medium: 4, heavy: 8 }[pose];
  const bubble = { default: "在凳子前深思熟虑", light: "落座如羽毛", medium: "嘎吱，但先装作没听见", heavy: "先和凳子对视一下" }[pose];
  return `
    <svg class="scene-svg" viewBox="0 0 760 340" aria-hidden="true">
      <text x="74" y="74" fill="#c8ff4d" font-size="24" font-family="Rubik, sans-serif">${bubble}</text>
      <g class="${seatClass}">
        <path d="M430 205 H525 L542 262 H413 Z" fill="#fd7a1e" opacity="0.82"></path>
        <path d="M438 262 L422 306 M533 262 L545 306" stroke="#9d541d" stroke-width="7" stroke-linecap="round"></path>
      </g>
      <g class="${pose === "light" ? "floaty" : ""} scene-pop">
        <circle cx="355" cy="${pose === "default" ? 136 : 125}" r="18" fill="#f3efe5"></circle>
        <ellipse cx="355" cy="${pose === "default" ? 198 : 185}" rx="${22 + bodyWidth}" ry="${34 + bodyWidth}" fill="none" stroke="#f3efe5" stroke-width="8"></ellipse>
        <path d="M334 178 L304 ${pose === "heavy" ? 165 : 185} M376 178 L404 ${pose === "default" ? 188 : 176}" stroke="#f3efe5" stroke-width="8" stroke-linecap="round"></path>
        <path d="M344 226 L322 274 M366 226 L390 274" stroke="#f3efe5" stroke-width="8" stroke-linecap="round"></path>
      </g>
      ${pose === "medium" ? `<text x="480" y="182" fill="#f3efe5" font-size="24" font-family="Rubik, sans-serif">嘎吱</text>` : ""}
      ${pose === "heavy" ? `<text x="468" y="190" fill="#f3efe5" font-size="24" font-family="Rubik, sans-serif">...抖一抖</text>` : ""}
      <path d="M74 306 H678" stroke="#2b3436" stroke-width="6" stroke-linecap="round"></path>
    </svg>
  `;
}

function renderFlexibilityScene(selected) {
  const pose = selected || "default";
  const caption = { default: "手机掉了，先观望一秒", high: "顺手把地也擦了", medium: "碰到了，但膝盖有话说", low: "直接蹲，合理合法" }[pose];
  return `
    <svg class="scene-svg" viewBox="0 0 760 340" aria-hidden="true">
      <text x="74" y="74" fill="#c8ff4d" font-size="24" font-family="Rubik, sans-serif">${caption}</text>
      <rect x="456" y="252" width="22" height="34" rx="6" fill="#f3efe5"></rect>
      <g class="${pose === "high" ? "wiggle" : pose === "medium" ? "bounce" : ""} scene-pop" transform="${pose === "high" ? "rotate(60 346 206)" : pose === "medium" ? "rotate(42 350 210)" : pose === "low" ? "translate(0 26)" : ""}">
        <circle cx="352" cy="${pose === "low" ? 170 : 132}" r="18" fill="#f3efe5"></circle>
        <path d="M352 ${pose === "low" ? 188 : 150} L352 ${pose === "high" ? 210 : pose === "medium" ? 220 : pose === "low" ? 224 : 230} M352 ${pose === "low" ? 204 : 174} L322 202 M352 ${pose === "low" ? 204 : 174} L386 ${pose === "high" ? 244 : pose === "medium" ? 234 : 184} M352 ${pose === "low" ? 224 : pose === "high" ? 210 : 220} L324 280 M352 ${pose === "low" ? 224 : pose === "high" ? 210 : 220} L390 280" stroke="#f3efe5" stroke-width="8" stroke-linecap="round"></path>
      </g>
      ${pose === "medium" ? `<text x="250" y="236" fill="#ff6e5b" font-size="18" font-family="Noto Sans SC, sans-serif">膝盖：我有意见</text>` : ""}
      ${pose === "low" ? `<text x="250" y="236" fill="#f3efe5" font-size="18" font-family="Noto Sans SC, sans-serif">蹲下捡，主打一个务实</text>` : ""}
      <path d="M74 306 H678" stroke="#2b3436" stroke-width="6" stroke-linecap="round"></path>
    </svg>
  `;
}

function renderGripScene(selected) {
  const pose = selected || "default";
  const caption = { default: "瓶盖还没开始发力", low: "瓶盖：谢邀，不开", medium: "咔哒一声，正常营业", high: "一拧飞天，水花四溅" }[pose];
  return `
    <svg class="scene-svg" viewBox="0 0 760 340" aria-hidden="true">
      <text x="74" y="74" fill="#c8ff4d" font-size="24" font-family="Rubik, sans-serif">${caption}</text>
      <g class="${pose === "high" ? "celebrate" : pose === "low" ? "wiggle" : ""} scene-pop">
        <circle cx="274" cy="128" r="18" fill="#f3efe5"></circle>
        <path d="M274 146 L274 222 M274 172 L322 158 M274 172 L230 186 M274 222 L246 276 M274 222 L304 276" stroke="#f3efe5" stroke-width="8" stroke-linecap="round"></path>
      </g>
      <g>
        <rect x="332" y="138" width="46" height="98" rx="18" fill="#7d8584"></rect>
        <rect x="340" y="118" width="30" height="26" rx="10" fill="#f3efe5"></rect>
      </g>
      ${pose === "low" ? `<text x="216" y="104" fill="#f3efe5" font-size="24" font-family="Rubik, sans-serif">???</text>` : ""}
      ${pose === "medium" ? `<path d="M380 124 Q408 112 430 126" stroke="#c8ff4d" stroke-width="6" fill="none" stroke-linecap="round"></path>` : ""}
      ${pose === "high" ? `<g class="bounce glow-pulse"><rect x="416" y="88" width="30" height="24" rx="8" fill="#f3efe5"></rect><path d="M388 132 Q430 116 462 88" stroke="#fd7a1e" stroke-width="6" fill="none" stroke-linecap="round"></path><path d="M366 160 C414 150, 450 166, 472 184" stroke="#8ad8ff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9"></path></g>` : ""}
      <path d="M74 306 H678" stroke="#2b3436" stroke-width="6" stroke-linecap="round"></path>
    </svg>
  `;
}

function renderPreferenceScene(value) {
  if (value === "bouldering") {
    return `
      <svg class="mini-svg" viewBox="0 0 420 220" aria-hidden="true">
        <path d="M40 184 C85 86, 144 66, 186 78 C226 92, 254 124, 284 120 C314 116, 338 96, 366 78 L366 184 Z" fill="#283134"></path>
        <circle cx="126" cy="118" r="9" fill="#c8ff4d"></circle>
        <circle cx="166" cy="96" r="10" fill="#fd7a1e"></circle>
        <circle cx="228" cy="142" r="9" fill="#c8ff4d"></circle>
        <g class="celebrate glow-pulse">
          <circle cx="210" cy="70" r="10" fill="#f3efe5"></circle>
          <path d="M210 80 L210 116 M210 92 L226 78 M210 92 L196 108 M210 116 L194 142 M210 116 L224 144" stroke="#f3efe5" stroke-width="5" stroke-linecap="round"></path>
        </g>
        <text x="34" y="34" fill="#f3efe5" font-size="18" font-family="Rubik, sans-serif">Try. Fail. Retry. Send.</text>
      </svg>
    `;
  }

  return `
    <svg class="mini-svg" viewBox="0 0 420 220" aria-hidden="true">
      <path d="M316 24 C346 44, 362 76, 372 110 C382 144, 382 168, 378 186 L286 186 C292 134, 290 94, 278 52 C290 38, 302 28, 316 24 Z" fill="#283134"></path>
      <circle cx="304" cy="64" r="10" fill="#fd7a1e"></circle>
      <circle cx="328" cy="98" r="10" fill="#c8ff4d"></circle>
      <circle cx="320" cy="142" r="10" fill="#fd7a1e"></circle>
      <g class="floaty glow-pulse">
        <circle cx="256" cy="136" r="10" fill="#f3efe5"></circle>
        <path d="M256 146 L256 178 M256 156 L282 136 M256 156 L236 176 M256 178 L236 204 M256 178 L274 204" stroke="#f3efe5" stroke-width="5" stroke-linecap="round"></path>
      </g>
      <path d="M284 138 Q260 118 246 98" stroke="#f3efe5" stroke-width="4" stroke-dasharray="7 7" fill="none"></path>
      <text x="32" y="34" fill="#f3efe5" font-size="18" font-family="Rubik, sans-serif">Fast line, big send energy.</text>
    </svg>
  `;
}

function matchTitle(answers) {
  // Sequential matching makes the title pool easy to extend later.
  return TITLE_RULES.find((rule) => rule.match(answers)).title;
}

function generateSummary(answers) {
  const complete = Object.values(answers).every(Boolean);
  if (!complete) {
    return {
      title: "潜力无限的攀岩新星",
      summary: "再答完剩下的题目，你的攀岩人格就会完整显形。现在它还像一条正在试探脚点的路线，差最后几步就能送顶。",
      style: "先把测试做完，你的攀岩风格点评马上到位。",
      guide: COPY.guide
    };
  }

  return {
    title: matchTitle(answers),
    summary: [
      COPY.height[answers.height],
      COPY.weight[answers.weight],
      COPY.flexibility[answers.flexibility],
      COPY.grip[answers.grip]
    ].join(""),
    style: COPY.preference[answers.preference],
    guide: COPY.guide
  };
}

function renderResultPage(summaryData) {
  const card = document.getElementById("personaCard");
  document.getElementById("personaTitle").textContent = summaryData.title;
  document.getElementById("personaSummary").textContent = summaryData.summary;
  document.getElementById("personaStyle").textContent = summaryData.style;
  document.getElementById("personaGuide").textContent = summaryData.guide;

  // Restart card animations after each answer change.
  card.classList.remove("is-ready");
  void card.offsetWidth;
  card.classList.add("is-ready");
}

function renderResult() {
  const summaryData = generateSummary(state.answers);
  renderResultPage(summaryData);

  if (Object.values(state.answers).every(Boolean)) {
    state.maxUnlockedIndex = slides.length - 1;
  }
}

function buildPayload() {
  return {
    session_id: state.sessionId,
    created_at: state.createdAt,
    answers: { ...state.answers }
  };
}

function persistUserData() {
  localStorage.setItem("climbing_user_data", JSON.stringify(buildPayload()));
}

function handleMiniProgram() {
  const payload = buildPayload();
  const url = new URL("https://example.com/climb-wise-mini-program");
  url.searchParams.set("session_id", payload.session_id);

  const ua = navigator.userAgent.toLowerCase();
  const isWeChat = /micromessenger/.test(ua);
  const isMobile = /android|iphone|ipad|ipod|mobile/.test(ua);

  if (!Object.values(payload.answers).every(Boolean)) {
    goToFirstIncomplete();
    return;
  }

  if (!isMobile) {
    document.getElementById("modalText").textContent = `请用微信扫码进入小程序，占位图后续可替换为正式小程序码。session_id: ${payload.session_id}`;
    openModal();
    return;
  }

  url.searchParams.set("env", isWeChat ? "wechat" : "mobile_browser");
  window.location.href = url.toString();
}

function handleGameLink() {
  const payload = buildPayload();
  const target = new URL("./game.html", window.location.href);
  target.searchParams.set("session_id", payload.session_id);
  window.location.href = target.toString();
}

function goToFirstIncomplete() {
  const index = questions.findIndex((question) => !state.answers[question.id]);
  if (index >= 0) {
    goToSlide(index + 1);
  }
}

function openModal() {
  const modal = document.getElementById("qrModal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const modal = document.getElementById("qrModal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

init();


