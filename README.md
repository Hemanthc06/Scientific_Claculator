# Scientific Calculator

I built this because I got tired of opening random calculator sites that were
either full of ads or missing basic functions like factorial. So I made my own.

It's a single-page scientific calculator that runs entirely in the browser.
No backend, no build step, no npm install. Just three files and you're done.

---

## What it can do

Basic stuff:
- Addition, subtraction, multiplication, division
- Decimals and negative numbers
- Parentheses

Scientific stuff:
- sin, cos, tan (with a DEG/RAD switch)
- ln and log
- Square root
- Powers (x^y)
- e^x and 10^x
- 1/x
- Factorial (n!)
- π and e constants

Other things:
- Dark mode and light mode. It remembers your choice.
- Live preview — the answer updates as you type, before you hit equals
- A history panel that keeps your last 50 calculations. Click one to reuse it.
- Full keyboard support. You can type numbers and operators directly.
- Works on phones too.

---

## Files

```
.
├── index.html    → structure
├── style.css     → all the styling, themes, animations
├── script.js     → the actual calculator logic
└── README.md     → you're reading it
```

That's it. No config files, no folders inside folders.

---

## How to run it

Download the files, keep them in the same folder, and open `index.html`
in any modern browser. That's literally it.

If you want to serve it locally for some reason:

```
python3 -m http.server
```

Then go to `http://localhost:8000`.

---

## Keyboard shortcuts

I use these more than the buttons honestly.

| Key       | Does                |
|-----------|---------------------|
| 0-9       | numbers             |
| .         | decimal point       |
| + - * /   | operators           |
| ^         | power               |
| !         | factorial           |
| ( )       | parentheses         |
| p         | inserts π           |
| Enter     | equals              |
| Backspace | delete last char    |
| Esc       | clear everything    |

---

## A few notes on how it works

I didn't want to pull in a math library, so the whole engine is about
30 lines. When you type an expression, it gets converted into a real
JavaScript expression and evaluated with a small custom context object
that has all the functions like `sin`, `log`, `fact`, etc.

That context approach lets me do two things easily:

1. Make `sin`/`cos`/`tan` respect the DEG/RAD toggle without a bunch of
   `if` statements everywhere.
2. Add custom functions like `fact` (factorial) that don't exist in
   vanilla JS.

There are a couple of small gotchas I had to handle:

- `5!` isn't valid JS, so I rewrite it to `fact(5)` before evaluating.
- If you forget a closing paren like `sin(30`, it auto-closes for you.
- Really big or really small numbers switch to scientific notation so
  the display doesn't blow up.

---

## Things I might add later

Not promises, just ideas:

- inverse trig (asin, acos, atan)
- memory buttons (M+, M-, MR, MC)
- a graphing mode with canvas
- making it installable as a PWA

If I add any of these I'll update this section.

---

## Customizing

If you want to change the accent color, look at the top of `style.css`.
There's a `:root` block with variables like `--accent` and `--accent-2`.
Change those and the whole theme updates.

Same for the transition speed — there's a `--transition` variable.

---

## License

MIT. Do whatever you want with it.

---

## Final note

If something's broken, open an issue or just fix it yourself and
send a PR. I built this for myself but figured other people might
find it useful too.
