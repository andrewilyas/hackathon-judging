# The HackMIT Judging System (Node implementation)
## Motivation and Idea: Designing a better judging system
The HackMIT judging system is meant to fix the pervasive problem of inaccurate judging at hackathons. Since humans are by nature bad at ranking objects but excellent at comparing them, this judging system is based on a sequence of pairwise decisions that judges make---the application gives judges a project to go to, and at each step, the judge only has to answer "Was this project better, or the last one?" The app then uses recent research in crowdsource ranking from pairwise data (called CrowdBT) to construct an overall project ranking. For more information, I highly recommend you check out [this post](https://medium.com/hackmit-stories/designing-a-better-judging-system-bfb1af7cede8) and [this post](https://medium.com/hackmit-stories/implementing-a-scalable-judging-system-bd193214c304#.a8vi0fqh0) (written by Anish Athalye, creator of the initial implementation).

## This implementation
The first implementation of the algorithm was functional, but was written in Flask and used a PostgreSQL database, so many other hackathon organizers found it hard to alter or tweak. This is a near-identical implementation of the Flask one, but written in NodeJS + MongoDB, a much more common set of tools. We're hoping that this will make judging more accessible to other hackathons, increasing the usage (and contributions! See below for details).

## Installation/Setting up
- Make sure you have NodeJS, MongoDB, and LESS installed
- Run mongod (start a MongoDB server)
- Then:
    npm install, then
    node server.js
- You should be good to go!

## Contributions
More than welcomed! the code as a whole, and the LESS stylesheets, in particular, could use a lot of cleaning up, so please feel free to contribute.
