import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, RotateCcw, Square, X } from 'lucide-react';
import { buildTurns, CHAT_MAX_INPUT, linkify, type ChatMessage } from '../../lib/chat';
import { chatHintDelay, completeHint, useHint } from '../../lib/hints';
import { useNarration } from '../../contexts/useNarration';
import { BotAvatar } from './BotAvatar';
import { RobotBuddy, type RobotPose } from './RobotBuddy';

const SUGGESTIONS = [
  'What has Kavisha built?',
  "What's his tech stack?",
  'Is he open to internships?',
  'How can I contact him?',
];

const GREETING = "Hi! I'm Kavisha's AI assistant. Ask me about his projects, skills, education, or how to reach him.";
const FALLBACK_ERROR = 'Sorry, something went wrong. You can reach Kavisha at lakshan.kavishatt@gmail.com.';

function Answer({ text }: { text: string }) {
  return (
    <>
      {linkify(text).map((part, i) =>
        part.type === 'link' ? (
          <a
            key={i}
            href={part.href}
            target={part.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="[overflow-wrap:anywhere] font-medium text-brand-primary underline underline-offset-2 hover:opacity-80"
          >
            {part.text}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

function BotBubble({ children, failed = false }: { children: ReactNode; failed?: boolean }) {
  return (
    <div className="flex items-end gap-2">
      <span className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary/10">
        <BotAvatar size={22} />
      </span>
      <div
        className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[14px] leading-relaxed ${
          failed
            ? 'bg-red-500/10 text-red-700 dark:text-red-300'
            : 'bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// Phones: while the voice-guide player is open it spans the bottom of the screen, so the
// launcher rises to sit just above it. Returns the lifted bottom offset, or undefined to
// keep the launcher's normal (CSS) position.
function useLauncherLift() {
  const { currentId } = useNarration();
  const [lift, setLift] = useState<number>();
  useEffect(() => {
    let observer: ResizeObserver | undefined;
    const measure = () => {
      const player = document.querySelector('[aria-label="Voice guide player"]');
      if (!player || window.innerWidth >= 1024) return setLift(undefined);
      const rect = player.getBoundingClientRect();
      const overlaps = rect.right > window.innerWidth - 76;
      setLift(overlaps ? Math.round(window.innerHeight - rect.top + 12) : undefined);
    };
    // The player renders in the same commit as the narration change; measure after it.
    const frame = requestAnimationFrame(() => {
      measure();
      const player = document.querySelector('[aria-label="Voice guide player"]');
      if (player) {
        observer = new ResizeObserver(measure);
        observer.observe(player);
      }
    });
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [currentId]);
  return lift;
}

// The site's chat assistant: a little robot asleep on its charging dock in the bottom-right
// corner (on desktop, where the right rail's line comes down to meet it). It waves hello
// when the page opens, then dozes off. Hovering makes it peek; clicking wakes it and opens a chat
// window above it, or a full-screen sheet on phones. Answers stream from /api/chat (server/chat/handler.ts),
// which holds the API key and the site knowledge.
export function ChatAssistant({ interactiveReady }: { interactiveReady: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const lift = useLauncherLift();
  const [hover, setHover] = useState(false);
  // A short wake-up outside the chat: after it closes, or when the visitor reaches Contact.
  const [nudge, setNudge] = useState<'awake' | 'wave' | null>(null);
  const nudgeTimer = useRef<number>(undefined);
  const nudgeFor = useCallback((kind: 'awake' | 'wave', ms: number) => {
    window.clearTimeout(nudgeTimer.current);
    setNudge(kind);
    nudgeTimer.current = window.setTimeout(() => setNudge(null), ms);
  }, []);
  useEffect(() => () => window.clearTimeout(nudgeTimer.current), []);

  // Once the intro loader is gone, the robot waves hello before dozing off.
  useEffect(() => {
    if (!interactiveReady) return;
    const timer = window.setTimeout(() => nudgeFor('wave', 2600), 500);
    return () => window.clearTimeout(timer);
  }, [interactiveReady, nudgeFor]);

  const closeChat = useCallback(() => {
    setOpen(false);
    nudgeFor('awake', 4500);
  }, [nudgeFor]);

  const [hintDelay] = useState(chatHintDelay);
  const [showHint, closeHint] = useHint('chat', hintDelay, interactiveReady && !open);

  // Reaching the Contact section wakes the robot to wave hello.
  useEffect(() => {
    const contact = document.getElementById('contact');
    if (!contact || open) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) nudgeFor('wave', 3200);
      },
      { threshold: 0.35 },
    );
    observer.observe(contact);
    return () => observer.disconnect();
  }, [open, nudgeFor]);

  const pose: RobotPose =
    open || busy ? 'awake' : showHint ? 'wave' : (nudge ?? (hover ? 'peek' : 'sleep'));

  useEffect(() => {
    if (!open) return;
    completeHint('chat');
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeChat();
        launcherRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeChat]);

  // Follow the answer as it streams in, and reopen on the latest message.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, open]);

  // Leaving the page stops any answer in flight.
  useEffect(() => () => abortRef.current?.abort(), []);

  const updateLast = (patch: Partial<ChatMessage>) =>
    setMessages((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], ...patch }]);

  async function ask(question: string) {
    const text = question.trim().slice(0, CHAT_MAX_INPUT);
    if (!text || busy) return;
    const turns = buildTurns(messages, text);
    setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    let answer = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: turns }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        updateLast({ content: data?.error ?? FALLBACK_ERROR, failed: true });
        return;
      }
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += value;
        updateLast({ content: answer });
      }
      if (!answer.trim()) updateLast({ content: FALLBACK_ERROR, failed: true });
    } catch (error) {
      if (controller.signal.aborted) {
        updateLast({ content: answer ? `${answer} …` : 'Stopped.', failed: !answer });
      } else {
        updateLast({ content: FALLBACK_ERROR, failed: true });
        console.error('chat request failed', error);
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Chat with Kavisha's AI assistant"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          style={{ transformOrigin: 'bottom right' }}
          className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-white dark:bg-[#0c0c1c] sm:inset-auto sm:bottom-[164px] sm:right-4 sm:h-[min(600px,calc(100dvh-188px))] sm:w-[380px] sm:rounded-3xl sm:border sm:border-slate-200/80 sm:shadow-[0_24px_64px_-12px_rgba(2,12,27,0.45)] dark:sm:border-brand-primary/25 dark:sm:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.7)] lg:bottom-[112px] lg:right-5 lg:h-[min(620px,calc(100dvh-140px))] xl:right-7"
        >
          {/* Header */}
          <div className="relative flex items-center gap-3 overflow-hidden bg-gradient-to-br from-brand-primary via-indigo-500 to-violet-600 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
            <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <BotAvatar size={34} thinking={busy} />
            </span>
            <div className="relative min-w-0 flex-1 leading-tight">
              <p className="truncate text-[15px] font-semibold">Kavisha&apos;s AI assistant</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {busy ? 'Typing…' : 'Online · replies in seconds'}
              </p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                aria-label="Start a new conversation"
                title="New conversation"
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
              >
                <RotateCcw size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={closeChat}
              aria-label="Close chat"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Conversation */}
          <div ref={logRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
            <BotBubble>{GREETING}</BotBubble>
            {messages.length === 0 && (
              <div className="flex flex-col items-end gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void ask(s)}
                    className="rounded-full border border-brand-primary/35 bg-brand-primary/5 px-3.5 py-1.5 text-[13px] text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div
                  key={i}
                  className="ml-auto w-fit max-w-[82%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-brand-primary to-violet-600 px-3.5 py-2.5 text-[14px] leading-relaxed text-white shadow-sm shadow-brand-primary/30"
                >
                  {m.content}
                </div>
              ) : (
                <BotBubble key={i} failed={m.failed}>
                  {m.content ? (
                    <Answer text={m.content} />
                  ) : (
                    <span className="inline-flex gap-1 py-1.5" aria-label="Thinking">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-primary/70"
                          style={{ animationDelay: `${d * 140}ms` }}
                        />
                      ))}
                    </span>
                  )}
                </BotBubble>
              ),
            )}
          </div>

          {/* Composer */}
          <form onSubmit={submit} className="border-t border-slate-200/70 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 dark:border-white/10">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition-colors focus-within:border-brand-primary/60 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-primary/15 dark:border-white/10 dark:bg-white/5 dark:focus-within:bg-white/[0.07]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void ask(input);
                  }
                }}
                rows={1}
                maxLength={CHAT_MAX_INPUT}
                placeholder="Ask about Kavisha…"
                aria-label="Your question"
                className="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent chat-input py-1 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  aria-label="Stop answer"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 transition-colors hover:bg-slate-300 dark:bg-white/10 dark:text-slate-200"
                >
                  <Square size={12} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition-all hover:scale-105 disabled:scale-100 disabled:opacity-40"
                >
                  <ArrowUp size={16} />
                </button>
              )}
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              AI answers from this site and can make mistakes.
            </p>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const toggle = () => {
    if (open) closeChat();
    else setOpen(true);
  };
  const asleep = pose === 'sleep' || pose === 'peek';

  return (
    <>
      <div
        style={lift === undefined ? undefined : ({ bottom: lift } as CSSProperties)}
        className="fixed bottom-[88px] right-3 z-40 transition-[bottom] duration-200 sm:right-4 lg:bottom-5 lg:right-4 xl:right-6"
      >
        {/* First-visit teaser, after the theme and voice-guide hints (lib/hints). It waits
            for the robot, which wakes up and waves while it shows. */}
        <AnimatePresence>
          {showHint && !open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              style={{ transformOrigin: 'bottom right' }}
              className="absolute bottom-full right-1 mb-1 w-[230px]"
            >
              <div className="relative rounded-2xl rounded-br-md border border-slate-200/80 bg-white px-3.5 py-3 text-[13px] leading-snug text-slate-700 shadow-[0_12px_40px_-8px_rgba(2,12,27,0.35)] dark:border-brand-primary/30 dark:bg-[#141428] dark:text-slate-200">
                <button type="button" onClick={toggle} className="text-left">
                  <span className="font-semibold text-slate-900 dark:text-white">Hi there 👋</span>
                  <br />
                  I&apos;m Kavisha&apos;s robot. Got a question about his work? Ask me.
                </button>
                <button
                  type="button"
                  onClick={closeHint}
                  aria-label="Dismiss"
                  className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow transition-colors hover:text-brand-primary dark:border-white/15 dark:bg-[#1c1c34] dark:text-slate-300"
                >
                  <X size={11} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charging dock: glows while the robot sleeps. */}
        <AnimatePresence>
          {interactiveReady && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0, scaleX: 0.4 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pointer-events-none absolute -bottom-1 left-1/2 -ml-[30px] h-3 w-[60px]"
            >
              <span
                className={`absolute inset-0 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.55),rgba(99,102,241,0.25)_55%,transparent_72%)] blur-[2px] ${
                  asleep ? 'animate-[robot-dock_2.4s_ease-in-out_infinite]' : ''
                }`}
              />
              <span className="absolute inset-x-2 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-brand-primary/70 to-transparent" />
            </motion.span>
          )}
        </AnimatePresence>

        <button
          ref={launcherRef}
          type="button"
          onClick={toggle}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={open ? 'Close chat' : "Chat with Kavisha's AI assistant"}
          title={asleep ? 'Psst… wake me up to chat' : undefined}
          className="group relative block h-[65px] w-[52px] cursor-pointer rounded-2xl drop-shadow-[0_8px_14px_rgba(99,102,241,0.35)] transition-[filter] duration-200 hover:drop-shadow-[0_10px_20px_rgba(99,102,241,0.55)] focus-visible:outline-offset-4 active:scale-95 lg:h-20 lg:w-16"
        >
          <RobotBuddy pose={pose} thinking={busy} className="h-full w-full" />

          {/* Sleeping z's */}
          <AnimatePresence>
            {pose === 'sleep' && (
              <motion.span
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="robot-zzz pointer-events-none absolute -top-1 right-0 h-6 w-6"
              >
                <span style={{ left: 0, top: 10, fontSize: 9, animationDelay: '0s' }}>z</span>
                <span style={{ left: 5, top: 6, fontSize: 11, animationDelay: '1s' }}>z</span>
                <span style={{ left: 10, top: 2, fontSize: 13, animationDelay: '2s' }}>Z</span>
              </motion.span>
            )}
          </AnimatePresence>

        </button>
      </div>
      {createPortal(panel, document.body)}
    </>
  );
}
