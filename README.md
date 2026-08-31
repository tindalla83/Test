# Viability consultancy website

A single-page marketing site for a specialist development viability consultancy.
Plain HTML, CSS and a little vanilla JavaScript — no build step, no dependencies.

## Running it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Files

```
index.html            All page content
assets/css/styles.css Styling (palette variables at the top of the file)
assets/js/main.js     Mobile menu, footer year, enquiry form handling
```

## What to change before going live

Anything in `[square brackets]` is a placeholder:

- **Practice name** — "Meridian Viability" appears in the `<title>`, header, footer and
  Open Graph tags. Search and replace.
- **Hero statistics** — the four `[000+]`-style figures. Use real numbers or delete the
  `.hero__stats` block entirely.
- **About section** — your name, qualifications, background, RICS registration,
  PI cover, and coverage area.
- **Contact details** — `hello@example.com` and `+44 (0)1234 567 890` appear in
  `index.html` (contact section and footer) and in `assets/js/main.js`.
- **Company registration** and the privacy notice / terms links in the footer.
- **Canonical and `og:url`** — set to your real domain.

## Enquiry form

There is no backend. On submit the form validates and then opens the visitor's mail
client with the details pre-filled. To take submissions properly, replace the submit
handler in `assets/js/main.js` with a `fetch()` POST to a form service (Formspree,
Netlify Forms, your own endpoint) and add a privacy notice covering how enquiries are stored.

## Colours

Defined as custom properties at the top of `assets/css/styles.css` — change `--navy`
and `--accent` to rebrand the whole site.

---

# Concept Viability Model (`model/`)

`model/index.html` is a browser version of
`Strat_Land_Concept_Viab_Res_Land_v6.0 (Freehold).xlsm`. Single self-contained
file — no build step, no dependencies, works from `file://` or any static host.

```sh
python3 -m http.server 8000   # then open http://localhost:8000/model/
```

## What it does

The **Viability Summary** and **IRR Input** sheets are the front end. Every cell
that is yellow in the workbook is an editable yellow cell here, and everything
else recalculates on each keystroke:

- the unit calculator (mix ratios, unit counts, floor areas) — `Calc.`
- the development appraisal down to residual land value — `Concept Viab Model Strat`
- the 229-month cashflow, with the workbook's own spend profiles: build
  S-curve, infrastructure release tranches, prelims split, DPE annual buckets,
  linear customer care and sales & marketing, land VAT out and back
- interest, IRR, NPV, peak debt, break-even and cost of planning failure

A **Cashflow** tab shows the monthly detail, a cumulative cash chart and a CSV
export. **Reset** restores the workbook's shipped assumptions.

## Land payment schedule

Land can be paid in up to five instalments, each with its own date. Split it by
**share of the net offer value** (the default) and the schedule re-prices itself
whenever an appraisal input moves that value, so it stays reconciled; split it by
**fixed amounts** and it holds the numbers you typed. Presets cover the common
shapes — single payment, or two, three or five equal annual instalments.

The schedule reaches the cashflow, so it moves the cost of finance, peak debt,
IRR and net margin. It does *not* move the residual land value, which is struck
before finance. The panel shows exactly what the deferral is worth against
paying the whole sum on the first date — on the shipped assumptions, five equal
annual instalments cut the interest bill by £480,000, lift IRR from 2.69% to
2.86% and net margin from 10.56% to 10.72%, and take £5.4m off peak debt.

Acquisition costs (legals, agent, SDLT) fall on the first instalment, when title
passes. VAT is charged on each instalment as it is paid and reclaimed the month
after.

## Land value goal seek

Type a target land value per net developable acre and the panel solves the
headline margin that reaches it, showing the residual land value, stamp duty,
net offer value and net margin at that target as you type. **Apply this margin**
writes it into the appraisal so every other tab follows. If the only way to
reach the target is at a loss, the panel says so rather than quietly returning
a negative margin.

## Scenarios

**Save scenario** keeps a named snapshot of every input. The **Scenarios** tab
lines them up as columns against the headline numbers — units, revenue, cost,
residual land value, net offer value, the three margins, PBT, IRR, NPV, peak
debt and break-even — with the working inputs pinned as the first column so
unsaved edits compare against saved work.

Pick any column as the baseline and the rest show their delta beneath each
figure, coloured by whether the move helps or hurts (revenue up is good, cost of
finance up is not). Rename a column by typing in it; **Load** pulls a scenario
back into the working inputs, **Update** overwrites it with them, **Copy**
branches it. Below the table, the cumulative cash curves overlay on one chart —
tick *chart* on a column to include it, hover for every scenario's position in
that month. Each scenario keeps its colour for life, so hiding one never
repaints the others. Everything lives in browser storage on your machine.

## Reconciliation

On the workbook's own inputs the page reproduces it exactly:

| | Workbook | Page |
|---|---|---|
| Total sales revenue | £305,391,750 | £305,391,750 |
| Total development cost inc. contingency | £244,878,061 | £244,878,061 |
| Cost of finance | £7,272,332 | £7,272,332 |
| Residual land value | £16,920,000 | £16,920,000 |
| Net offer value for land | £16,000,000 | £16,000,000 |
| Net margin | £32,256,357 / 10.56% | £32,256,357 / 10.56% |
| IRR | 2.69% | 2.69% |
| Peak debt | −£69,447,126 (Dec 2028) | −£69,447,126 (Dec 2028) |
| NPV @ 5% | −£9,764,645 | −£9,764,645 |

Five deliberate differences:

1. **Interest is solved, not pasted.** The workbook breaks its own circular
   reference by hard-coding the cashflow interest into `Concept Viab Model
   Strat!AH64` and goal-seeking it by hand — the shipped file is out by
   £2.59m on that cell. Interest here is read straight off the cashflow, so
   *Cost of Finance* is always current.
2. **An IRR with no solution says so.** Where a cashflow never crosses zero
   there is no rate that discounts it to nil. `Cash_flow!L85` wraps XIRR in
   `IFERROR(...,0)`, so the workbook prints `0.0%` — which reads as a real
   return of zero. The page shows `n/a` instead. This matters most in scenario
   comparison, where a fabricated 0% would sort as if it beat a negative one.
3. **VAT follows the instalments.** The workbook charges the whole VAT bill at
   the first land payment (`Land Input!H27 = H14`) and reclaims it a month
   later, whatever the payment schedule. On a staged purchase that front-loads
   several million pounds of outflow and overstates the interest. Here each
   instalment carries its own VAT, apportioned from the same base the workbook
   uses (`Stamp!E5`, the gross payment before SDLT is netted off), so a single
   payment still reconciles exactly.
4. **Stamp duty follows the price being paid.** In the *known land value*
   block the workbook links duty to `Concept Viab Model Strat!P76`
   (`'Viabililty Summary'!T88`), which is the duty on the *residual* land
   value — so entering an agreed price of £8m or £25m leaves the duty, the
   cost of land and the resulting margin all computed on £16.9m. Duty here is
   charged on the accepted offer. At the residual price the two agree exactly,
   because `P76` grosses down a duty-inclusive pot, which is the same as
   charging the rate on the net figure — so the shipped case still reconciles.
5. **The IRR window is switchable.** `Cash_flow!L85` runs XIRR over
   `OFFSET(L68,0,0,1,J85)`, and `J85` counts a fixed 197-column range — so the
   workbook's IRR ignores the last three years of the scheme. That is the
   default here, to tie out. The Cashflow tab offers the full-series IRR
   alongside it (2.69% vs 4.99% on the shipped inputs).

## Not carried over

The workbook's detail tabs (accommodation schedule, house-type library,
regional build-cost books, COINS cost codes, authorisation, @RISK simulation)
are not part of the concept-stage calculation and are not reproduced. The
`Cost of planning failure` block sums pre-allocation spend from the main
cashflow rather than the workbook's parallel disposal sub-cashflow, so it lands
within about 0.3% of the sheet.
