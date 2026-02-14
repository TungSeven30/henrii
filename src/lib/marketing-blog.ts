/*
 * Blog data — static seed articles for henrii marketing site.
 * Categories: "parenting" | "product" | "tips"
 * Each post includes full markdown-style body content.
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "parenting" | "product" | "tips";
  date: string; // ISO date string
  readTime: number; // minutes
  author: string;
  coverImage?: string;
  body: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "why-we-built-henrii",
    title: "Why we built henrii",
    coverImage: "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/TgpJhJHjbsgWGFMxeIbOfd-img-1_1770730425000_na1fn_YmxvZy1jb3Zlci13aHktd2UtYnVpbHQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94L1RncEpoSkhqYnNnV0dGTXhlSWJPZmQtaW1nLTFfMTc3MDczMDQyNTAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTEzYUhrdGQyVXRZblZwYkhRLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=TAcYBvg7mOPfA9~yh6aubCdN0isG1v0Ife3~Xpl3lAJlrr5NW7mOOeP~bEMz-p-fkue3~TiuDofy5JJJnAem2TPjjoJdOwxiXuFz6VzyiP5u46VSNqTkNQ2ipvACoMFFH6BpTfGB3E3vV044GQ4Esa0dOxZiK6YGgXq~M7f7IHQSLW21CKYP1Ab1clkuC~0VlbCyqDxoFJ3DUzByEFqp8dD5SYQQN~aP6qvv8QCAIhetDDQrDsg5-Q2ZkDxVxXTYWMitDr1hOWK9TmCNIGV6MjGsV5atfB1qfhddi67ULC370PfpkbhbCN1WxJL4sB4llT3dE8-ZgNTwNdYCkRtZuQ__",
    excerpt:
      "Every parent has been there — fumbling with a phone at 3am, trying to remember when the last feeding was. We built henrii because we lived it.",
    category: "product",
    date: "2026-02-01",
    readTime: 4,
    author: "henrii team",
    body: `Every parent has been there. It's 3am, the baby is crying, and you're trying to remember — was the last feeding at midnight or 1:30? Did they eat from the left side or the right? How long has it been since the last diaper change?

You reach for your phone with one hand (the other is holding a baby, obviously), squinting at a screen that's way too bright, trying to navigate an app that was clearly designed by someone who has never held a newborn at 3am.

That's why we built henrii.

## The problem we kept running into

When our son Henry was born, we tried every baby tracking app we could find. Some were packed with features we didn't need. Others looked like they were designed in 2012. Most of them required too many taps to log something simple.

We didn't need a social network for parents. We didn't need AI-powered sleep predictions. We needed to tap one button, log a feeding, and go back to sleep.

## What makes henrii different

henrii is built around one principle: **calm is the feature**. Every design decision starts with the question — "would this work at 3am with one hand?"

If the answer is no, it doesn't ship.

The interface is deliberately minimal. Large tap targets. High contrast. No unnecessary animations or transitions that slow you down. Just the information you need, when you need it.

## What's coming next

We're currently in early development, building the core tracking features — feedings, sleep, diapers, and vaccinations. We're also working on:

- **Offline-first architecture** so the app works even without internet
- **Dark mode** that's truly dark, not just a grey background
- **Caregiver sharing** so your partner or family can log entries too
- **PDF reports** you can bring to pediatrician visits

If this sounds like something you need, create your free account and try henrii. We'd love your feedback.`,
  },
  {
    slug: "newborn-sleep-tracking-guide",
    title: "A practical guide to tracking your newborn's sleep",
    coverImage: "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/TgpJhJHjbsgWGFMxeIbOfd-img-2_1770730435000_na1fn_YmxvZy1jb3Zlci1zbGVlcC10cmFja2luZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94L1RncEpoSkhqYnNnV0dGTXhlSWJPZmQtaW1nLTJfMTc3MDczMDQzNTAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTF6YkdWbGNDMTBjbUZqYTJsdVp3LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=RXiXGgrT7jLFZBoryI1~zSauX0ETveW~BE7ZzGvjZMhOwf0Egi5DjcS-NY01-1yPxVgz1884R4nv49zpX2oRwAR3o~3dZlPLDIDpfcooMYwjLJymGMpCvAldatCINSB2~0X9Mv90CBNVrof5s3FwcoIc-FhIxL2BH8l7ZWPDgg9TKeBl8efLUwGfhC-Fhy9~DEH-tbfeXiXkC5LJcGmuF0npec0y9VpSRl8RIay0rrO56CfoCX-kZ31gUdBg9xa1HSautJaYOfCaCBU6apHy8KOA2OBxkteG8OI-dWMaFCmqwGVNSA-wtP3PfWASbx9DdmVyFUIjY-ZYIO~DgYIKTg__",
    excerpt:
      "Newborn sleep is unpredictable. Here's how tracking patterns (without obsessing) can help you find a rhythm and get a little more rest yourself.",
    category: "tips",
    date: "2026-02-05",
    readTime: 5,
    author: "henrii team",
    body: `Let's start with the truth: newborn sleep is chaos. Your baby doesn't know the difference between day and night, and their sleep cycles are roughly 45 minutes long. No app is going to magically fix that.

But tracking sleep — even loosely — can help you spot patterns you'd otherwise miss. And those patterns are what eventually help you find a rhythm.

## Why track sleep at all?

The goal isn't to optimize your baby's sleep schedule like a productivity hack. It's to give yourself information. When you're running on 4 hours of broken sleep, your memory isn't reliable. Having a simple log helps you answer questions like:

- Is the baby sleeping more during the day than at night?
- Are naps getting shorter or longer over time?
- Is there a pattern to when they wake up hungry?

This information is also incredibly useful for pediatrician visits. Instead of saying "I think they sleep okay?", you can show actual data.

## What to track (and what to skip)

Keep it simple. For the first few months, you really only need:

**Track these:**
- When sleep starts and ends
- Whether it was a nap or nighttime sleep
- Total sleep in a 24-hour period

**Skip these (for now):**
- Sleep quality scores
- Dream feeds vs. regular feeds
- Room temperature and humidity
- White noise settings

You can always add more detail later. In the early weeks, the goal is consistency, not completeness.

## Tips for tracking without stress

**1. Log in real-time, not from memory.** Even a 30-minute delay makes it harder to remember accurately. This is why one-tap logging matters — if it takes more than 2 seconds, you won't do it at 3am.

**2. Don't compare to "averages."** Every baby is different. The charts that say "newborns sleep 16-17 hours" are averages across thousands of babies. Your baby might sleep 13 hours and be perfectly healthy.

**3. Look at weekly trends, not daily numbers.** A single bad night means nothing. A week of shorter naps might mean something. Zoom out.

**4. Share the data with your partner.** If you're taking shifts, having a shared log means you don't need to brief each other at handoff. You can just check the app.

## When to talk to your pediatrician

Sleep tracking can help you spot things worth mentioning at your next visit:

- Consistently sleeping much less than expected for their age
- Sudden changes in sleep patterns
- Difficulty falling asleep that gets worse over time
- Frequent waking that doesn't improve after the first few months

Remember: you're tracking to inform, not to diagnose. Your pediatrician is the expert.

## The henrii approach

We designed henrii's sleep tracking to be as simple as possible. One tap to start, one tap to stop. The app calculates totals and shows trends automatically. No manual math, no complicated forms.

Because at 3am, simple is everything.`,
  },
  {
    slug: "feeding-schedule-first-months",
    title: "Feeding schedules in the first 3 months: what to expect",
    coverImage: "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/TgpJhJHjbsgWGFMxeIbOfd-img-3_1770730429000_na1fn_YmxvZy1jb3Zlci1mZWVkaW5nLXNjaGVkdWxl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94L1RncEpoSkhqYnNnV0dGTXhlSWJPZmQtaW1nLTNfMTc3MDczMDQyOTAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTFtWldWa2FXNW5MWE5qYUdWa2RXeGwucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=YoR0JWBG1rmd6FMu1CRzPexlkSpex1mh5NQZtatcrLG4OTLPaZsHdA9xzArYtpEhNXAuKbHZGoMvwWwKUFkjmID11Btur7vb6JnJ7TNniKIOyO~oTDlg2p-0eJFk8Vt0ujBLkDo7YIfuolOOZ0DsfusnYFvW8HaW54hE4OyZ4mE~n4wXuMWD-5frsko99S9fWu~eTFMIWr4Hz6Wo84FWyiJhXiNWpi9T1kbjWD4r2GohbAtvo17wS5lgcVfPtIgCfnMfoDQ4L4FZ9Ls7dXPeyqss93F-8zuE~vqCoC4WuTJz1HNPhIvmuZey35ULhg8txh5fHAqjw8l-IgvJv~JjNA__",
    excerpt:
      "Breastfeeding, bottle feeding, or both — here's a realistic look at feeding patterns and why tracking them helps more than you'd think.",
    category: "parenting",
    date: "2026-02-07",
    readTime: 6,
    author: "henrii team",
    body: `If there's one thing new parents hear constantly, it's "feed on demand." And while that's good advice, it doesn't tell you much about what to actually expect.

Here's a more honest look at feeding in the first three months — and why keeping a simple log can make the whole experience less stressful.

## The first two weeks

In the first two weeks, your baby will eat frequently — roughly every 1.5 to 3 hours, around the clock. That's 8 to 12 feedings per day. It feels relentless because it is.

If you're breastfeeding, this frequency is important for establishing milk supply. If you're bottle feeding, you'll be washing a lot of bottles. Either way, it's a lot.

**What tracking helps with:** Knowing when the last feeding was so you can anticipate the next one. When you're sleep-deprived, even this simple information feels like a superpower.

## Weeks 2 through 6

Feedings start to space out slightly — maybe every 2 to 3 hours during the day, with one longer stretch at night (if you're lucky). Your baby is also getting more efficient at eating, so individual feedings may get shorter.

This is when patterns start to emerge. You might notice your baby is hungrier in the evenings (cluster feeding is real and normal) or that they have a predictable "long sleep" window.

**What tracking helps with:** Spotting the cluster feeding pattern so you can plan around it. If you know evenings are intense, you can prep dinner earlier or tag-team with your partner.

## Months 2 and 3

By now, most babies have settled into a more predictable rhythm. Feedings are typically every 2.5 to 4 hours, and nighttime stretches are getting longer. You might even get a 4-5 hour block of sleep (celebrate this).

**What tracking helps with:** Confirming that your baby is eating enough. If your pediatrician asks "how many ounces per day?" or "how many feedings?", you'll have the answer ready.

## Breast, bottle, or both

Tracking is useful regardless of how you feed:

**Breastfeeding:** Track which side you started on, duration, and time. This helps ensure you're alternating sides and can spot if one side is producing less.

**Bottle feeding:** Track volume (oz or ml) and time. This makes it easy to calculate daily intake, which pediatricians often ask about.

**Combination feeding:** Track both. It's especially helpful to see the ratio of breast to bottle and how it changes over time.

## The one thing to remember

Feeding your baby is not a performance metric. Some days they'll eat more, some days less. Some feedings will be quick, others will take forever. The goal of tracking isn't to hit a number — it's to have information when you need it and to reduce the mental load of trying to remember everything.

henrii makes this easy with one-tap logging for feedings, automatic duration tracking, and simple daily summaries. Because the last thing you need at 3am is a complicated form.`,
  },
  {
    slug: "henrii-early-access-announcement",
    title: "Early access is coming soon",
    coverImage: "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/TgpJhJHjbsgWGFMxeIbOfd-img-4_1770730427000_na1fn_YmxvZy1jb3Zlci1lYXJseS1hY2Nlc3M.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94L1RncEpoSkhqYnNnV0dGTXhlSWJPZmQtaW1nLTRfMTc3MDczMDQyNzAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTFsWVhKc2VTMWhZMk5sYzNNLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=q7PUyCDcyMpvwKzMTVPE0hL1s~B9VC55GAdY1u-V8bxRfnqZtkAbQqS7x1pjiQXHHbcKASiYb8n8yUZi6wAr3cPOUSXVNaJBd7w70fA4kxVBgRxKZCmBwEXRPgohjTGyICuYtZecPLx51xQX-pLpNCSFdyITbR-HoJrttwRkqF5~Uq83G2~fB9m8ZERjmCr9m2dhLSE796iX5kAgbTOPwBPhsWWRjqjh6eP38PVvapUStkHyQbZNsv7~lmdekpHeWqRLZ7xootqi2~tSXEwf6ip6heMzq1sXP1hSfghw04JSDBzZmJivrLBA454RayGVTVpEyebRfuL64J3Mkw-qdg__",
    excerpt:
      "We're getting close to opening henrii to our first users. Here's what to expect from the early access release and how to get in.",
    category: "product",
    date: "2026-02-09",
    readTime: 3,
    author: "henrii team",
    body: `We've been building henrii for the past several months, and we're almost ready to put it in your hands.

## What's in the early access release

The first version of henrii focuses on the core tracking features that every new parent needs:

- **Feeding tracking** — breast, bottle, or both. One tap to start, one tap to stop. Track duration, side, and volume.
- **Sleep tracking** — log naps and nighttime sleep with a single tap. See daily totals and weekly trends.
- **Diaper tracking** — quick logging for wet and dirty diapers. Track frequency to share with your pediatrician.
- **Vaccination records** — keep a digital record of your baby's immunizations with dates and notes.

All of these work offline, so you're never stuck waiting for a connection when your baby needs attention.

## What's coming after launch

We have a roadmap of features we're excited about, including:

- **WHO growth charts** — plot your baby's weight, height, and head circumference against standard growth curves
- **Analytics dashboard** — visualize feeding and sleep patterns over time
- **PDF reports** — generate summaries to bring to pediatrician appointments
- **Caregiver sharing** — invite your partner, grandparents, or nanny to log entries and view data
- **Pattern detection** — smart alerts when the app notices changes in your baby's routines

## How to get early access

If you want early access, create an account and join the beta. We're planning to roll out in small batches so we can gather feedback and make improvements quickly.

Not on the beta list yet? Head to our homepage and create an account. No spam, no sales pitches — start tracking when you're ready.

## A note on pricing

Core tracking features will be **free forever**. We believe every parent should have access to a reliable, well-designed baby tracker without paying for it.

Premium features (growth charts, analytics, PDF reports) will be available through a paid plan at $4.99/month or $39.99/year. We're also offering a lifetime deal at $99 for early supporters who want to lock in access to everything, forever.

## Thank you

Building henrii has been a labor of love. We started this because we needed it ourselves, and every message from a parent using henrii reminds us why it matters.

We can't wait for you to try it.`,
  },
  {
    slug: "toddler-milestones-worth-tracking",
    title: "Toddler milestones worth tracking (and ones you can relax about)",
    coverImage: "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/ruZCkld1d0nXItuMTQNzYX-img-1_1770731037000_na1fn_YmxvZy1jb3Zlci10b2RkbGVyLW1pbGVzdG9uZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94L3J1WkNrbGQxZDBuWEl0dU1UUU56WVgtaW1nLTFfMTc3MDczMTAzNzAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTEwYjJSa2JHVnlMVzFwYkdWemRHOXVaWE0ucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=KailNsoH3gD0un08WcP0mLjoY3dlE56M9OARxwOJ3wlDGG~eRTxZ9E~3UN7k1e7EYxLKSMJAuafTAuiL18FpjZOsmjE2wdqTaiy8cuWrODmmWyBuBGw0jr6p7~4miyddInC4VnZ9ywFQ5mQDKxwyx4M3ah3i08Mxeg7A2M-lhpIfKg~lQJfYfWipyqMGQiYuT~Nkt3JemJz-6JUYUiKCWr8DUbMrtt1Pv6hz87IsAbGYIfmZ71yW5NrcpTa2BBHFgrFRcPFubw39i~OHVnDQmnvxGvOccz0~LlI7x7iDkntG~aa3oou9540aAZ99IazetAx9-Jk7pFCh6jbO7GzC8A__",
    excerpt:
      "First words, first steps, first tantrums — here's a realistic guide to toddler milestones and how tracking them helps you celebrate progress without the pressure.",
    category: "parenting",
    date: "2026-02-10",
    readTime: 6,
    author: "henrii team",
    body: `Your baby isn't a baby anymore. Somewhere between the midnight feedings and the diaper changes, they started pulling themselves up, pointing at things, and developing very strong opinions about bananas.

Welcome to toddlerhood. It's messy, loud, and full of milestones — some you'll celebrate with tears of joy, others you'll barely notice until someone asks about them at a checkup.

Here's a grounded guide to what's worth tracking, what's normal variation, and when to bring something up with your pediatrician.

## The milestones that matter most

Developmental milestones fall into four categories. Understanding them helps you know what to watch for without turning every playdate into an assessment.

### Motor milestones

These are the ones everyone notices — and the ones grandparents love to compare.

- **9–12 months:** Pulling to stand, cruising along furniture, possibly first steps
- **12–15 months:** Walking independently (the range here is huge — some babies walk at 9 months, others at 18, and both are normal)
- **15–18 months:** Climbing stairs with help, stacking 2-3 blocks, starting to use a spoon
- **18–24 months:** Running, kicking a ball, climbing on everything you wish they wouldn't

**What to track:** When they first achieve each motor milestone. A simple date and a note is enough. Photos and videos are a bonus.

### Language milestones

Language develops at wildly different rates, and it's one of the areas where parents worry most.

- **12 months:** 1-3 words ("mama," "dada," "no" — always no)
- **15 months:** 5-10 words, pointing to things they want
- **18 months:** 10-25 words, starting to combine gestures with words
- **24 months:** 50+ words, beginning to put two words together ("more milk," "daddy go")

**What to track:** New words as they appear. You don't need to log every utterance — just keep a running list. You'll be amazed how quickly it grows.

### Social and emotional milestones

These are subtler but equally important.

- **12 months:** Separation anxiety (completely normal), waving bye-bye, showing affection
- **15 months:** Imitating actions (sweeping, talking on phone), showing you things
- **18 months:** Pretend play begins, stronger preferences for certain people
- **24 months:** Parallel play with other children, beginning to show empathy, the emergence of "mine"

**What to track:** Behavioral firsts — first time they hugged another child, first pretend tea party, first full meltdown in a grocery store (it counts as a milestone, trust us).

### Cognitive milestones

These show how your toddler is learning to think and solve problems.

- **12 months:** Object permanence (they know the toy still exists when you hide it), cause and effect (dropping things on purpose)
- **15 months:** Following simple instructions, recognizing familiar objects in books
- **18 months:** Sorting shapes, scribbling with crayons, finding hidden objects
- **24 months:** Simple puzzles, matching colors, beginning to count objects

**What to track:** New skills and problem-solving moments. When they figure out how to open a childproof lock, that's cognitive development (and a sign you need better locks).

## What you can relax about

Here's the part most milestone guides skip: **the range of "normal" is enormous.**

A toddler who walks at 10 months isn't more advanced than one who walks at 16 months. A child with 50 words at 18 months isn't smarter than one with 15 words. Development isn't a race, and early achievement doesn't predict future ability.

Things that are almost always fine:

- **Late walking** (up to 18 months is within normal range)
- **Picky eating** (most toddlers go through phases of eating only three foods)
- **Regression during big changes** (new sibling, moving, starting daycare)
- **Preferring one parent** (it's a phase, and it switches)
- **Not sharing** (developmentally, toddlers aren't ready for true sharing until closer to 3)

## When to bring it up with your pediatrician

Tracking milestones isn't about catching problems — it's about having good information for conversations with your pediatrician. That said, there are some things worth mentioning:

- **No words by 16 months** or no two-word phrases by 24 months
- **Loss of skills** they previously had (this is different from temporary regression)
- **No pointing or gesturing** by 12 months
- **Not responding to their name** consistently by 12 months
- **No interest in other children** by 24 months

Early intervention, when needed, is most effective when it starts early. Your pediatrician would always rather hear about a concern that turns out to be nothing than miss something that could benefit from support.

## How henrii helps

henrii's milestone tracking is designed to be simple and pressure-free. Log milestones with a date and an optional note or photo. See them on a timeline. Share them with caregivers.

No percentile rankings. No comparison charts. No push notifications telling you your child "should" be doing something by now.

Just a quiet record of all the tiny moments that add up to watching your child grow.

Because that's what milestones really are — not checkboxes on a development chart, but moments worth remembering.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogPost["category"]): BlogPost[] {
  return blogPosts.filter((p) => p.category === category);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
