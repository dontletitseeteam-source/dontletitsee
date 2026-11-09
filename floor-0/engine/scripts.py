"""FLOOR 0 series scripts: (spoken line, gap before it in the edit, caption chunks [(n_words, display)]).
Markup: [x] lime keyword, {x} red threat word."""

# (spoken text, gap before line in the edit, caption chunks [(n_words, display)])
# display markup: [x] = lime keyword, {x} = red threat word
P1 = [
    ("The elevator in your building just stopped... at floor zero.", 0.30,
     [(2, "THE ELEVATOR"), (3, "IN YOUR BUILDING"), (2, "JUST STOPPED..."), (3, "AT FLOOR [0]")]),
    ("There is no floor zero.", 0.45, [(3, "THERE IS NO"), (2, "FLOOR [0]")]),
    ("The doors open anyway.", 0.35, [(3, "THE DOORS OPEN"), (1, "ANYWAY.")]),
    ("It's pitch black inside.", 0.40, [(3, "IT'S PITCH BLACK"), (1, "INSIDE.")]),
    ("Then your phone buzzes.", 0.40, [(3, "THEN YOUR PHONE"), (1, "[BUZZES.]")]),
    ("Unknown number.", 0.20, [(2, "UNKNOWN NUMBER")]),
    ("Don't look inside.", 0.25, [(3, "[DON'T LOOK INSIDE.]")]),
    ("Too late. You already looked.", 0.35, [(2, "{TOO LATE.}"), (3, "YOU ALREADY LOOKED.")]),
    ("Someone is standing in the corner. Facing the wall.", 0.30,
     [(3, "SOMEONE IS STANDING"), (3, "IN THE CORNER."), (3, "FACING THE WALL.")]),
    ("Not moving.", 0.25, [(2, "NOT MOVING.")]),
    ("Then something lights up... in its hand.", 0.35,
     [(2, "THEN SOMETHING"), (2, "[LIGHTS UP...]"), (3, "IN ITS HAND.")]),
    ("A phone screen.", 0.15, [(3, "A PHONE SCREEN.")]),
    ("And on yours... it's typing.", 0.30, [(3, "AND ON YOURS..."), (2, "[IT'S TYPING.]")]),
    ("Smile.", 0.80, [(1, "{SMILE.}")]),
    ("The doors slam shut.", 1.35, [(2, "THE DOORS"), (2, "{SLAM SHUT.}")]),
    ("The numbers start climbing.", 0.25, [(2, "THE NUMBERS"), (2, "START CLIMBING.")]),
    ("All the way to eight.", 0.10, [(3, "ALL THE WAY"), (2, "TO [8].")]),
    ("Your floor.", 0.15, [(2, "{YOUR FLOOR.}")]),
    ("One last notification.", 0.50, [(3, "ONE LAST NOTIFICATION.")]),
    ("Front door... unlocked. With Face ID.", 0.20,
     [(2, "FRONT DOOR..."), (1, "{UNLOCKED.}"), (3, "WITH [FACE ID.]")]),
    ("It has your face now.", 0.35, [(3, "IT HAS YOUR"), (2, "{FACE} NOW.")]),
    ("But you're still down here.", 0.45, [(3, "BUT YOU'RE STILL"), (2, "DOWN HERE.")]),
    ("Behind you... the elevator is back.", 1.00, [(2, "BEHIND YOU..."), (4, "THE ELEVATOR IS BACK.")]),
    ("Floor zero.", 0.25, [(2, "FLOOR [0].")]),
    ("And this time... it's empty.", 0.30, [(3, "AND THIS TIME..."), (2, "{IT'S EMPTY.}")]),
    ("What do you do?", 0.45, []),
]
P1_HOLD = 3.4  # choice card hold after the last line

P2 = [
    ("Last night... floor zero took your face.", 0.30, [(2, "LAST NIGHT..."), (2, "FLOOR [0]"), (3, "{TOOK YOUR FACE.}")]),
    ("So you don't get in. You take the stairs.", 0.45, [(3, "SO YOU DON'T"), (2, "GET IN."), (4, "YOU TAKE THE [STAIRS.]")]),
    ("Eight floors. In the dark.", 0.35, [(2, "[8] FLOORS."), (3, "IN THE DARK.")]),
    ("Your hallway. Your door.", 0.40, [(2, "YOUR HALLWAY."), (2, "YOUR DOOR.")]),
    ("It's open. Just a crack.", 0.35, [(2, "{IT'S OPEN.}"), (3, "JUST A CRACK.")]),
    ("The TV is on.", 0.30, [(4, "THE TV IS ON.")]),
    ("Someone is sitting on your couch.", 0.35, [(3, "SOMEONE IS SITTING"), (3, "ON YOUR COUCH.")]),
    ("In your spot.", 0.20, [(3, "IN [YOUR SPOT.]")]),
    ("Then your phone buzzes.", 0.40, [(3, "THEN YOUR PHONE"), (1, "[BUZZES.]")]),
    ("It's from your own number.", 0.20, [(2, "IT'S FROM"), (3, "[YOUR OWN NUMBER.]")]),
    ("Go back downstairs.", 0.30, [(3, "{GO BACK DOWNSTAIRS.}")]),
    ("You push the door open.", 0.40, [(3, "YOU PUSH THE"), (2, "DOOR OPEN.")]),
    ("It turns around.", 0.30, [(3, "IT TURNS AROUND.")]),
    ("It's you.", 0.50, [(2, "[IT'S YOU.]")]),
    ("But you've never smiled like that.", 0.40, [(3, "BUT YOU'VE NEVER"), (3, "{SMILED LIKE THAT.}")]),
    ("The door slams shut.", 0.85, [(2, "THE DOOR"), (2, "{SLAMS SHUT.}")]),
    ("Smart lock... unrecognized face.", 0.35, [(2, "SMART LOCK..."), (2, "{UNRECOGNIZED FACE.}")]),
    ("You don't live here anymore.", 0.30, [(3, "YOU DON'T LIVE"), (2, "HERE ANYMORE.")]),
    ("Down the hall... the elevator opens.", 0.70, [(3, "DOWN THE HALL..."), (3, "THE ELEVATOR OPENS.")]),
    ("Lit. Empty. Waiting.", 0.30, [(1, "LIT."), (1, "EMPTY."), (1, "{WAITING.}")]),
    ("The display says zero.", 0.35, [(3, "THE DISPLAY SAYS"), (1, "[0].")]),
    ("You're on floor eight.", 0.20, [(4, "YOU'RE ON FLOOR [8].")]),
    ("Rule number two. Once it has your face... floor zero is home.", 0.60, []),
]
P2_HOLD = 2.6

P3 = [
    ("You get in. There's only one button.", 0.30, [(3, "YOU GET IN."), (4, "THERE'S ONLY ONE BUTTON.")]),
    ("Zero.", 0.30, [(1, "[0].")]),
    ("The doors close. You go down...", 0.40, [(3, "THE DOORS CLOSE."), (3, "YOU GO DOWN...")]),
    ("and down...", 0.25, [(2, "AND DOWN...")]),
    ("and down.", 0.25, [(2, "AND {DOWN.}")]),
    ("Ding. Floor zero.", 0.70, [(1, "DING."), (2, "FLOOR [0].")]),
    ("It's your lobby. But backwards.", 0.40, [(3, "IT'S YOUR LOBBY."), (2, "BUT [BACKWARDS.]")]),
    ("And it's full.", 0.40, [(3, "AND IT'S {FULL.}")]),
    ("Dozens of them. In every corner. Facing the walls.", 0.30, [(3, "DOZENS OF THEM."), (3, "IN EVERY CORNER."), (3, "FACING THE WALLS.")]),
    ("Too tall. Like the one from the elevator.", 0.35, [(2, "{TOO TALL.}"), (3, "LIKE THE ONE"), (3, "FROM THE ELEVATOR.")]),
    ("The longer you stay down here... the taller you get.", 0.40, [(3, "THE LONGER YOU"), (3, "STAY DOWN HERE..."), (4, "{THE TALLER YOU GET.}")]),
    ("Your phone buzzes.", 0.70, [(2, "YOUR PHONE"), (1, "[BUZZES.]")]),
    ("A message is typing itself.", 0.30, [(3, "A MESSAGE IS"), (2, "[TYPING ITSELF.]")]),
    ("To a number you don't know.", 0.30, [(3, "TO A NUMBER"), (3, "YOU DON'T KNOW.")]),
    ("Don't look inside.", 0.30, [(3, "[DON'T LOOK INSIDE.]")]),
    ("You didn't write that.", 0.40, [(4, "{YOU DIDN'T WRITE THAT.}")]),
    ("The elevator rises. You're facing the wall now.", 0.50, [(3, "THE ELEVATOR RISES."), (5, "YOU'RE FACING THE WALL NOW.")]),
    ("You can't turn around.", 0.30, [(4, "YOU CAN'T TURN AROUND.")]),
    ("Ding. Lobby.", 0.70, [(1, "DING."), (1, "LOBBY.")]),
    ("Behind you, the doors open.", 0.30, [(2, "BEHIND YOU,"), (3, "THE DOORS OPEN.")]),
    ("Someone is looking in.", 0.30, [(4, "{SOMEONE IS LOOKING IN.}")]),
    ("Your phone types one last word.", 0.40, [(3, "YOUR PHONE TYPES"), (3, "ONE LAST WORD.")]),
    ("Smile.", 0.70, [(1, "{SMILE.}")]),
    ("Rule number three. Floor zero is never empty for long.", 1.45, []),
]
P3_HOLD = 3.4

LINES = {1: P1, 2: P2, 3: P3}
HOLD = {1: P1_HOLD, 2: P2_HOLD, 3: P3_HOLD}
