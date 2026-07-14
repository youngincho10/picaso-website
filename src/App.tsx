import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Cpu,
  Menu,
  MessageSquareText,
  Mic2,
  Radio,
  Smartphone,
  Volume2,
  Waves,
  Wifi,
  X,
} from 'lucide-react';
import { sayStatus, knokStatus } from './data/projectStatus';
import { team } from './data/team';
import { contact } from './data/contact';
import './index.css';

const nav = [['SAY', 'say'], ['KNOK', 'knok'], ['기술 흐름', 'process'], ['팀 소개', 'team'], ['문의', 'contact']] as const;

function StatusColumn({ title, items, future = false }: { title: string; items: { ko: string }[]; future?: boolean }) {
  const Icon = future ? CircleDashed : CheckCircle2;
  return <div className={`status-column ${future ? 'future' : 'current'}`}><p className="status-label"><Icon size={15}/>{title}</p><ul>{items.map(({ ko }) => <li key={ko}><Icon size={15}/>{ko}</li>)}</ul></div>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const wasMenuOpen = useRef(false);
  useEffect(() => { document.documentElement.lang = 'ko'; }, []);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);
  useEffect(() => {
    if (menuOpen) mobileMenuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    else if (wasMenuOpen.current) menuButtonRef.current?.focus();
    wasMenuOpen.current = menuOpen;
  }, [menuOpen]);
  const closeMenu = () => setMenuOpen(false);

  return <div className="site-shell">
    <header className="topbar">
      <a className="wordmark" href="#home" onClick={closeMenu} aria-label="PICASO 홈">PICASO</a>
      <nav className="desktop-nav" aria-label="주요 탐색">{nav.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
      <button ref={menuButtonRef} className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>
    {menuOpen && <nav ref={mobileMenuRef} id="mobile-navigation" className="mobile-menu" aria-label="모바일 탐색">{nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={closeMenu}>{label}<ArrowRight size={17}/></a>)}</nav>}

    <main>
      <section id="home" className="hero">
        <div className="hero-grid" aria-hidden="true"/><div className="hero-light say-light" aria-hidden="true"/><div className="hero-light knok-light" aria-hidden="true"/>
        <figure className="hero-product hero-say-product">
          <div className="hero-product-depth"><span aria-hidden="true"/><img src="./generated/say-neckband-transparent.png" alt="SAY 넥밴드 형태의 제품 콘셉트" fetchPriority="high"/></div>
          <figcaption><span>SAY</span> 제품 콘셉트 / 전용 하드웨어 연동 개발 중</figcaption>
        </figure>
        <div className="hero-copy"><p className="eyebrow">PICASO · STUDENT TECHNOLOGY TEAM</p><h1>보이지 않던 문제를,<br/><span>기술로 드러내다.</span></h1><p>전달의 어려움과 생활 소음의 기록 문제를<br/>두 개의 프로토타입으로 탐구합니다.</p><div className="hero-actions"><div className="hero-view-actions"><a className="button say-button" href="#say">SAY 보기 <ArrowDownRight/></a><a className="button knok-button" href="#knok">KNOK 보기 <ArrowDownRight/></a></div><a className="button experience-button" href="./Archive/index.html">체험하기 <ArrowRight/></a></div></div>
        <figure className="hero-product hero-knok-product">
          <div className="hero-product-depth"><span aria-hidden="true"/><img src="./generated/knok-concept-transparent.png" alt="둥근 원형 형태로 디자인된 미래형 KNOK 제품 콘셉트" fetchPriority="high"/></div>
          <figcaption><span>KNOK</span> 향후 제품 콘셉트</figcaption>
        </figure>
        <a className="scroll-cue" href="#say">SCROLL <ArrowRight size={14}/></a>
      </section>

      <section className="intro content-wrap"><p className="kicker">01 · PICASO</p><h2>다른 문제, 하나의 방향.</h2><p>학생 기술·창업 팀 PICASO는 문제를 발견하고, 작동 가능한 프로토타입을 만들며, 다음 검증을 준비합니다. SAY는 의사소통을 돕는 흐름을, KNOK는 소음과 진동의 측정·기록 흐름을 다룹니다.</p></section>

      <section id="say" className="product say-section"><div className="content-wrap"><div className="product-heading"><p className="kicker say-kicker">02 · SAY</p><p className="product-mark">SAY</p><h2>말한 내용을 문장으로 확인하고,<br/>다시 목소리로 전달하는 흐름.</h2><p>SAY는 음성을 텍스트로 변환하고, 사용자가 문장을 확인한 뒤 음성으로 출력할 수 있도록 돕는 제품·앱 프로토타입입니다.</p></div>
        <div className="say-gallery">
          <figure className="say-product-stage"><span className="say-product-glow" aria-hidden="true"/><img src="./generated/say-neckband-transparent.png" alt="목에 착용하는 형태로 구상한 SAY 넥밴드 콘셉트" loading="lazy"/><figcaption><b>제품 콘셉트</b><span>전용 하드웨어 연동은 개발 중</span></figcaption></figure>
          <figure className="say-ui-stage"><div className="say-phone" role="img" aria-label="음성 입력, 텍스트 결과, 사용자 확인, 음성 출력을 보여주는 SAY 현재 앱 UI"><div className="phone-speaker"/><div className="phone-screen"><div className="say-ui-top"><b>SAY</b><span><CheckCircle2/>현재 프로토타입</span></div><div className="say-input-state"><Mic2/><div><small>음성 입력</small><strong>발화를 듣고 있어요</strong></div></div><div className="say-ui-result"><small>텍스트 결과</small><p>오늘 학교에 가고 싶어요.</p><span>사용자가 변환된 문장을 확인할 수 있습니다.</span></div><div className="say-ui-actions"><span><MessageSquareText/>문장 확인</span><span><Volume2/>음성 출력</span></div></div></div><figcaption><b>현재 앱 UI</b><span>확인된 기능 흐름만 시각화</span></figcaption></figure>
        </div>
        <div className="product-flow say-flow" aria-label="SAY 처리 흐름"><div><Mic2/><b>발화</b><span>음성 입력</span></div><ArrowRight/><div><MessageSquareText/><b>텍스트</b><span>STT 변환</span></div><ArrowRight/><div><CheckCircle2/><b>사용자 확인</b><span>문장 확인</span></div><ArrowRight/><div><Volume2/><b>음성 출력</b><span>TTS 출력</span></div></div>
        <div className="status-grid"><StatusColumn title="현재 프로토타입" items={sayStatus.current}/><StatusColumn title="개발 중" items={sayStatus.future} future/></div></div></section>

      <section className="validation"><div className="content-wrap validation-grid"><div><p className="kicker dark-kicker">SAY · 내부 프로토타입 검증</p><h2>측정한 결과와<br/>남아 있는 검증.</h2><p>팀 내부에서 사전 정의한 문장과 실험 환경에서 확인한 프로토타입 결과입니다. 임상 성능이나 의료적 효과를 뜻하지 않으며, 실제 사용자와 다양한 소음 환경에서의 검증은 아직 진행 전입니다.</p></div><article><strong>85%</strong><h3>문장 단위 의미 유지</h3><p>사전 정의된 테스트 문장 20개 중 17개에서 의미 유지</p></article><article><strong>3.31<span>초</span></strong><h3>최종 문장 표시까지 평균</h3><p>발화 종료 후 최종 문장 표시까지 50회 평균 3.31초</p></article></div></section>

      <section id="knok" className="product knok-section"><div className="content-wrap"><div className="product-heading"><p className="kicker knok-kicker">03 · KNOK</p><p className="product-mark">KNOK</p><h2>소리와 진동을 측정하고,<br/>앱에서 상태를 확인하는 흐름.</h2><p>KNOK는 센서 장치와 모바일 앱을 연결해 소음·진동 이벤트의 측정 데이터를 참고용으로 기록·정리하는 프로토타입입니다.</p></div>
        <div className="knok-gallery">
          <figure className="media-frame knok-prototype-media"><div className="knok-prototype-crop"><img src="./knok-real-prototype.jpg" alt="초기 제작 단계의 KNOK 센서와 원형 케이스" loading="lazy"/></div><figcaption><b>현재 프로토타입 · 초기 제작 사진</b><span>사진은 제작 시점 기록이며 구현 범위는 아래 상태표 기준</span></figcaption></figure>
          <div className="knok-side-media">
            <figure className="media-frame knok-app-media"><div className="knok-app-ui" role="img" aria-label="KNOK 앱의 연결 및 센서 상태 표시 구성도"><div className="app-top"><span>KNOK</span><small>DEVICE STATUS</small></div><div className="app-state"><Radio/><span>BLE</span><b>연결 상태</b></div><div className="app-state"><Wifi/><span>Wi-Fi</span><b>통신 응답</b></div><div className="app-state"><Activity/><span>Sensor</span><b>기본 측정</b></div></div><figcaption><b>앱 인터페이스</b><span>상태 표시 항목을 재구성한 웹 그래픽</span></figcaption></figure>
            <figure className="knok-concept-stage"><span className="knok-product-glow" aria-hidden="true"/><img src="./generated/knok-concept-transparent.png" alt="둥근 원형 형태로 디자인된 미래형 KNOK 제품 콘셉트" loading="lazy"/><figcaption><b>향후 제품 콘셉트</b><span>현재 하드웨어와 구분되는 디자인 시안</span></figcaption></figure>
          </div>
        </div>
        <div className="status-grid"><StatusColumn title="현재 프로토타입" items={knokStatus.current}/><StatusColumn title="개발 중" items={knokStatus.future} future/></div><aside className="notice"><b>KNOK 안내</b><p>KNOK는 측정·기록 참고용 프로토타입입니다. 법적 증거 장비나 인증 계측기가 아니며, 원인 판정 또는 분쟁 해결을 위한 장비가 아닙니다.</p></aside></div></section>

      <section id="process" className="process content-wrap"><p className="kicker">04 · PROCESS · TECHNOLOGY</p><h2>두 제품의 흐름을<br/>한눈에 읽도록.</h2><div className="process-tracks">
        <article className="process-track process-say"><header><span>SAY</span><small>COMMUNICATION FLOW</small></header><ol><li><Mic2/><b>발화</b></li><li><MessageSquareText/><b>텍스트</b></li><li><CheckCircle2/><b>사용자 확인</b></li><li><Volume2/><b>음성 출력</b></li></ol></article>
        <article className="process-track process-knok"><header><span>KNOK</span><small>MEASUREMENT FLOW</small></header><ol><li><Waves/><b>소리·진동</b></li><li><Cpu/><b>센서 처리</b></li><li><Wifi/><b>BLE·Wi-Fi</b></li><li><Smartphone/><b>앱 상태 표시</b></li></ol></article>
      </div></section>

      <section id="team" className="team-section"><div className="content-wrap"><p className="kicker dark-kicker">05 · TEAM PICASO</p><h2>문제 발견부터<br/>프로토타입 제작까지.</h2><p className="team-intro">PICASO는 직접 문제를 관찰하고, 설계하고, 작동 가능한 형태로 검증해 나가는 학생 기술·창업 팀입니다.</p><div className="team-showcase"><figure className="team-photo"><img src="./picaso-team-working.jpg" alt="PICASO 팀원 세 명이 함께 제품 개발 작업을 진행하는 모습" loading="lazy"/><figcaption>TEAM PICASO · DEVELOPMENT SESSION</figcaption></figure><div className="team-roster"><div className="brand-logo-panel"><img src="./generated/picaso-logo-team-transparent.png" alt="PICASO 공식 로고" loading="lazy"/></div>{team.map((member) => <article key={member.nameKo}><figure className={`team-member-photo ${member.portraitClass}`}><img src={member.portrait} alt={member.portraitAlt} loading="lazy"/></figure><div><h3>{member.nameKo}</h3><p>{member.roleKo}</p></div></article>)}</div></div></div></section>

      <section id="contact" className="contact-section"><div className="content-wrap"><p className="kicker">06 · CONTACT</p><h2>프로토타입의 다음 검증을<br/>함께 이야기해 주세요.</h2><div className="contact-links"><a href={`mailto:${contact.email}`}><small>EMAIL</small><span>{contact.email}</span><ArrowRight/></a><a href={contact.phoneHref}><small>PHONE · {contact.lead}</small><span>{contact.phone}</span><ArrowRight/></a></div></div></section>
    </main>
    <footer><a className="wordmark" href="#home">PICASO</a><span>SAY · KNOK</span><span>© {new Date().getFullYear()} PICASO</span></footer>
  </div>;
}

export default App;
