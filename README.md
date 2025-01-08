# "Pioneer DDJ-200 Alternative" controller implementation for Mixxx

This is a new impĺementation of the Pioneer DJ-200 controller script for [mixxx](https://github.com/mixxxdj/mixxx). At first I tried to fix some issue with the hotcue pads on the implemented controller script, but deeper I jumped into the code the more I liked to get some cleaner and more advanced funtionality. Especially the usage of [Components-JS](https://github.com/mixxxdj/mixxx/wiki/Components-JS) made everything much cleaner. Maybe, after a while of testing and some feedback I will ask to get his included in core mixxx code.

## based on "Pioneer DDJ-200" controller implementation from

 * Daniel Giddins <daniel.giddins at nottingham.ac.uk>
 * Frank Breitling <frank.breitling at gmx.de>

## Features

Beside all standard features some special things have been taken over from the already existing DDJ-200 script or added:

- 4 Deck control possible
- Select and load tracks from within the controller
- use pad buttons for
  - hotcues (ok, standard)
  - loops
  - effects and samples
  - beatjump

## Usage

Just copy the *xml and *js files into the controller diretory under your mixxx profile. Select "Pioneer DDJ-200 (Alternative)" as your controller and give it a try.

## Pioneer DDJ-200 Alternative

### Controller Mapping

#### Deck section

[<img src="img/pioneer_ddj_200_decks.svg" width="200">](img/pioneer_ddj_200_decks.svg)

| No. | Control | Function |
| ---- | ---- | ---- |
| 1 | Jog Wheel (top)                               | Scratch (move play position) |
| 1 | Jog Wheel (outer)                             | Pitch bend (nudge) |
| 1 | <code>SHIFT_(right)</code> + Jog Wheel (top)  | Seek (move play position) without audio output |
| 1 | <code>SHIFT (left)</code> + Jog Wheel (outer) | Move track selection in library |
| 2 | <code>SHIFT</code> | Switch function of controls (see above for only difference between left and right <code>SHIFT</code> |
| 3 | <code>PAD</code>, <code>SHIFT</code><code>PAD</code> 1 - 8 | see PAD modes section |
| 4 | <code>CUE</code> | When playing, returns to the cue point and pauses. If stopped, sets a cue point at the current location. If stopped and at a cue point, plays from that point until released |
| 4 | <code>SHIFT</code><code>CUE</code> | Return to cue point and stop |
| 5 | <code>PLAY/PAUSE</code> | Play / pause |
| 5 | <code>SHIFT</code><code>PLAY/PAUSE</code> | Reverse playing |
| 6 | <code>BEAT SYNC</code> | Match tempo and phase of other deck, long press to enable master sync |
| 6 | <code>SHIFT</code><code>BEAT SYNC</code> | 2Deck mode: Change RPM Range of <code>TEMPO</code> slider<br/>4Deck mode: Change active Deck (<code>BEAT SYNC</code> will blink on alternate deck control) |
| 7 | <code>TEMPO</code> slider                     | Adjust track playing speed (can be adjusted via <code>SHIFT</code> + <code>BEAT SYNC</code>) |

#### PAD modes

change between differerent PAD modes with <code>Transition FX</code>

| Mode | Indication |
| ---- | ---- |
| Hotcue | <code>Transition FX</code> off |
| Loop | <code>Transition FX</code> on |
| Effect | <code>Transition FX</code> blinking |
| Jump | <code>Transition FX</code> and all <code>PAD</code>s blinking |
 
| Mode | Control | Function |
| ---- | ---- | ---- |
| Hotcue | <code>PAD</code> 1 - 8 | Set (if empty) or Preview/Play (if set) hot cue point / loop 1 - 8 |
| Hotcue | <code>SHIFT</code><code>PAD</code> 1 - 8 | Clear hot cue 1 - 8 |
| Loop | <code>PAD</code> 1 - 8 | Set and enables or stops loop over beats (increasing size PADs 1-8) |
| Loop | <code>SHIFT</code><code>PAD</code> 1 - 8 | Set and enables or stops looproll over beats (increasing size PADs 1-8) |
| Effect | <code>PAD</code>, <code>SHIFT</code><code>PAD</code> 1 - 4 | Play/Stop Sampler 1 - 4 |
| Effect | <code>PAD</code>, <code>SHIFT</code><code>PAD</code> 5 - 7 | Activate FX1/FX2 Effect 1 - 3 |
| Effect | <code>PAD</code>, <code>SHIFT</code><code>PAD</code> 8 | BPM Tap- Button |
| Jump | <code>PAD</code> 1 - 8 | Jump forward over beats (increasing size PADs 1-8) |
| Jump | <code>SHIFT</code><code>PAD</code> 1 - 8 | Jump back over beats (increasing size PADs 1-8) |

#### Mixer section (p. 10)

[<img src="img/pioneer_ddj_200_mixer.svg" width="200">](img/pioneer_ddj_200_mixer.svg)

| No. | Control | Function |
| ------------------------------------------------- | ----------------------------- | ------ |
| 1 | <code>MASTER</code> | Toggle main mix in the headphone output on/off
| 1 | <code>SHIFT</code><code>MASTER</code> | Toggle between 2- and 4-deck mode
| 2 | <code>HI</code>/<code>MID</code>/<code>LOW</code> knobs | Adjust high/mid/low-frequencies
| 3 | <code>CFX</code> knobs                                   | EffectChain superknob
| 4 | <code>SHIFT</code><code>HEADPHONE CUE 1</code>, <code>HEADPHONE CUE 1</code> | Toggle headphone pre-fader listening of left deck.
| 4 | <code>SHIFT</code><code>HEADPHONE CUE 2</code>, <code>HEADPHONE CUE 2</code> | Toggle headphone pre-fader listening of right deck.
| 5 | Channel faders                                         | Adjust the output level for each channel
| 6 | <code>Transition FX</code> Button | Change <code>PAD</code> modes (Hotcue - Loop - Effect) / Return from Jump mode
| 6 | <code>SHIFT</code><code>Transition FX</code> Button | Toggle beatjump <code>PAD</code> mode
| 7 | crossfader | Fade between left and right Deck |
