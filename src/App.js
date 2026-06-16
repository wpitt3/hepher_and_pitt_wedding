import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { PALETTES, FONT_PAIRINGS, buildTheme, DEFAULT_TWEAKS } from './theme';
import { useSplitforms } from './useSplitforms';

const COUPLE = { bride: 'Helen', groom: 'William' };
const WEDDING_DATE = new Date('2026-09-26T15:30:00');

// ─── Hooks ────────────────────────────────────────────────────
function useCountdown(target) {
  const [time, setTime] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setTime({ days:0, hours:0, minutes:0, seconds:0 });
      setTime({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, options);
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Section({ children, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.07 });
  return (
    <section ref={ref} className={`section ${inView ? 'visible' : ''} ${className}`}>
      {children}
    </section>
  );
}

const ContourBg = () => (
  <svg className="contour-bg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
    {[80,130,180,230,280].map((r,i) => (
      <ellipse key={i} cx="400" cy="250" rx={r*2.2} ry={r}
        fill="none" stroke="currentColor" strokeWidth="0.8" opacity={0.055 - i*0.007}/>
    ))}
    {[60,110,160,210].map((r,i) => (
      <ellipse key={i} cx="150" cy="420" rx={r*1.8} ry={r*0.7}
        fill="none" stroke="currentColor" strokeWidth="0.8" opacity={0.04}/>
    ))}
  </svg>
);

const AvonLine = () => (
  <svg className="avon-line" viewBox="0 0 600 36" preserveAspectRatio="none">
    <path d="M0,18 C50,6 80,30 130,18 C180,6 210,28 260,18 C310,8 340,26 390,18 C440,10 470,24 520,18 C550,14 575,20 600,18"
      stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55"/>
    <path d="M0,24 C60,14 90,32 140,22 C190,12 220,30 270,22 C320,14 350,28 400,22 C450,16 480,26 530,22 C560,19 580,24 600,22"
      stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3"/>
  </svg>
);

const RiverDivider = ({ flip = false, dark = false }) => (
  <div className={`river-divider ${flip ? 'flip' : ''} ${dark ? ' dark' : ''}`}>
    <svg viewBox="0 0 1440 55" preserveAspectRatio="none">
      <path className="wave1" d="M0,28 C240,52 480,4 720,28 C960,52 1200,4 1440,28 L1440,55 L0,55 Z"/>
      <path className="wave2" d="M0,36 C200,16 400,48 600,33 C800,18 1000,46 1200,31 C1320,24 1380,38 1440,34 L1440,55 L0,55 Z"/>
    </svg>
  </div>
);

// ─── Data ─────────────────────────────────────────────────────
const SCHEDULE = [
  { time: '3:15 PM', label: 'Guests Arrive',           note: 'Tea and Coffees on the riverside terrace', km: '0.0' },
  { time: '4:00 PM', label: 'Ceremony Begins',         note: 'Wooh wooh',            km: '0.8' },
  { time: '4:30 PM', label: 'Celebration drinks',        note: 'with some casual games',      km: '3.2' },
  { time: '6:00 PM', label: 'Dinner',       note: 'with speeches',         km: '6.1' },
  { time: '8:30 PM', label: 'Live Music and cake',    note: 'Local Soul Funk Jazz group',                   km: '11.0' },
  { time: '12:00 AM', label: 'End of Evening',              note: 'Safe travels home',                      km: '12.0' },
];

const DIETARY_OPTIONS = [
  'No requirements', 'Vegan','Gluten-free', 'Dairy-free', 'Nut allergy', 'Coconut allergy', 'Halal', 'Kosher','Other (please specify)',
];

const FAQS = [
  {
    q: 'What’s Bristol like?',
    a: <>
        <>Bristol is a vibrant creative city with lots of art, good coffee and beer. There is tonnes to checkout whilst you are here. If you are keen to explore we recommend checking out:</>
        <br/><> - The Harbourside</>
        <br/><> - Clifton suspension bridge</>
        <br/><> - Banksy artwork</>
        <br/><> - Learn about the history of Bristol at M-shed</>
        <br/><> - Art at Arnolfini</>
        <br/><> - Coffee at Full Court Press or New Cut Coffee</>
        <br/><> - Beer on Kings Street or at Left Handed Giant</>
        <br/><> - Baked goods at Harts Bakery</>
      </>
  },
  {
    q: 'Where to stay?',
    a: 'There are lots of great places to stay nearby, as Mud Dock Café is right on Bristol’s harbourside and very central. We haven`t recommended a particluar hotel for guests',
  },
  {
    q: 'How to get to the venue?',
    a: 'Mud Dock Café is on Bristol’s Harbourside at 40 The Grove (BS1 4RB), so it’s very central and easy for guests to reach.',
  },
  {
    q: 'Do you have a gift registry?',
    a: <>
        <>Your presence is more then enough presents!</>
        <br/>
        <>We would love to have a collective keepsake of our favourite people from the day. We would love you each of you to get creative and bring a piece of art which says something about you or us or love (anything goes!). We welcome drawing, painting, collaging, photography, printing, sewing or anything else!</>
        <br/>
        <>We are hoping to turn it into a book to remind ourselves of the day and our favourite people. Please bring this on A5 paper or card and sign your name.</>
      </>,
  },
  {
    q: 'Will there be food?',
    a: 'Absolutely! A feast will be served at 6pm. Please do have lunch before you arrive as there won’t be food before then. All food will be meat free and dietary requirements will be accommodated.',
  },
  {
    q: 'Can I bring a plus one?',
    a: 'Please don`t unless we have given an invite to them already'
  },
  {
    q: 'Will there be games?',
    a: 'I’m surprised you need to ask!',
  },
  {
    q: 'Can I take photos during the day?',
    a: 'We kindly ask that no photos are taken during the ceremony itself. We’ve got a photographer capturing the moment for us, so we’ll be sure to share photos afterwards. But please feel free to take photos throughout the rest of the day',
  },
  {
    q: 'Will there be speeches or toasts?',
    a: 'We’ll be doing our speeches in a relaxed Swedish style during dinner.  If you’d like to say a few words, raise a toast, or share a short story, we’d love for you to do so. Please let us know in advance so our host can account for you. There is absolutely no pressure, but we’ll always make time for anyone who fancies it.',
  },
  {
    q: 'Is anything else happening on the weekend?',
    a: <><>Debrief with us the day after where we will meet at the coffee cart in Leigh Woods at 10.30am and go for a walk and natter. We suspect we will walk for around an hour but there are lots of shortcuts back or extensions if people so desire on the day. Free to enter.</>
      <br/>
      <>Paths are good and well maintained but not wheelchair accessible. We will stick to main paths but beware it could be muddy if it has rained recently.</>
      <br/>
      <>How to get there:</>
      <br/>
      <>15 min drive from Bristol Town Centre. If anyone is driving in the morning and able to give a lift for those travelling without a car let us know and we can connect.</>
      <br/>
      <>Catch the bus from The Centre - 9.42am - 9.58am with a 12 minute walk into the woods.</>
      <br/>
      <>30 minutes cycle from town. You can cycle across the iconic Clifton Suspension Bridge. That’s how we will be arriving!</>
    </>,
  },
  {
    q: 'What do we call you once you’re married?',
    a: 'We’re still thinking about it - ideas welcome in the RSVP! ',
  },
  {
    q: 'Anything else?',
    a: <><>We may need a small number of people to stand during the ceremony. It should be short - around 20 minutes.</><br/> <>There is also baby changing facilities.</></>,
  },
];

// ─── FAQ Accordion Item ────────────────────────────────────────
function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(true);
  return (
      <div className={`faq-item ${open ? 'open' : ''}`}>
        <span className="faq-q-text">{q}</span>
        <div className="faq-a-wrap">
          <p className="faq-a">{a}</p>
        </div>
      </div>
  );
}

// ─── Font loader ──────────────────────────────────────────────
function loadGoogleFont(googleFonts) {
  const id = `gf-${googleFonts.replace(/[^a-z0-9]/gi,'_')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${googleFonts}&display=swap`;
  document.head.appendChild(link);
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  const [palette,     setPalette]     = useState(PALETTES[0]);
  const [fontPairing, setFontPairing] = useState(FONT_PAIRINGS[0]);
  const [tweaks,      setTweaks]      = useState(DEFAULT_TWEAKS);
  const [editorOpen,  setEditorOpen]  = useState(false);
  const { submit: submitRsvp, status: submitStatus } = useSplitforms();
  const [attending,   setAttending]   = useState(null);
  const [guests,      setGuests]      = useState([{ id: 1, name: '', dietary: '', other: '' }]);
  const [message,     setMessage]     = useState('');
  const [submitted,   setSubmitted]   = useState(false);
  const nextId = useRef(2);

  const updateGuest = (id, field, val) =>
      setGuests(gs => gs.map(g => g.id === id ? { ...g, [field]: val } : g));

  const addGuest = () => {
    setGuests(gs => [...gs, { id: nextId.current++, name: '', dietary: '', other: '' }]);
  };

  const removeGuest = (id) => {
    setGuests(gs => gs.length > 1 ? gs.filter(g => g.id !== id) : gs);
  };

  const canSubmit = attending !== null && guests.every(g => g.name.trim());
  const [scrolled,    setScrolled]    = useState(false);
  const [navOpen,     setNavOpen]     = useState(false);
  const countdown = useCountdown(WEDDING_DATE);

  // Apply theme to :root
  useEffect(() => {
    const vars = buildTheme(palette, fontPairing, tweaks);
    Object.entries(vars).forEach(([k,v]) => document.documentElement.style.setProperty(k, v));
  }, [palette, fontPairing, tweaks]);

  const handleTweak = (key, val) => setTweaks(t => ({ ...t, [key]: val }));

  // Pre-load all fonts
  useEffect(() => {
    FONT_PAIRINGS.forEach(f => loadGoogleFont(f.googleFonts));
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setNavOpen(false); };
  const pad = n => String(n ?? 0).padStart(2,'0');

  return (
    <div className="app">

      {/* ── Nav ── */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <span className="nav-brand" onClick={() => scrollTo('home')}>
          H &amp; W
        </span>
        <div className={`nav-links ${navOpen ? 'open' : ''}`}>
          {['details','schedule','faqs','rsvp'].map(id => (
              <button key={id} className="nav-link" onClick={() => scrollTo(id)}>
                {id === 'faqs' ? 'FAQs' : id.charAt(0).toUpperCase()+id.slice(1)}
              </button>
          ))}
        </div>
        <div className="nav-right">
          {/*<button className="style-btn" onClick={() => setEditorOpen(true)}>*/}
          {/*  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">*/}
          {/*    <circle cx="12" cy="12" r="3"/>*/}
          {/*    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>*/}
          {/*  </svg>*/}
          {/*  Style*/}
          {/*</button>*/}
          <button className="burger" onClick={() => setNavOpen(o=>!o)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* ── HERO (Bristol) ── */}
      <div id="home" className="hero">
        <ContourBg />
        <div className="hero-grid" />

        <div className="hero-content">
          <div className="hero-tag">
            <span className="tag-city">Bristol</span>
            <span className="tag-sep">·</span>
            <span>UK</span>
          </div>

          <h1 className="hero-names">
            <span>{COUPLE.bride}</span>
            <span className="hero-amp">&amp;</span>
            <span>{COUPLE.groom}</span>
          </h1>

          <p className="hero-sub">are getting married</p>
          <AvonLine />

          <div className="hero-meta">
            {[
              { label: 'DATE',     val: '26 September 2026' },
              { label: 'LOCATION', val: 'Mud Dock Cafe' },
            ].map((m,i) => [
              <div key={m.label} className="meta-item">
                <span className="meta-label">{m.label}</span>
                <span className="meta-val">{m.val}</span>
              </div>,
              i < 2 && <div key={`d${i}`} className="meta-div" />
            ])}
          </div>

          <div className="countdown">
            {[['days','Days'],['hours','Hrs'],['minutes','Min'],['seconds','Sec']].map(([k,l]) => (
              <div key={k} className="cu">
                <span className="cu-num">{pad(countdown[k])}</span>
                <span className="cu-label">{l}</span>
              </div>
            ))}
          </div>

          <button className="cta" onClick={() => scrollTo('rsvp')}>RSVP</button>
        </div>

        <div className="elev-bar">
          <svg viewBox="0 0 600 60" preserveAspectRatio="none">
            <path d="M0,55 L30,50 L80,38 L140,28 L200,22 L260,30 L320,18 L380,25 L430,32 L480,24 L540,15 L600,20 L600,60 L0,60 Z"
              fill="currentColor" opacity="0.1"/>
            <path d="M0,55 L30,50 L80,38 L140,28 L200,22 L260,30 L320,18 L380,25 L430,32 L480,24 L540,15 L600,20"
              stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35"/>
          </svg>
        </div>
      </div>

      <RiverDivider flip />

      {/* ── DETAILS (Bristol route strip) ── */}
      <div id="details" className="details-wrapper">
        <Section className="details-section">
          <h2 className="section-title">The Details</h2>

          <div className="detail-rows">
            {[
              {
                pin: '', head: 'Date & Time',
                body: <>Saturday, <strong>26 September 2026</strong> — doors open at <strong>3:15 PM</strong><br></br> Ceremony begins at <strong>4:00 PM</strong></> ,
                note: '',
              },
              {
                pin: '', head: 'Location',
                body: <>Mud Dock Cafe, 40 The Grove, Bristol BS1 4RB </>,
                note: 'On the harbourside beside Thekla and Queen Square',
                link: { href: 'https://maps.app.goo.gl/FoAoAAB8NbRpcHqo6', text: 'Open in Maps →' },
              },
              {
                pin: '', head: 'Dress Code',
                body: <>Smart/Dressy casual — just don't wear jeans, sportswear or running shoes</>,
                note: 'Joyful outfits and colours encouraged.',
              },
              {
                pin: '', head: 'Getting There',
                body: <>15 min walk from Bristol Temple Meads. Buses, bikes, car and even ferry options</>,
                note: '',
              },
            ].map(row => (
              <div key={row.pin} className="detail-row">
                <div className="dr-marker">
                  <span className="dr-pin">{row.pin}</span>
                </div>
                <div className="dr-body">
                  <h3>{row.head}</h3>
                  <p>{row.body}</p>
                  {row.note && <p className="dr-note">{row.note}</p>}
                  {row.link && <a className="dr-link" href={row.link.href} target="_blank" rel="noopener noreferrer">{row.link.text}</a>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <RiverDivider />

      {/* ── SCHEDULE (Nature/botanical) ── */}
      <div id="schedule" className="schedule-wrapper">
        <Section className="schedule-section">
          <h2 className="section-title section-title-light">Order of the Day</h2>
          <div className="timeline">
            {SCHEDULE.map((item, i) => (
              <div key={i} className="tl-item">
                <div className="tl-km">
                </div>
                <div className="tl-spine">
                  <div className="tl-pip" />
                  {i < SCHEDULE.length - 1 && <div className="tl-line" />}
                </div>
                <div className="tl-body">
                  <div className="tl-top">
                    <p className="tl-label">{item.label}</p>
                    <span className="tl-time">{item.time}</span>
                  </div>
                  {item.note && <p className="tl-note">{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <RiverDivider dark />

      {/* ── FAQs ── */}
      <div id="faqs" className="faqs-wrapper">
        <Section className="faqs-section">
          <h2 className="section-title">FAQs</h2>
          <p className="section-sub">Everything else you might be wondering</p>
          <div className="faq-list">
            {FAQS.map((item, i) => (
                <FaqItem key={i} index={i} q={item.q} a={item.a} />
            ))}
          </div>
        </Section>
      </div>

      <RiverDivider flip />

      <div id="rsvp" className="rsvp-wrapper">
        <Section className="rsvp-section">
          {/*<p className="eyebrow">Sign the Guest Book</p>*/}
          <h2 className="section-title">RSVP</h2>
          <p className="section-sub">Please respond as soon as you can</p>

          {submitted ? (
              <div className="success">
                <h3>Thanks{attending === 'yes' && guests[0].name ? `, ${guests[0].name}` : ''}!</h3>
                <p>{attending === 'yes'
                    ? `We can't wait to celebrate with ${guests.length > 1 ? 'you all' : 'you'} — see you on the waterfront!`
                    : "We'll miss you — thanks for letting us know."}</p>
              </div>
          ) : (
              <form className="form" onSubmit={async e => {
                e.preventDefault();
                const ok = await submitRsvp({ attending, guests, message });
                if (ok) setSubmitted(true);
              }}>

                {/* ── Attending question ── */}
                <div className="fg">
                  <label>Will you be joining? *</label>
                  <div className="toggle-row">
                    {[['yes',"Absolutely, We're in!"],['no',"Can't make it"]].map(([v,l]) => (
                        <button key={v} type="button"
                                className={`toggle ${attending === v ? 'on' : ''}`}
                                onClick={() => setAttending(v)}>{l}</button>
                    ))}
                  </div>
                </div>

                {/* ── Guest list (only if attending) ── */}
                {(attending === 'yes' || attending === 'no') && (
                    <div className="guest-list">
                      <div className="guest-list-header">
                        <span className="guest-list-label">Your party</span>
                        <span className="guest-count">{guests.length} {guests.length === 1 ? 'guest' : 'guests'}</span>
                      </div>

                      {guests.map((guest, idx) => (
                          <div key={guest.id} className="guest-card">
                            <div className="guest-card-header">
                              <span className="guest-num">Guest {idx + 1}</span>
                              {guests.length > 1 && (
                                  <button type="button" className="guest-remove" onClick={() => removeGuest(guest.id)} aria-label="Remove guest">
                                    ✕
                                  </button>
                              )}
                            </div>

                            <div className="fg">
                              {/*<label>Full name *</label>*/}
                              <input
                                  type="text"
                                  required
                                  placeholder={idx === 0 ? 'Your name' : 'Guest name'}
                                  value={guest.name}
                                  onChange={e => updateGuest(guest.id, 'name', e.target.value)}
                              />
                            </div>
                            {attending === 'yes' && (
                              <div className="fg">
                                <label>Dietary requirements (Event is meat free)</label>
                                <select
                                    value={guest.dietary}
                                    onChange={e => updateGuest(guest.id, 'dietary', e.target.value)}
                                >
                                  <option value="">Please select…</option>
                                  {DIETARY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                              </div>
                            )}

                            {guest.dietary === 'Other (please specify)' && (
                                <div className="fg">
                                  <label>Please give details</label>
                                  <input
                                      type="text"
                                      placeholder="Tell us about their needs…"
                                      value={guest.other}
                                      onChange={e => updateGuest(guest.id, 'other', e.target.value)}
                                  />
                                </div>
                            )}
                          </div>
                      ))}

                      <button type="button" className="add-guest-btn" onClick={addGuest}>
                        <span className="add-guest-icon">+</span>
                        Add another guest
                      </button>
                    </div>
                )}

                {/* ── Message ── */}
                {attending !== null && (
                    <div className="fg">
                      <label>Message to Helen &amp; Will</label>
                      <textarea rows={4} placeholder="Share your well wishes…"
                                value={message} onChange={e => setMessage(e.target.value)} />
                    </div>
                )}

                <div className="submit-wrap">
                  <button type="submit" className="submit" disabled={!canSubmit || submitStatus === 'sending'}>
                    {submitStatus === 'sending' ? 'Sending…' : 'Send RSVP'}
                  </button>
                  {submitStatus === 'error' && (
                      <p className="submit-error">Something went wrong — please try again.</p>
                  )}
                </div>
              </form>
          )}
        </Section>
      </div>

      <RiverDivider />

      {/* ── Footer (Nature) ── */}
      <footer className="footer">
        {/*<Sprig className="footer-sprig footer-sprig-l" />*/}
        <div className="footer-inner">
          {/*<WheelDeco size={44} className="footer-wheel" />*/}
          <p className="footer-names">{COUPLE.bride} &amp; {COUPLE.groom}</p>
          <p className="footer-loc">Bristol · Avon Valley · 12.09.2026</p>
          <p className="footer-note">Ride on with love</p>
        </div>
        {/*<Sprig className="footer-sprig footer-sprig-r" />*/}
      </footer>

      {/* ── Floating Style Button (always visible) ── */}
      <button className="fab" onClick={() => setEditorOpen(true)} aria-label="Open style editor">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </button>

    </div>
  );
}
