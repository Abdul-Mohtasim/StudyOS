// Notification wording for StudyOS reminders.
// Every notification in a plan gets a different message: pools are big, and makePicker() never
// hands out the same message twice while it is alive. "{n}" is replaced by the streak length.

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// pick(pool, seed, vars) -> [title, body]; deterministic for the same seed, unique per picker.
export function makePicker() {
  const used = new Set();
  return function pick(pool, seed, vars = {}) {
    const start = hash(String(seed)) % pool.length;
    let chosen = pool[start];
    for (let k = 0; k < pool.length; k += 1) {
      const candidate = pool[(start + k) % pool.length];
      if (!used.has(candidate.join("|"))) { chosen = candidate; break; }
    }
    used.add(chosen.join("|"));
    return chosen.map((t) => t.replace(/\{n\}/g, String(vars.n ?? "")));
  };
}

// ------------------------------------------------------------------ daily "time to study"
export const DAILY_POOL = [
  ["Time to study 📚", "A short focus session keeps your momentum going."],
  ["Your desk is calling 🪑", "Ten focused minutes now, guilt-free evening later."],
  ["Brain gym open 🧠", "Warm up with one quick session. No heavy lifting required."],
  ["Plot twist: you study today ✨", "Open StudyOS and write the next chapter of your streak."],
  ["Small steps, big grades 🪜", "One short session today is one less panic later."],
  ["Knock knock 🚪", "It's your future self. Please open StudyOS."],
  ["Study o'clock ⏰", "Not a long one. Just long enough to feel good about it."],
  ["Future you says thanks 💌", "Do a little revision today and collect the gratitude later."],
  ["Level up time 🎮", "Every session is XP. Go grab some."],
  ["Coffee + notes = ☕📖", "Pour a cup and give yourself a quick study sprint."],
  ["Tiny session, tiny effort 🐜", "Five minutes counts. Seriously, it does."],
  ["Your streak is watching 👀", "Give it something to be proud of today."],
  ["Revision, but make it quick ⚡", "A fast session beats a perfect plan you never start."],
  ["Hello from StudyOS 👋", "Ready when you are. Your next session is one tap away."],
  ["The best time to study is now 🕐", "The second best time is also now. Open the app."],
  ["Make today count 🎯", "Pick one topic and give it your full attention for a bit."],
  ["Don't ghost your notes 👻", "They've been waiting patiently. Say hi."],
  ["Quick check-in 📝", "How about a short session before the day runs away?"],
  ["Focus mode: on 🔕", "Silence the noise and dive into one topic."],
  ["Your goals sent a message 🏁", "They said: \"a little progress today, please.\""],
  ["Fresh brain, fresh start 🌱", "Start small, finish proud. StudyOS is ready."],
  ["Momentum loves company 🚀", "Study today and tomorrow gets easier."],
  ["One more page? 📄", "Just one. We both know it won't stop there."],
  ["Reminder from your better habits 🌟", "A short session keeps them alive."],
  ["Time for a mini power-up 🔋", "Charge your knowledge with a quick study round."],
  ["Remember why you started 💭", "Take a small step toward it right now."],
  ["Heads up, scholar 🎓", "Your study session is scheduled for roughly right now."],
  ["Let's get a little smarter 🤓", "A few minutes in StudyOS is all it takes."],
  ["Quiet hour, loud results 🔔", "Use this moment for a focused session."],
  ["Study break from not studying 😄", "Funny how that works. Open StudyOS."],
];

// ------------------------------------------------------------------ "streak about to break"
export const STREAK_POOL = [
  ["Your {n}-day streak is about to break 🔥", "One short session today keeps it alive."],
  ["{n} days strong, don't stop now 💪", "A few minutes today and the streak lives on."],
  ["Save your {n}-day streak 🛟", "It only takes one quick session."],
  ["Your {n}-day streak needs you 🥺", "Open StudyOS and give it a little love."],
  ["Streak alert 🚨 Day {n} is at risk", "A short session is all it takes to save it."],
  ["Don't let {n} days go to waste ⏳", "Study for just a few minutes and keep the chain going."],
  ["{n} days in a row... let's make it {n}+1 🔗", "One session and the number goes up."],
  ["The flame is flickering 🕯️", "{n} days of effort deserve one more short session."],
  ["Your streak called, it's worried 📞", "Reassure it with a quick study session."],
  ["Protect the {n}-day streak 🛡️", "Today's session is its only defence."],
  ["Almost lost your {n}-day streak 😬", "You still have time. Go save it."],
  ["Streak rescue mission 🪂", "Day {n} is in danger. A quick session saves the day."],
];

// ------------------------------------------------------------------ nag mode (gets cheekier through the day)
export const NAG_TIERS = [
  [ // friendly
    ["Psst… your study time is waiting 📚", "Got 5 minutes? That's all it takes."],
    ["Good afternoon, scholar ☀️", "A tiny session now will make your evening lighter."],
    ["Gentle nudge 🌼", "Whenever you're ready, StudyOS is too."],
    ["Hey you 👋", "Fancy a quick study session? No pressure, just possibility."],
    ["Small reminder, big potential 🌟", "Five minutes of study is a great start."],
    ["Your notes say hello 📒", "They'd love a visit."],
    ["Quick thought 💡", "What if you did one short session right now?"],
    ["A friendly tap on the shoulder 🫶", "Your study session is ready when you are."],
    ["Today's session is still unopened 📦", "Unwrap it. It's only a few minutes."],
    ["Start tiny 🐣", "One flashcard counts as a start. Open StudyOS."],
    ["No rush, but also… a little rush ⏱️", "A short session fits in anywhere."],
    ["Let's warm up 🔥", "Two minutes of review and you'll be in the groove."],
  ],
  [ // curious
    ["Quick study break? ☕", "One short session and you're done for today."],
    ["Still haven't studied today 🤔", "That's okay. A short session fixes it."],
    ["Did you forget about us? 🥲", "We're right here in StudyOS."],
    ["Break time idea 🍪", "Spend it on a tiny study session."],
    ["Your brain has free space 🧠", "Fill it with something useful. Just a little."],
    ["What are you up to? 👀", "Whatever it is, a 5-minute study session fits."],
    ["Pssst. Study. Quick. 🤫", "Nobody will know how easy it was."],
    ["Today's plan has a gap 🧩", "A short study session is the missing piece."],
    ["Between tasks? 📋", "Perfect moment for one quick session."],
    ["Your future grades just sneezed 🤧", "That means they're thinking about you. Study a bit."],
    ["Quick question ❓", "Can you spare five minutes for StudyOS?"],
    ["Check your to-do list ✅", "Study is still on it, and it's a short one."],
  ],
  [ // cheeky
    ["Your books miss you 👀", "Nobody's judging. Okay, maybe a little. Open StudyOS."],
    ["We're not mad, just disappointed 😌", "Fix it with a short session."],
    ["Your notes are getting lonely 🥀", "Go on, say hi."],
    ["Hello? Is this thing on? 🎤", "Your study session is still waiting. Politely. For now."],
    ["Still scrolling? 📱", "Swap two minutes of it for two minutes of StudyOS."],
    ["Your textbook just sighed 📖", "It's been a while. Open it. Or the app. Either works."],
    ["Fun fact: studying doesn't do itself 🤖", "We checked. You have to be there."],
    ["Your study session is giving up on you 🐌", "Prove it wrong with a quick round."],
    ["Excuse me, scholar? 🧐", "Your daily session has not been spotted yet."],
    ["The sofa will still be there later 🛋️", "Study first. Five minutes. Go."],
    ["Your flashcards are starting a support group 🃏", "Please attend. It's very short."],
    ["Another reminder? Yes. 😇", "We have a lot of them and a lot of love."],
  ],
  [ // dramatic
    ["These reminders don't seem to be working… 😢", "Prove us wrong. Start a tiny session."],
    ["We've been ignored again 🥺", "A short session would fix our feelings."],
    ["This is awkward 😅", "We keep reminding you and you keep not studying."],
    ["Breaking news 📰", "Local student still hasn't studied. Details at StudyOS."],
    ["Are we being left on read? 💬", "One short session would be a nice reply."],
    ["Dramatic pause… 🎭", "…and then you open StudyOS. Perfect ending."],
    ["Your study streak of 0 minutes today 📉", "There's still time to change that number."],
    ["We're running out of clever messages 😭", "Please study so we can stop."],
    ["This notification is crying a little 💧", "A quick session will dry its tears."],
    ["The suspense is unbearable 🎬", "Will you study today? The answer is up to you."],
    ["Please. We're begging. 🙏", "Five minutes. That's all."],
    ["Alert: procrastination detected 🚓", "Escape by opening StudyOS."],
  ],
  [ // late
    ["It's getting late ⏳", "One short session now beats a broken streak tomorrow."],
    ["The day is almost over 🌇", "A quick session now still counts."],
    ["Evening check-in 🌙", "You can still fit one short study round in."],
    ["Clock's ticking ⌛", "Five minutes now saves a lot of stress tomorrow."],
    ["Still time, barely 🕰️", "Open StudyOS and finish today properly."],
    ["Almost bedtime for today 🛌", "End it with a short session you'll be proud of."],
    ["Don't let today end empty 🫙", "Put a small study session in it."],
    ["Sunset study session? 🌆", "It's short, we promise."],
    ["Last stretch of the day 🏃", "Sprint through one quick session."],
    ["Tomorrow-you is watching 🔭", "Do them a favour and study a little now."],
    ["Today isn't over yet 🌠", "A short session still makes it a good one."],
    ["One final push 🧗", "A tiny session now makes tonight feel better."],
  ],
];

export const NAG_STREAK_POOL = [
  ["Don't let your {n}-day streak die 🔥", "One short session keeps it alive."],
  ["Your {n}-day streak is on the line 🎲", "Study for a few minutes and keep your record."],
  ["{n} days of work at risk ⚠️", "Protect them with one quick session."],
  ["Streak in danger, day {n} 🚑", "A short study round is the cure."],
  ["Think of all those {n} days 🏔️", "Don't stop climbing. One short session now."],
  ["Your {n}-day streak just gulped 😰", "Calm it down with a quick session."],
  ["Hold the line, {n} days strong 🧱", "One more session and you hold it."],
  ["Streak check: {n} days and counting 📈", "Keep counting. Open StudyOS."],
  ["Imagine losing {n} days of progress 😱", "Now imagine saving it in five minutes. Do that."],
  ["The {n}-day streak would like a word 🗣️", "The word is \"study\"."],
];

export const NAG_FINAL_POOL = [
  ["Last call! Your {n}-day streak ends tonight 🚨", "Open StudyOS and study for just 5 minutes."],
  ["Final warning for your {n}-day streak 🔔", "Five minutes now keeps it alive past midnight."],
  ["Tonight decides your {n}-day streak 🌗", "One short session and it survives."],
  ["Streak rescue, final boarding call 🛫", "Your {n}-day streak leaves at midnight. Be on it."],
  ["Midnight is coming for your {n} days 🕛", "Beat it with a quick study session."],
  ["Last chance to save {n} days 🧯", "It's one short session. You've got this."],
];

export const NAG_FINAL_NO_STREAK_POOL = [
  ["Last call for today 🚨", "Open StudyOS and study for just 5 minutes."],
  ["Final nudge of the day 🔔", "One short session and today is a win."],
  ["Today closes soon 🌗", "Squeeze in one quick session before it does."],
  ["Last boarding call 🛫", "A five-minute session is still on the schedule."],
  ["Final reminder, we promise 🤞", "One tiny session and we'll leave you alone until tomorrow."],
  ["Wrap up the day well 🎁", "A short study round is the perfect finishing touch."],
];

// ------------------------------------------------------------------ your own reminders (body line under your text)
// openers x closers = 168 different lines, so 8 reminders x 14 days never repeat.
const CUSTOM_OPENERS = [
  "Your reminder is here.", "This one's yours.", "Heads up!", "Right on time.",
  "Ding ding!", "Just as planned.", "You asked, we delivered.", "Here's your nudge.",
  "Time check.", "It's that moment.", "Plan meets reality.", "Gentle tap.",
  "Your schedule says now.", "Reminder delivered.",
];
const CUSTOM_CLOSERS = [
  "Tap to open StudyOS.", "StudyOS is one tap away.", "Let's make it count.",
  "Go get it done.", "Future you will approve.", "Small step, big win.",
  "Two minutes is enough to start.", "You've got this.", "Open the app and begin.",
  "No time like the present.", "Do it now, relax later.", "Let's roll.",
];

export function customBody(seedIndex) {
  const i = Math.abs(seedIndex);
  const opener = CUSTOM_OPENERS[i % CUSTOM_OPENERS.length];
  const closer = CUSTOM_CLOSERS[Math.floor(i / CUSTOM_OPENERS.length) % CUSTOM_CLOSERS.length];
  return `${opener} ${closer}`;
}
export const CUSTOM_BODY_VARIANTS = CUSTOM_OPENERS.length * CUSTOM_CLOSERS.length;

// ------------------------------------------------------------------ test button
export const TEST_POOL = [
  ["StudyOS reminders are on ✅", "This is how your study reminders will look and sound."],
  ["Test passed 🎉", "If you can hear the chime, reminders are working."],
  ["Loud and clear 🔊", "Your StudyOS reminders will arrive just like this."],
  ["Hello from StudyOS 👋", "Reminder check complete. Everything looks good."],
  ["Reminders: online ✨", "Your next study nudge will sound like this."],
];
