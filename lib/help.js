// ---------------------------------------------------------------------------
// "Where do I…?" — the everyday jobs and where each one lives.
//
// User test v4: "A demo first but with pointers where to find what to find."
// The Help panel lists these, and the search box in the top bar finds them by
// any of their words, so "paid", "signature" or "sick" leads somewhere.
//
// Each job: { id, question, steps: [plain sentences], href, cta, words }.
// `words` are extra search terms people might type.
// ---------------------------------------------------------------------------

export const HELP_JOBS = [
  {
    id: 'couple-change',
    question: 'A couple asked to change something',
    steps: [
      'Click Updates (the bell, top right). Requests that need your answer are at the top.',
      'Click Review request. It opens the event’s Detail sheet at the request.',
      'Accept puts it on the run of show and sends it to the staff working the event. Decline asks you for a short reply to the couple.'
    ],
    href: '/dashboard#from-couples',
    cta: 'See updates from couples',
    words: 'request change time move approve accept decline couple portal alert'
  },
  {
    id: 'staff-seen',
    question: 'See which staff haven’t seen a change',
    steps: [
      'Open the event (Events in the menu), then the Detail sheet tab.',
      'Under Changes, each change says “Seen by 1 of 3 · Not yet: …” with a Remind button.'
    ],
    href: '/events',
    cta: 'Open Events',
    words: 'seen staff change who knows remind detail sheet text'
  },
  {
    id: 'signed-paid',
    question: 'Check whether a couple has signed or paid',
    steps: [
      'Open the event. The “Where the couple stands” card at the top says what is signed, what is paid and what is still owed.',
      'Anything late is marked Overdue. The bell also tells you the moment they sign or pay.'
    ],
    href: '/events',
    cta: 'Open Events',
    words: 'signed signature agreement contract paid payment balance deposit overdue owe'
  },
  {
    id: 'hand-off',
    question: 'Hand a to-do to someone else',
    steps: [
      'Open Tasks and find the to-do. Search or pick a person under “Show to-dos for”.',
      'Change “Assigned to” on the to-do. It moves to their list straight away.',
      'Someone out sick? In Who’s doing what, click Hand off on their row to move all their to-dos at once.'
    ],
    href: '/tasks',
    cta: 'Open Tasks',
    words: 'assign reassign hand off give delegate sick cover away owner responsible'
  },
  {
    id: 'who-has-what',
    question: 'See how many to-dos someone has',
    steps: ['Open Who’s doing what in the menu. Each person shows what they have open this week and in total.', 'Click a person to see their to-dos.'],
    href: '/tasks/team',
    cta: 'Open Who’s doing what',
    words: 'team who has what workload count open this week person staff to-dos'
  },
  {
    id: 'add-todo',
    question: 'Add a to-do',
    steps: ['Open Tasks and click New task.', 'Give it a name, a due date and an event, and choose who it’s for.'],
    href: '/tasks',
    cta: 'Open Tasks',
    words: 'new task todo to-do create add reminder'
  },
  {
    id: 'fill-spot',
    question: 'Fill an open staff spot',
    steps: ['Open the Staffing Planner, choose the event, and click Ask people on the open spot.'],
    href: '/staffing',
    cta: 'Open the Staffing Planner',
    words: 'staff spot shift schedule ask text fill open'
  },
  {
    id: 'day-times',
    question: 'Change a time on the day',
    steps: ['Open the event, then the Detail sheet tab, and click Edit times under Run of show.', 'The change is sent to the staff working the event.'],
    href: '/events',
    cta: 'Open Events',
    words: 'run of show time schedule timeline cake toast'
  },
  {
    id: 'reply',
    question: 'Reply to a couple or vendor',
    steps: ['Open Messages. Conversations waiting for a reply are at the top.'],
    href: '/messages',
    cta: 'Open Messages',
    words: 'message reply email text answer'
  }
]
