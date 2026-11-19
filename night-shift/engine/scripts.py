"""NIGHT SHIFT scripts: (spoken line, gap before it in the edit, caption chunks [(n_words, display)]).
Markup: [x] lime keyword, {x} red threat word."""

# Episode 1 — The all-night pharmacy (the customer with a toe tag)
P1 = [
    ("Two in the morning. A barefoot man waits at your counter.", 0.15,
     [(4, "[2 AM.]"), (3, "A {BAREFOOT} MAN"), (4, "WAITS AT YOUR COUNTER.")]),
    ("A paper tag is tied to his big toe.", 0.30, [(3, "A PAPER {TAG}"), (3, "IS TIED TO"), (3, "HIS {BIG TOE.}")]),
    ("Your first night shift. The last pharmacist left you three rules.", 0.40,
     [(4, "YOUR FIRST [NIGHT SHIFT.]"), (3, "THE LAST PHARMACIST"), (4, "LEFT YOU [3 RULES.]")]),
    ("One. Fill every prescription, even the paper ones.", 0.35,
     [(1, "ONE."), (3, "FILL EVERY PRESCRIPTION,"), (4, "EVEN THE [PAPER ONES.]")]),
    ("Two. If he's in today's obituaries, he waits outside.", 0.35,
     [(1, "TWO."), (2, "IF HE'S"), (3, "IN TODAY'S {OBITUARIES,}"), (3, "HE WAITS [OUTSIDE.]")]),
    ("Three. Never ask why he's cold.", 0.35, [(1, "THREE."), (2, "{NEVER ASK}"), (3, "WHY HE'S [COLD.]")]),
    ("Under them: I left early. Sorry.", 0.35, [(2, "UNDER THEM:"), (3, "[I LEFT EARLY.]"), (1, "SORRY.")]),
    ("He slides a slip across. It's wet. And freezing.", 0.45,
     [(4, "HE SLIDES A [SLIP]"), (1, "ACROSS."), (2, "IT'S WET."), (2, "AND {FREEZING.}")]),
    ("Name: Thomas Hale.", 0.30, [(1, "NAME:"), (2, "[THOMAS HALE.]")]),
    ("Today's paper. Thomas Hale. Died this morning.", 0.35,
     [(2, "TODAY'S PAPER."), (2, "[THOMAS HALE.]"), (3, "{DIED THIS MORNING.}")]),
    ("Rule two. You ask him to wait outside.", 0.45, [(2, "[RULE 2.]"), (3, "YOU ASK HIM"), (3, "TO WAIT {OUTSIDE.}")]),
    ("He doesn't move. Frost spreads under his fingers.", 0.40,
     [(3, "HE {DOESN'T MOVE.}"), (2, "[FROST] SPREADS"), (3, "UNDER HIS FINGERS.")]),
    ("You fill it fast. Your hands are shaking.", 0.35, [(4, "YOU FILL IT [FAST.]"), (4, "YOUR HANDS ARE {SHAKING.}")]),
    ("Then you hear yourself ask: why are you so cold?", 0.45,
     [(4, "THEN YOU HEAR YOURSELF"), (1, "ASK:"), (5, "{WHY ARE YOU SO COLD?}")]),
    ("He leans in. They keep us cold. Downstairs.", 0.55, [(3, "HE LEANS IN."), (4, "[THEY KEEP US COLD.]"), (1, "{DOWNSTAIRS.}")]),
    ("The lights die. Then he's gone.", 0.55, [(3, "THE LIGHTS {DIE.}"), (3, "THEN HE'S [GONE.]")]),
    ("His slip was signed by the pharmacist who left early.", 0.50,
     [(4, "HIS SLIP WAS SIGNED"), (3, "BY THE {PHARMACIST}"), (3, "WHO [LEFT EARLY.]")]),
    ("In the tray, tomorrow's slips are waiting.", 0.45, [(3, "IN THE TRAY,"), (2, "[TOMORROW'S] SLIPS"), (2, "ARE WAITING.")]),
    ("The top one has your name.", 0.40, [(3, "THE TOP ONE"), (3, "HAS {YOUR NAME.}")]),
    ("Which rule would you break? A, two. B, three.", 0.60, []),
    ("Comment A or B.", 0.30, []),
]
P1_HOLD = 2.2

LINES = {1: P1}
HOLD = {1: P1_HOLD}
