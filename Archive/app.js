(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const views = {
    home: $("#homeView"),
    say: $("#sayView"),
    knok: $("#knokView")
  };

  const state = {
    view: "home",
    context: "일상",
    sayOutputText: "",
    latestTranscript: "",
    recognitionCandidates: [],
    recognition: null,
    listening: false,
    recognitionStarting: false,
    recognitionFailed: false,
    speechRecognitionBlocked: false,
    microphonePermission: "checking",
    serialPort: null,
    serialReader: null,
    serialConnected: false,
    serialConnecting: false,
    armed: false,
    measuringTimeout: null,
    impactCooldownTimer: null,
    impactCooldownUntil: 0,
    history: [],
    activityTimer: null,
    settings: {
      targetMin: 50,
      targetMax: 60,
      rawMin: 150,
      rawMax: 2500,
      sound: true,
      autoReset: true
    }
  };

  const IMPACT_DUPLICATE_WINDOW_MS = 1000;

  /*
   * 아래 규칙은 실제 마이크로 들어온 음성 인식 결과만 정리합니다.
   * 입력이 없을 때 문장을 만들어내거나, 예시 문장을 자동 선택하지 않습니다.
   */
  const phraseRules = [
    {
      contexts: ["일상", "병원"],
      keys: ["물", "무", "마시", "마셔", "목말", "시퍼", "싶어"],
      aliases: ["물마시고싶어요", "무마시고시퍼요", "물마시고시퍼요", "물먹고싶어요"],
      output: "물을 마시고 싶어요."
    },
    {
      contexts: ["일상", "학교", "병원"],
      keys: ["기다", "잠시", "기달", "주세", "주세여"],
      aliases: ["잠시기다려주세요", "잠시기달려주세여", "기다려주세요"],
      output: "잠시 기다려 주세요."
    },
    {
      contexts: ["일상", "학교", "병원"],
      keys: ["도와", "도아", "도움", "살려", "도와줘"],
      aliases: ["도와주세요", "도아주세요", "도와줘요"],
      output: "도와주세요."
    },
    {
      contexts: ["학교"],
      keys: ["질문", "물어", "궁금"],
      aliases: ["질문이있어요", "질문있어요"],
      output: "질문이 있어요."
    },
    {
      contexts: ["학교", "병원"],
      keys: ["천천", "설명", "느리게"],
      aliases: ["천천히설명해주세요", "조금천천히말해주세요"],
      output: "조금 천천히 설명해 주세요."
    },
    {
      contexts: ["일상", "학교"],
      keys: ["쉬고", "휴식", "쉬고싶", "피곤"],
      aliases: ["잠시쉬고싶어요", "쉬고싶어요"],
      output: "잠시 쉬고 싶어요."
    },
    {
      contexts: ["병원"],
      keys: ["아파", "아포", "통증", "아픔"],
      aliases: ["여기가아파요", "아파요", "여기아포요"],
      output: "여기가 아파요."
    },
    {
      contexts: ["병원"],
      keys: ["보호자", "가족", "엄마", "아빠", "불러"],
      aliases: ["보호자를불러주세요", "가족을불러주세요"],
      output: "보호자를 불러 주세요."
    },
    {
      contexts: ["일상", "학교", "병원"],
      keys: ["화장실", "화장실가고", "쉬마려"],
      aliases: ["화장실에가고싶어요", "화장실가고싶어요"],
      output: "화장실에 가고 싶어요."
    },
    {
      contexts: ["일상", "학교", "병원"],
      keys: ["싫", "아니", "안할", "원하지"],
      aliases: ["원하지않아요", "싫어요", "아니에요"],
      output: "괜찮습니다. 원하지 않아요."
    }
  ];

  const refs = {
    topbarStatus: $("#topbarStatus"),
    toast: $("#toast"),
    fullscreenButton: $("#fullscreenButton"),
    settingsButton: $("#settingsButton"),
    settingsDrawer: $("#settingsDrawer"),
    drawerBackdrop: $("#drawerBackdrop"),
    closeSettingsButton: $("#closeSettingsButton"),
    saveSettingsButton: $("#saveSettingsButton"),
    resetSettingsButton: $("#resetSettingsButton"),
    targetMinInput: $("#targetMinInput"),
    targetMaxInput: $("#targetMaxInput"),
    rawMinInput: $("#rawMinInput"),
    rawMaxInput: $("#rawMaxInput"),
    soundToggle: $("#soundToggle"),
    autoResetToggle: $("#autoResetToggle"),

    sayInput: $("#sayInput"),
    sayOutputLabel: $("#sayOutputLabel"),
    sayOutput: $("#sayOutput"),
    sayBefore: $("#sayBefore"),
    sayAfter: $("#sayAfter"),
    voiceStage: $("#voiceStage"),
    speakButton: $("#speakButton"),
    sayResetButton: $("#sayResetButton"),
    micButton: $("#micButton"),
    micButtonText: $("#micButtonText"),
    speechCapture: $("#speechCapture"),
    speechStatusTitle: $("#speechStatusTitle"),
    speechSupportLabel: $("#speechSupportLabel"),
    recognitionConfidence: $("#recognitionConfidence"),
    sayLiveStatus: $("#sayLiveStatus"),

    targetHeader: $("#targetHeader"),
    targetRangeText: $("#targetRangeText"),
    targetArc: $(".target-arc"),
    gaugeShell: $("#gaugeShell"),
    knokStage: $("#knokStage"),
    knokScore: $("#knokScore"),
    knokResultMessage: $("#knokResultMessage"),
    knokResultIcon: $("#knokResultIcon"),
    knokResultTitle: $("#knokResultTitle"),
    knokResultDescription: $("#knokResultDescription"),
    measureButton: $("#measureButton"),
    measureButtonText: $("#measureButtonText"),
    serialButton: $("#serialButton"),
    serialButtonText: $("#serialButtonText"),
    deviceStatus: $("#deviceStatus"),
    deviceStatusText: $("#deviceStatusText"),
    modePill: $("#modePill"),
    historyList: $("#historyList"),
    clearHistoryButton: $("#clearHistoryButton")
  };

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem("picasoBoothSettings") || "{}");
      state.settings = { ...state.settings, ...saved };
    } catch (_) {
      // 기본값 유지
    }
    syncSettingsInputs();
    applySettingsToUI();
  }

  function saveSettings() {
    const targetMin = clamp(Number(refs.targetMinInput.value), 0, 99);
    const targetMax = clamp(Number(refs.targetMaxInput.value), 1, 100);
    const rawMin = Math.max(0, Number(refs.rawMinInput.value));
    const rawMax = Math.max(rawMin + 1, Number(refs.rawMaxInput.value));

    if (targetMin >= targetMax) {
      showToast("목표 최솟값은 최댓값보다 작아야 합니다.");
      return;
    }

    state.settings = {
      targetMin,
      targetMax,
      rawMin,
      rawMax,
      sound: refs.soundToggle.checked,
      autoReset: refs.autoResetToggle.checked
    };

    localStorage.setItem("picasoBoothSettings", JSON.stringify(state.settings));
    applySettingsToUI();
    closeSettings();
    showToast("체험 설정을 저장했습니다.");
  }

  function syncSettingsInputs() {
    refs.targetMinInput.value = state.settings.targetMin;
    refs.targetMaxInput.value = state.settings.targetMax;
    refs.rawMinInput.value = state.settings.rawMin;
    refs.rawMaxInput.value = state.settings.rawMax;
    refs.soundToggle.checked = state.settings.sound;
    refs.autoResetToggle.checked = state.settings.autoReset;
  }

  function applySettingsToUI() {
    const { targetMin, targetMax } = state.settings;
    refs.targetHeader.textContent = `${targetMin}–${targetMax}`;
    refs.targetRangeText.textContent = `${targetMin} — ${targetMax}`;
    updateTargetArc();
  }

  function updateTargetArc() {
    const { targetMin, targetMax } = state.settings;
    const startSoft = Math.max(0, targetMin - 0.4);
    const endSoft = Math.min(100, targetMax + 0.4);
    refs.targetArc.style.background = `conic-gradient(from -90deg,
      transparent 0 ${startSoft}%,
      rgba(94,226,155,.95) ${targetMin}% ${targetMax}%,
      transparent ${endSoft}% 100%)`;
  }

  function resetSettings() {
    state.settings = {
      targetMin: 50,
      targetMax: 60,
      rawMin: 150,
      rawMax: 2500,
      sound: true,
      autoReset: true
    };
    syncSettingsInputs();
    saveSettings();
  }

  function navigate(viewName) {
    if (!views[viewName]) return;

    const previousView = state.view;

    if (previousView === "say" && viewName !== "say") {
      resetSay(false);
    }

    if (previousView === "knok" && viewName !== "knok" && state.armed) {
      resetKnokDisplay();
    }

    state.view = viewName;
    document.body.dataset.view = viewName;

    Object.entries(views).forEach(([name, element]) => {
      element.classList.toggle("is-active", name === viewName);
    });

    const labels = {
      home: "EXPERIENCE READY",
      say: state.speechRecognitionBlocked ? "SAY · DESKTOP CHROME REQUIRED" : "SAY · MICROPHONE READY",
      knok: state.serialConnected ? "KNOK · I2S MIC CONNECTED" : "KNOK · SENSOR REQUIRED"
    };
    refs.topbarStatus.textContent = labels[viewName];

    if (viewName === "home") {
      resetSay(false);
      resetKnokDisplay();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    registerActivity();
  }

  function registerActivity() {
    clearTimeout(state.activityTimer);
    if (!state.settings.autoReset) return;

    state.activityTimer = setTimeout(() => {
      navigate("home");
      showToast("다음 관람객을 위해 첫 화면으로 돌아왔습니다.");
    }, 90000);
  }

  function showToast(message) {
    refs.toast.textContent = message;
    refs.toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => refs.toast.classList.remove("is-visible"), 2800);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {
      showToast("브라우저 메뉴에서 전체 화면을 실행해 주세요.");
    }
  }

  function openSettings() {
    syncSettingsInputs();
    refs.drawerBackdrop.hidden = false;
    requestAnimationFrame(() => {
      refs.settingsDrawer.classList.add("is-open");
      refs.settingsDrawer.setAttribute("aria-hidden", "false");
    });
  }

  function closeSettings() {
    refs.settingsDrawer.classList.remove("is-open");
    refs.settingsDrawer.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      refs.drawerBackdrop.hidden = true;
    }, 350);
  }

  /* SAY — actual microphone input only */
  function updateContext(context) {
    state.context = context;

    $$(".context-chip").forEach(button => {
      button.classList.toggle("is-active", button.dataset.context === context);
    });

    resetSay(true);
  }

  function normalizeSpeech(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[.,!?~"'’“”·…\s]/g, "")
      .replace(/시퍼/g, "싶어")
      .replace(/시포/g, "싶어")
      .replace(/도아/g, "도와")
      .replace(/기달/g, "기다")
      .replace(/주세여/g, "주세요")
      .replace(/아포/g, "아파");
  }

  function levenshteinDistance(a, b) {
    const left = normalizeSpeech(a);
    const right = normalizeSpeech(b);

    if (!left.length) return right.length;
    if (!right.length) return left.length;

    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    const current = new Array(right.length + 1);

    for (let i = 1; i <= left.length; i += 1) {
      current[0] = i;

      for (let j = 1; j <= right.length; j += 1) {
        const cost = left[i - 1] === right[j - 1] ? 0 : 1;
        current[j] = Math.min(
          current[j - 1] + 1,
          previous[j] + 1,
          previous[j - 1] + cost
        );
      }

      for (let j = 0; j <= right.length; j += 1) {
        previous[j] = current[j];
      }
    }

    return previous[right.length];
  }

  function similarity(a, b) {
    const left = normalizeSpeech(a);
    const right = normalizeSpeech(b);
    const maxLength = Math.max(left.length, right.length);

    if (!maxLength) return 1;
    return 1 - levenshteinDistance(left, right) / maxLength;
  }

  function scoreRecognitionCandidate(candidate) {
    const text = candidate?.text || "";
    const normalized = normalizeSpeech(text);
    const confidence = Number.isFinite(candidate?.confidence) ? candidate.confidence : 0;
    let score = confidence * 1.8;

    for (const rule of phraseRules) {
      const contextBonus = rule.contexts.includes(state.context) ? 0.4 : 0;
      const keywordHits = rule.keys.filter(key => normalized.includes(normalizeSpeech(key))).length;
      const aliasSimilarity = Math.max(
        similarity(text, rule.output),
        ...rule.aliases.map(alias => similarity(text, alias))
      );

      score = Math.max(
        score,
        confidence + contextBonus + keywordHits * 0.7 + aliasSimilarity * 2.3
      );
    }

    return score;
  }

  function chooseBestTranscript(candidates) {
    const valid = candidates
      .filter(candidate => candidate?.text?.trim())
      .map(candidate => ({
        ...candidate,
        score: scoreRecognitionCandidate(candidate)
      }))
      .sort((a, b) => b.score - a.score);

    return valid[0] || null;
  }

  function enhancePhrase(input) {
    const normalized = normalizeSpeech(input);
    if (!normalized) return "";

    let bestRule = null;
    let bestScore = 0;

    for (const rule of phraseRules) {
      const keywordHits = rule.keys.filter(key =>
        normalized.includes(normalizeSpeech(key))
      ).length;

      const aliasSimilarity = Math.max(
        similarity(input, rule.output),
        ...rule.aliases.map(alias => similarity(input, alias))
      );

      const contextBonus = rule.contexts.includes(state.context) ? 0.12 : 0;
      const ruleScore =
        aliasSimilarity +
        Math.min(keywordHits, 2) * 0.16 +
        contextBonus;

      if (ruleScore > bestScore) {
        bestScore = ruleScore;
        bestRule = rule;
      }
    }

    /* 충분히 비슷하거나 핵심 단어가 실제 인식 결과에 있을 때만 보완합니다. */
    if (bestRule && bestScore >= 0.66) {
      return bestRule.output;
    }

    let result = input.trim()
      .replace(/\.{2,}/g, " ")
      .replace(/,{2,}/g, ",")
      .replace(/\s+/g, " ")
      .replace(/([가-힣])\1{2,}/g, "$1");

    if (!/[.!?]$/.test(result)) result += ".";
    return result;
  }

  function processRecognizedSpeech(input) {
    const transcript = input.trim();
    if (!transcript) return;

    refs.voiceStage.classList.add("is-processing");
    refs.sayOutputLabel.textContent = "실제 음성 인식 결과를 정리하고 있습니다.";
    refs.sayOutput.innerHTML = "마이크로 들은 말을<br />전달 문장으로 정리하는 중…";
    refs.sayBefore.textContent = truncate(transcript, 52);
    refs.sayAfter.textContent = "정리 중…";
    refs.speakButton.disabled = true;

    const output = enhancePhrase(transcript);
    state.sayOutputText = output;

    refs.sayOutputLabel.textContent = `${state.context} 상황의 SAY 전달 문장`;
    refs.sayOutput.textContent = output;
    refs.sayAfter.textContent = output;
    refs.speakButton.disabled = false;
    refs.voiceStage.classList.remove("is-processing");

    refs.sayLiveStatus.innerHTML = "<span></span> RESULT READY";
    playTone("process");
    registerActivity();
  }

  function resetSay(clearTranscript = true) {
    if (state.listening && state.recognition) {
      try {
        state.recognition.stop();
      } catch (_) {}
    }

    state.listening = false;
    state.recognitionStarting = false;
    state.recognitionFailed = false;
    state.latestTranscript = "";
    state.recognitionCandidates = [];
    state.sayOutputText = "";

    if (clearTranscript) refs.sayInput.value = "";

    refs.speechCapture.classList.remove("is-listening");
    refs.micButton.classList.remove("is-listening");
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      refs.micButton.disabled = false;
    }
    refs.micButtonText.textContent = "말하기 시작";
    refs.speechStatusTitle.textContent = "버튼을 누른 뒤 자연스럽게 말해 주세요.";

    renderMicrophonePermissionStatus();

    refs.recognitionConfidence.textContent = "아직 인식된 음성이 없습니다.";
    refs.sayOutputLabel.textContent = "직접 말하면 결과가 표시됩니다.";
    refs.sayOutput.innerHTML = "마이크가 실제로 들은 말을<br />여기에서 전달합니다.";
    refs.sayBefore.textContent = "—";
    refs.sayAfter.textContent = "—";
    refs.speakButton.disabled = true;
    refs.voiceStage.classList.remove("is-processing", "is-speaking");
    refs.sayLiveStatus.innerHTML = "<span></span> MIC READY";

    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function renderMicrophonePermissionStatus() {
    if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) return;
    if (state.listening) return;

    if (state.speechRecognitionBlocked) {
      refs.speechSupportLabel.textContent = "마이크 권한은 허용됨 · 데스크톱 Chrome에서 음성 인식 가능";
      return;
    }

    const labels = {
      checking: "마이크 권한 확인 중",
      granted: "마이크 권한 허용됨 · 실제 음성 입력 가능",
      prompt: "말하기 시작을 누르면 마이크 권한을 요청합니다.",
      denied: "마이크 권한 거부됨 · 주소창 설정에서 허용해 주세요.",
      unavailable: "마이크를 찾을 수 없음 · 연결 상태를 확인해 주세요."
    };

    refs.speechSupportLabel.textContent = labels[state.microphonePermission] || labels.prompt;
  }

  function speakSayOutput() {
    if (!state.sayOutputText || !("speechSynthesis" in window)) {
      showToast("이 브라우저에서는 음성 출력을 사용할 수 없습니다.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(state.sayOutputText);
    utterance.lang = "ko-KR";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => refs.voiceStage.classList.add("is-speaking");
    utterance.onend = () => refs.voiceStage.classList.remove("is-speaking");
    utterance.onerror = () => refs.voiceStage.classList.remove("is-speaking");
    window.speechSynthesis.speak(utterance);
    registerActivity();
  }

  async function updateMicrophonePermissionStatus() {
    if (!navigator.permissions?.query) {
      state.microphonePermission = "prompt";
      renderMicrophonePermissionStatus();
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: "microphone" });

      const applyState = () => {
        state.microphonePermission = permission.state;
        renderMicrophonePermissionStatus();
      };

      applyState();
      permission.addEventListener?.("change", applyState);
    } catch (_) {
      state.microphonePermission = "prompt";
      renderMicrophonePermissionStatus();
    }
  }

  async function ensureMicrophoneAccess() {
    if (!navigator.mediaDevices?.getUserMedia) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      state.microphonePermission = "granted";
      renderMicrophonePermissionStatus();
      return true;
    } catch (error) {
      const denied = error?.name === "NotAllowedError" || error?.name === "SecurityError";
      const unavailable = error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError";

      state.microphonePermission = denied ? "denied" : unavailable ? "unavailable" : "prompt";
      renderMicrophonePermissionStatus();

      const message = denied
        ? "마이크 권한이 거부되었습니다. 주소창의 마이크 권한을 허용해 주세요."
        : unavailable
          ? "사용할 수 있는 마이크를 찾지 못했습니다."
          : "마이크를 시작하지 못했습니다. 연결 상태를 확인해 주세요.";

      refs.speechStatusTitle.textContent = message;
      refs.recognitionConfidence.textContent = "결과를 만들지 않았습니다.";
      refs.sayLiveStatus.innerHTML = "<span></span> MIC ERROR";
      showToast(message);
      return false;
    }
  }

  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      refs.speechSupportLabel.textContent = "데스크톱 Chrome에서 실행해 주세요.";
      refs.speechStatusTitle.textContent = "이 브라우저는 음성 인식을 지원하지 않습니다.";
      refs.micButton.disabled = true;
      refs.sayLiveStatus.innerHTML = "<span></span> MIC UNAVAILABLE";
      return;
    }

    const recognition = new SpeechRecognition();
    state.recognition = recognition;

    recognition.lang = "ko-KR";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 5;

    renderMicrophonePermissionStatus();

    refs.micButton.addEventListener("click", async () => {
      if (state.recognitionStarting) return;

      if (state.listening) {
        recognition.stop();
        return;
      }

      resetSay(true);
      state.recognitionStarting = true;
      state.recognitionFailed = false;
      refs.micButton.disabled = true;
      refs.micButtonText.textContent = "권한 확인 중…";
      refs.speechStatusTitle.textContent = "마이크 권한을 확인하고 있습니다.";

      const microphoneReady = await ensureMicrophoneAccess();
      if (!microphoneReady) {
        state.recognitionStarting = false;
        refs.micButton.disabled = false;
        refs.micButtonText.textContent = "다시 시도";
        return;
      }

      try {
        recognition.start();
      } catch (_) {
        state.recognitionStarting = false;
        refs.micButton.disabled = false;
        refs.micButtonText.textContent = "다시 시도";
        showToast("잠시 후 다시 마이크 버튼을 눌러 주세요.");
      }
    });

    recognition.onstart = () => {
      state.recognitionStarting = false;
      state.recognitionFailed = false;
      state.listening = true;
      state.latestTranscript = "";
      state.recognitionCandidates = [];
      refs.sayInput.value = "";
      refs.speechCapture.classList.add("is-listening");
      refs.micButton.classList.add("is-listening");
      refs.micButton.disabled = false;
      refs.micButtonText.textContent = "듣기 종료";
      refs.speechStatusTitle.textContent = "듣고 있습니다. 지금 말해 주세요.";
      refs.speechSupportLabel.textContent = "말이 끝나면 자동으로 결과를 만듭니다.";
      refs.recognitionConfidence.textContent = "음성을 기다리는 중";
      refs.sayLiveStatus.innerHTML = "<span></span> LISTENING";
      refs.sayOutputLabel.textContent = "실제 음성을 듣고 있습니다.";
      refs.sayOutput.innerHTML = "말하는 내용이<br />실시간으로 인식됩니다.";
      registerActivity();
    };

    recognition.onresult = event => {
      let finalText = "";
      let interimText = "";
      let confidence = null;
      const candidates = [];

      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];

        for (let altIndex = 0; altIndex < result.length; altIndex += 1) {
          const alternative = result[altIndex];
          candidates.push({
            text: alternative.transcript.trim(),
            confidence: Number.isFinite(alternative.confidence)
              ? alternative.confidence
              : 0,
            isFinal: result.isFinal
          });
        }

        const primary = result[0];

        if (result.isFinal) {
          finalText += primary.transcript;
          if (Number.isFinite(primary.confidence) && primary.confidence > 0) {
            confidence = primary.confidence;
          }
        } else {
          interimText += primary.transcript;
        }
      }

      state.recognitionCandidates = candidates.slice(0, 5);

      const bestCandidate = chooseBestTranscript(state.recognitionCandidates);
      const heard = (
        bestCandidate?.text ||
        finalText ||
        interimText
      ).trim();

      state.latestTranscript = heard;
      refs.sayInput.value = heard;

      if (bestCandidate && Number.isFinite(bestCandidate.confidence) && bestCandidate.confidence > 0) {
        refs.recognitionConfidence.textContent =
          `실제 음성 후보 ${state.recognitionCandidates.length}개 분석 · 신뢰도 ${Math.round(bestCandidate.confidence * 100)}%`;
      } else if (confidence != null) {
        refs.recognitionConfidence.textContent =
          `실제 음성 인식 신뢰도 ${Math.round(confidence * 100)}%`;
      } else {
        refs.recognitionConfidence.textContent = "실제 음성을 실시간으로 인식 중";
      }

      refs.sayBefore.textContent = heard ? truncate(heard, 52) : "—";
    };

    recognition.onerror = event => {
      state.listening = false;
      state.recognitionStarting = false;
      state.recognitionFailed = true;
      state.recognitionCandidates = [];
      state.latestTranscript = "";
      refs.sayInput.value = "";
      refs.speechCapture.classList.remove("is-listening");
      refs.micButton.classList.remove("is-listening");
      refs.micButton.disabled = false;
      refs.micButtonText.textContent = "다시 말하기";
      refs.sayLiveStatus.innerHTML = "<span></span> MIC ERROR";

      const recognitionServiceBlocked =
        (event.error === "not-allowed" || event.error === "service-not-allowed") &&
        state.microphonePermission === "granted";

      const errorMessages = {
        "not-allowed": "마이크 권한이 필요합니다. 주소창의 마이크 권한을 허용해 주세요.",
        "service-not-allowed": "현재 브라우저가 음성 인식 서비스 사용을 차단했습니다.",
        "audio-capture": "사용할 수 있는 마이크를 찾지 못했습니다.",
        "no-speech": "음성이 감지되지 않았습니다. 조금 더 가까이에서 말해 주세요.",
        "network": "음성 인식 서비스 연결에 실패했습니다."
      };

      const message = recognitionServiceBlocked
        ? "마이크 권한은 허용되어 있지만, 현재 브라우저가 음성 인식을 차단했습니다. 데스크톱 Google Chrome에서 실행해 주세요."
        : errorMessages[event.error] || "음성을 인식하지 못했습니다. 다시 말해 주세요.";

      if (recognitionServiceBlocked) {
        state.speechRecognitionBlocked = true;
        refs.topbarStatus.textContent = "SAY · DESKTOP CHROME REQUIRED";
      } else if (event.error === "not-allowed") {
        state.microphonePermission = "denied";
      }
      if (event.error === "audio-capture") state.microphonePermission = "unavailable";
      refs.speechStatusTitle.textContent = message;
      refs.speechSupportLabel.textContent = recognitionServiceBlocked
        ? "Codex 내부 브라우저 대신 데스크톱 Chrome의 localhost 화면을 사용해 주세요."
        : "결과를 만들지 않았습니다.";
      refs.recognitionConfidence.textContent = "인식 실패";
      showToast(message);
    };

    recognition.onend = () => {
      const failed = state.recognitionFailed;
      const bestCandidate = chooseBestTranscript(state.recognitionCandidates);
      const transcript = (
        bestCandidate?.text ||
        state.latestTranscript ||
        refs.sayInput.value
      ).trim();

      state.listening = false;
      state.recognitionStarting = false;
      refs.speechCapture.classList.remove("is-listening");
      refs.micButton.classList.remove("is-listening");
      refs.micButton.disabled = false;
      refs.micButtonText.textContent = "다시 말하기";

      if (failed) {
        state.recognitionFailed = false;
        return;
      }

      refs.sayLiveStatus.innerHTML = "<span></span> MIC READY";

      if (!transcript) {
        refs.speechStatusTitle.textContent = "음성이 감지되지 않았습니다.";
        refs.speechSupportLabel.textContent = "버튼을 누르고 다시 말해 주세요.";
        return;
      }

      refs.speechStatusTitle.textContent = "실제 음성을 들었습니다.";
      refs.speechSupportLabel.textContent = "들은 내용을 SAY 전달 문장으로 정리합니다.";
      processRecognizedSpeech(transcript);
    };
  }

  /* KNOK — real impact event only */
  async function toggleSerial() {
    if (state.serialConnecting) return;

    if (state.serialConnected) {
      await disconnectSerial();
      return;
    }

    if (!("serial" in navigator)) {
      showToast("Web Serial을 지원하는 데스크톱 Chrome을 사용해 주세요.");
      return;
    }

    try {
      state.serialConnecting = true;
      refs.serialButton.disabled = true;
      refs.serialButtonText.textContent = "기기 선택 중…";
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      state.serialPort = port;
      state.serialConnected = true;
      setConnectionUI(true);
      void readSerialLoop();
      await sendSerialCommand("CONNECT");
      showToast("KNOK I2S 마이크가 연결되었습니다.");
      registerActivity();
    } catch (error) {
      if (error?.name === "NotFoundError") {
        showToast("기기 선택을 취소했습니다. 측정값은 생성되지 않습니다.");
      } else {
        console.error(error);
        showToast("기기 연결에 실패했습니다. USB와 포트를 확인해 주세요.");
      }
    } finally {
      state.serialConnecting = false;
      refs.serialButton.disabled = false;
      refs.serialButtonText.textContent = state.serialConnected
        ? "기기 연결 해제"
        : "KNOK 기기 연결";
    }
  }

  async function sendSerialCommand(command) {
    if (!state.serialConnected || !state.serialPort?.writable) return false;
    let writer;
    try {
      writer = state.serialPort.writable.getWriter();
      await writer.write(new TextEncoder().encode(command + "\n"));
      return true;
    } catch (error) {
      console.error("KNOK serial command failed", command, error);
      return false;
    } finally {
      try { writer?.releaseLock(); } catch (_) {}
    }
  }

  async function disconnectSerial(message = "KNOK 기기 연결을 해제했습니다.") {
    await sendSerialCommand("DISARM");
    state.armed = false;
    clearTimeout(state.measuringTimeout);
    clearTimeout(state.impactCooldownTimer);

    try {
      if (state.serialReader) {
        await state.serialReader.cancel();
        state.serialReader.releaseLock();
      }
      if (state.serialPort) await state.serialPort.close();
    } catch (_) {
      // 가능한 범위에서 연결 종료
    }

    state.serialReader = null;
    state.serialPort = null;
    state.serialConnected = false;
    setConnectionUI(false);
    resetKnokDisplay();
    if (message) showToast(message);
  }

  function setConnectionUI(connected) {
    refs.deviceStatus.classList.toggle("is-connected", connected);
    refs.modePill.classList.toggle("is-live", connected);

    refs.deviceStatusText.textContent = connected
      ? "I2S 마이크 연결됨 · 충격 감지 준비"
      : "KNOK 기기 연결 필요";

    refs.modePill.textContent = connected ? "SENSOR" : "OFFLINE";
    const serialSupported = "serial" in navigator;
    refs.serialButton.disabled = !connected && !serialSupported;
    refs.serialButtonText.textContent = connected
      ? "기기 연결 해제"
      : serialSupported
        ? "KNOK 기기 연결"
        : "데스크톱 Chrome 필요";
    refs.measureButton.disabled = !connected;
    refs.measureButtonText.textContent = connected ? "측정 시작" : "센서 연결 필요";

    if (state.view === "knok") {
      refs.topbarStatus.textContent = connected
        ? "KNOK · I2S MIC CONNECTED"
        : "KNOK · SENSOR REQUIRED";
    }

    if (connected) {
      setKnokMessage(
        "ready",
        "◎",
        "I2S 마이크 연결이 완료되었습니다.",
        "측정 시작을 누른 뒤 제품을 한 번 두드려 주세요."
      );
    } else {
      setKnokMessage(
        "ready",
        "○",
        serialSupported ? "먼저 KNOK 기기를 연결해 주세요." : "Web Serial을 지원하지 않는 브라우저입니다.",
        serialSupported ? "센서 연결 전에는 측정이 시작되지 않습니다." : "데스크톱 Chrome에서 실행해 주세요."
      );
    }
  }

  async function readSerialLoop() {
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      state.serialReader = state.serialPort.readable.getReader();

      while (state.serialConnected) {
        const { value, done } = await state.serialReader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          handleSerialLine(line.trim());
        }
      }

      if (state.serialConnected) {
        await disconnectSerial("USB 연결이 종료되었습니다. 기기를 다시 연결해 주세요.");
      }
    } catch (error) {
      if (state.serialConnected) {
        console.error(error);
        await disconnectSerial("기기 연결이 끊어졌습니다. 측정을 중단했습니다.");
      }
    } finally {
      try {
        state.serialReader?.releaseLock();
      } catch (_) {}
      state.serialReader = null;
    }
  }

  function handleSerialLine(line) {
    if (!line || !state.armed) return;
    if (Date.now() < state.impactCooldownUntil) return;

    const parsed = parseImpactEvent(line);
    if (parsed == null) return;

    finishMeasurement(parsed);
  }

  /*
   * 일반 숫자, READY, 연속 아날로그 값은 모두 무시합니다.
   * 명시적인 충격 이벤트 형식만 측정 결과로 인정합니다.
   */
  function parseImpactEvent(line) {
    try {
      if (line.startsWith("{")) {
        const data = JSON.parse(line);
        const isImpact = String(data.event || "").toLowerCase() === "impact";

        if (!isImpact) return null;

        const score = parseProtocolNumber(data.score);
        if (score != null && score >= 0) {
          return clamp(score, 0, 100);
        }

        const raw = parseProtocolNumber(data.raw);
        if (raw != null && raw >= 0) {
          return rawToScore(raw);
        }

        return null;
      }
    } catch (_) {
      return null;
    }

    const scoreMatch = line.match(/^\s*(?:HIT|IMPACT)_SCORE\s*:\s*(\d+(?:\.\d+)?)\s*$/i);
    if (scoreMatch) return clamp(Number(scoreMatch[1]), 0, 100);

    const rawMatch = line.match(/^\s*(?:HIT|IMPACT)_RAW\s*:\s*(\d+(?:\.\d+)?)\s*$/i);
    if (rawMatch) return rawToScore(Number(rawMatch[1]));

    return null;
  }

  function parseProtocolNumber(value) {
    if (typeof value === "string" && !value.trim()) return null;
    if (typeof value !== "number" && typeof value !== "string") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function rawToScore(raw) {
    const { rawMin, rawMax } = state.settings;
    const mapped = ((raw - rawMin) / (rawMax - rawMin)) * 100;
    return clamp(mapped, 0, 100);
  }

  function startMeasurement() {
    if (state.armed) return;

    if (!state.serialConnected) {
      showToast("먼저 KNOK 기기를 연결해 주세요.");
      setKnokMessage(
        "ready",
        "○",
        "센서가 연결되지 않았습니다.",
        "기기 연결 후에만 실제 측정을 시작할 수 있습니다."
      );
      return;
    }

    if (Date.now() < state.impactCooldownUntil) {
      showToast("센서가 안정화된 뒤 다시 측정해 주세요.");
      return;
    }

    state.armed = true;
    void sendSerialCommand("ARM");
    clearTimeout(state.measuringTimeout);

    refs.knokStage.classList.add("is-armed");
    refs.knokStage.classList.remove("is-hit");
    refs.measureButton.disabled = true;
    refs.measureButtonText.textContent = "충격음 감지 대기 중…";
    refs.knokScore.textContent = "—";
    refs.gaugeShell.style.setProperty("--score", 0);
    refs.gaugeShell.style.setProperty("--gauge-color", "#ff7a1a");
    setKnokMessage(
      "ready",
      "●",
      "지금 체험판을 한 번 두드려 주세요.",
      "I2S 마이크가 실제 충격음을 감지할 때까지 기다립니다."
    );

    playTone("armed");

    state.measuringTimeout = setTimeout(() => {
      if (!state.armed) return;

      state.armed = false;
      void sendSerialCommand("DISARM");
      refs.knokStage.classList.remove("is-armed");
      refs.measureButton.disabled = false;
      refs.measureButtonText.textContent = "다시 측정";
      refs.knokScore.textContent = "—";
      refs.gaugeShell.style.setProperty("--score", 0);

      setKnokMessage(
        "high",
        "!",
        "진동이 감지되지 않았습니다.",
        "측정값을 만들지 않았습니다. 다시 시작한 뒤 체험판을 두드려 주세요."
      );

      showToast("실제 충격 이벤트가 들어오지 않아 측정을 종료했습니다.");
    }, 10000);

    registerActivity();
  }

  function finishMeasurement(value) {
    const score = Math.round(clamp(value, 0, 100));

    state.armed = false;
    void sendSerialCommand("DISARM");
    clearTimeout(state.measuringTimeout);
    state.impactCooldownUntil = Date.now() + IMPACT_DUPLICATE_WINDOW_MS;

    refs.knokStage.classList.remove("is-armed");
    refs.knokStage.classList.remove("is-hit");
    void refs.knokStage.offsetWidth;
    refs.knokStage.classList.add("is-hit");
    setTimeout(() => refs.knokStage.classList.remove("is-hit"), 650);

    refs.gaugeShell.style.setProperty("--score", score);
    refs.knokScore.textContent = score;
    refs.measureButton.disabled = true;
    refs.measureButtonText.textContent = "센서 안정화 중…";

    const result = classifyScore(score);
    refs.gaugeShell.style.setProperty("--gauge-color", result.color);
    setKnokMessage(result.type, result.icon, result.title, result.description);
    addHistory(score, result);
    playTone(result.type);
    registerActivity();

    clearTimeout(state.impactCooldownTimer);
    state.impactCooldownTimer = setTimeout(() => {
      if (!state.serialConnected || state.armed) return;
      refs.measureButton.disabled = false;
      refs.measureButtonText.textContent = "다시 측정";
    }, IMPACT_DUPLICATE_WINDOW_MS);
  }

  function classifyScore(score) {
    const { targetMin, targetMax } = state.settings;

    if (score >= targetMin && score <= targetMax) {
      return {
        type: "success",
        label: "SUCCESS",
        icon: "✓",
        title: "목표 범위에 들어왔습니다.",
        description: `${targetMin}–${targetMax} 사이의 실제 충격이 감지되었습니다.`,
        color: "#5ee29b"
      };
    }

    if (score < targetMin) {
      return {
        type: "low",
        label: "LOW",
        icon: "↑",
        title: "조금 더 강하게 두드려 보세요.",
        description: `감지된 충격이 목표보다 ${targetMin - score}만큼 낮습니다.`,
        color: "#53d9ff"
      };
    }

    return {
      type: "high",
      label: "HIGH",
      icon: "↓",
      title: "조금 더 약하게 두드려 보세요.",
      description: `감지된 충격이 목표보다 ${score - targetMax}만큼 높습니다.`,
      color: "#ff6577"
    };
  }

  function setKnokMessage(type, icon, title, description) {
    refs.knokResultMessage.className = `result-message is-${type}`;
    refs.knokResultIcon.textContent = icon;
    refs.knokResultTitle.textContent = title;
    refs.knokResultDescription.textContent = description;
  }

  function resetKnokDisplay() {
    state.armed = false;
    clearTimeout(state.measuringTimeout);
    clearTimeout(state.impactCooldownTimer);
    state.impactCooldownUntil = 0;

    refs.knokStage.classList.remove("is-armed", "is-hit");
    refs.gaugeShell.style.setProperty("--score", 0);
    refs.gaugeShell.style.setProperty("--gauge-color", "#ff7a1a");
    refs.knokScore.textContent = "—";

    if (state.serialConnected) {
      refs.measureButton.disabled = false;
      refs.measureButtonText.textContent = "측정 시작";
      setKnokMessage(
        "ready",
        "◎",
        "I2S 마이크 연결이 완료되었습니다.",
        "측정 시작을 누른 뒤 제품을 한 번 두드려 주세요."
      );
    } else {
      refs.measureButton.disabled = true;
      refs.measureButtonText.textContent = "센서 연결 필요";
      setKnokMessage(
        "ready",
        "○",
        "먼저 KNOK 기기를 연결해 주세요.",
        "센서 연결 전에는 측정이 시작되지 않습니다."
      );
    }
  }

  function addHistory(score, result) {
    state.history.unshift({
      score,
      type: result.type,
      label: result.label,
      source: "SENSOR",
      time: new Date()
    });

    state.history = state.history.slice(0, 5);
    renderHistory();
  }

  function renderHistory() {
    if (!state.history.length) {
      refs.historyList.innerHTML = `
        <div class="history-empty">
          <span>—</span>
          <p>실제 센서 측정 기록이 아직 없습니다.</p>
        </div>`;
      return;
    }

    refs.historyList.innerHTML = state.history.map(item => `
      <div class="history-item is-${item.type}">
        <span class="history-score">${item.score}</span>
        <span class="history-meta">
          <b>${item.label}</b>
          <small>${item.source}</small>
        </span>
        <time class="history-time">${formatTime(item.time)}</time>
      </div>
    `).join("");
  }

  /* SOUND */
  function playTone(type) {
    if (!state.settings.sound) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const tones = {
        armed: [440],
        process: [520, 650],
        success: [523, 659, 784],
        low: [392, 440],
        high: [440, 330]
      };

      const frequencies = tones[type] || [440];

      frequencies.forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type === "success" ? "sine" : "triangle";
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(0.0001, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.08 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.14);

        osc.connect(gain).connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.16);
      });

      setTimeout(() => ctx.close(), 700);
    } catch (_) {}
  }

  /* UTILITIES */
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function truncate(text, length) {
    return text.length > length ? `${text.slice(0, length)}…` : text;
  }

  function formatTime(date) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }

  /* EVENTS */
  function bindEvents() {
    $$("[data-nav]").forEach(button => {
      button.addEventListener("click", () => navigate(button.dataset.nav));
    });

    refs.fullscreenButton.addEventListener("click", toggleFullscreen);
    refs.settingsButton.addEventListener("click", openSettings);
    refs.closeSettingsButton.addEventListener("click", closeSettings);
    refs.drawerBackdrop.addEventListener("click", closeSettings);
    refs.saveSettingsButton.addEventListener("click", saveSettings);
    refs.resetSettingsButton.addEventListener("click", resetSettings);

    $$(".context-chip").forEach(button => {
      button.addEventListener("click", () => updateContext(button.dataset.context));
    });

    refs.sayResetButton.addEventListener("click", () => resetSay(true));
    refs.speakButton.addEventListener("click", speakSayOutput);

    refs.measureButton.addEventListener("click", startMeasurement);
    refs.serialButton.addEventListener("click", toggleSerial);

    refs.clearHistoryButton.addEventListener("click", () => {
      state.history = [];
      renderHistory();
      showToast("측정 기록을 초기화했습니다.");
    });

    document.addEventListener("keydown", event => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement;

      if (isTyping) return;

      if (event.key === "0") navigate("home");
      if (event.key === "1") navigate("say");
      if (event.key === "2") navigate("knok");

      if (event.code === "Space") {
        event.preventDefault();

        if (state.view === "say") {
          refs.micButton.click();
        }

        if (state.view === "knok") {
          startMeasurement();
        }
      }

      if (event.key === "Escape") closeSettings();
    });

    ["click", "touchstart", "mousemove", "keydown"].forEach(eventName => {
      document.addEventListener(eventName, registerActivity, { passive: true });
    });

    navigator.serial?.addEventListener?.("disconnect", event => {
      if (event.target === state.serialPort && state.serialConnected) {
        void disconnectSerial("USB가 분리되어 측정을 중단했습니다.");
      }
    });

    window.addEventListener("pagehide", () => {
      if (state.listening && state.recognition) {
        try {
          state.recognition.abort();
        } catch (_) {}
      }
      if (state.serialConnected) void disconnectSerial("");
    });
  }

  function init() {
    loadSettings();
    bindEvents();
    setupSpeechRecognition();
    updateMicrophonePermissionStatus();
    renderHistory();
    updateContext("일상");
    setConnectionUI(false);
    const requestedView = new URLSearchParams(window.location.search).get("view");
    navigate(requestedView === "say" || requestedView === "knok" ? requestedView : "home");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
