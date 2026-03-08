# 🔥 Calcifer

> *"I feel like I'm burning up from the inside."*
> That's your codebase, every time someone new tries to understand it.

**Calcifer** is an AI agent that reads a GitHub repo and actually tells you what's going on inside it — the architecture, the bugs, how to contribute, and whether you specifically have the skills to jump in.

Paste a URL. Pick a mode. Watch the fire think. Get a real, deep report.

---

<!-- DEMO VIDEO — add here -->
<!-- [![Calcifer Demo](thumbnail.png)](your-video-link) -->

---

<!-- SCREENSHOT — add here -->
<!-- ![Calcifer UI](screenshot.png) -->

---

## What it actually does

You've been there. You open a new GitHub repo, stare at 400 files, and have absolutely no idea where to start. Or you want to contribute to open source but can't figure out if you even have the right skills for it. Or you're doing a code review and need a second pair of eyes that doesn't get tired.

Calcifer solves all of that. Drop in a repo URL, choose what you want to know, and it spins up a Gemini-powered agent that actually *reads the code* — not just the README — and gives you a structured, specific report.

Four modes:

- **Documentation** — What is this thing? How does it fit together? Give me a map.
- **Contribution** — I want to help. Where do I start? What do I need to know?
- **Bug Hunt** — Find real issues. Security gaps, logic errors, the stuff that slips through PR review.
- **Skill Match** — *This one's my favorite.* Tell Calcifer your skills — languages, frameworks, experience level — and it matches you to the exact files and issues in that repo where you'd actually be useful.

---

## The agent part — how I thought about this

This is the bit I'm most proud of.

Most "AI + GitHub" tools just throw the whole README at an LLM and ask it to summarize. That's not an agent — that's a prompt wrapper. I wanted something that actually *reasons* about the code, the way a real engineer would when onboarding to a new codebase.

Here's what Calcifer actually does under the hood:

1. Fetches the full file tree and repo metadata from GitHub's API
2. Scores every file by relevance to your chosen mode (bugs mode weights security-critical files differently than contribution mode)
3. Extracts symbols from the top files using regex — functions, classes, exports — without burning API tokens on it
4. Hands that repo map to Gemini along with a system prompt that defines its mission
5. Gemini then *decides* which files to actually read — using a `read_files` tool call
6. The agent loops: read files → reason → read more files → reason → write report
7. Up to 7 rounds, up to 60 files total, capped at 10KB per file to keep it honest

The key thing I tried to get right: **the agent decides what to read, not me.** I just give it the map and the mission. It follows the code wherever it leads — entry points to core modules to edge cases — exactly like a real engineer would.

I spent a lot of time on the prompts too. Each mode has a different persona and a different report structure. The skill match prompt basically tells Gemini to act as a mentor who knows both the codebase *and* the developer's background. That one surprised me with how well it works.

---

## Built with Claude

I built Calcifer in collaboration with Claude. Every meaningful design decision — the agent loop architecture, the file scoring system, the symbol extraction, the prompt engineering — happened through conversations where I described what I wanted and Claude helped me figure out how to build it.

This wasn't "Claude wrote it and I reviewed it." It was more like pairing with someone who knew the APIs better than I did but needed me to drive. The ideas were mine, the shape of the thing came from a lot of back-and-forth, and the final code is something I actually understand and can maintain.

If you want to build something non-trivial with an AI and still feel like *you* built it — that's what this felt like.

---

## Tech Stack

| Layer | What |
|-------|------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + custom CSS vars |
| AI | Google Gemini (`@google/generative-ai`) |
| Markdown rendering | `react-markdown` + `remark-gfm` |
| Fire animation | `lottie-react` |
| Font | IBM Plex Mono |

Zero backend. No server, no API routes, no database. Everything runs client-side. Your API keys never leave your browser.

---

## Running it yourself

```bash
git clone https://github.com/vedas-dixit/embercore
cd embercore
npm install
npm run dev
```

You'll need:
- A **Google Gemini API key** — [get one here](https://aistudio.google.com/app/apikey)
- A **GitHub token** (optional, but removes rate limits) — [Personal Access Tokens](https://github.com/settings/tokens)

Add them through the key icon in the UI. They're stored in `localStorage` — nothing is sent anywhere else.

---

## Contributing

I'd genuinely love for people to build on this.

The codebase is relatively small and pretty readable. The most interesting pieces are:

- [`app/lib/agent.ts`](app/lib/agent.ts) — the main orchestrator, where everything comes together
- [`app/lib/gemini.ts`](app/lib/gemini.ts) — the agent loop itself, where Gemini drives the reads
- [`app/lib/github.ts`](app/lib/github.ts) — the file scoring and GitHub API calls
- [`app/lib/prompts.ts`](app/lib/prompts.ts) — the system prompts that define each mode's persona

Things I'd love to see added:
- More analysis modes (dependency auditing? license checking? test coverage gaps?)
- Better file scoring for more languages
- Support for GitLab / Bitbucket URLs
- A way to diff reports over time — same repo, different commits
- Anything you think would make this more useful

If you're not sure where to start, actually run Calcifer on this repo in contribution mode. It'll tell you.

---

## Project structure

```
app/
├── page.tsx                  # Root state machine (loading → idle → processing)
├── components/
│   ├── MainApp.tsx           # Mission config: URL input + mode selector
│   ├── DraggableWindow.tsx   # The retro window chrome
│   ├── ProgressView.tsx      # Live terminal-style progress feed
│   ├── OutputView.tsx        # Markdown report renderer
│   ├── FireAnimation.tsx     # The little fire with blinking eyes
│   ├── FireworksOverlay.tsx  # Canvas fireworks on completion 🎆
│   ├── SkillsModal.tsx       # 5-step skill profile wizard
│   └── ...
└── lib/
    ├── agent.ts              # Main orchestrator
    ├── gemini.ts             # Agent loop (tool calling)
    ├── github.ts             # GitHub API + file scoring
    ├── symbols.ts            # Regex symbol extraction
    ├── prompts.ts            # System prompts per mode
    └── types.ts              # Shared types
```

---

## The fire theme

The retro macOS aesthetic wasn't an accident. I wanted something that felt like an old terminal — like you're running a command that actually *does* something. The fire is Calcifer from Howl's Moving Castle. A small spirit doing serious work, burning hot so the castle can move.

That felt right.

---

## License

MIT — do whatever you want with it.

---

*Made with 🔥 in heart by Vedas*
