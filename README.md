Code supporting a sort of plant-themed gamification project.

Initial variant's for FR, but the hope is that I can do more with it--things like self-care bingo, personal achievements, whatever.

Mostly a study and learning project. Note that I haven't done my usual linting yet, hopefully I'll remember to remove this line once I have.



Quick gist of things is that the project consists of a large number of plant bases drawn with 3 "magic" palettes that are swapped out for other palettes, meaning that each base can yield hundreds of color variants. Additionally has a component replacement system for randomized flowers and the like. Basically, lets me generate an obnoxiously large number of plants and plant-adjacent things.

Then there's a bunch of things to do with said plant. The garden generator is arguably the centerpiece one, but you can also "breed" plants (as each is described by a base64 seed) and...well, that's about it for now, but there's some nice utils for working with the seeds and generating new ones and all that.

Seeds are "earned" from a core string-to-plant generator or a randomized bingo board.


You could tune this to any purpose by changing the bingo board goals and the label above the generator. 



That said, I'm opening it to a community that I hope will contribute art, so it'll be ARR to start. After it's all tested out, I'll scrub the ARR content (leaving presumably just sprites I myself drew) and release under MIT or something. Probably!


Sorry, end-of-project documentation brain is hitting. I'll be back to gussy this up later (hopefully).
