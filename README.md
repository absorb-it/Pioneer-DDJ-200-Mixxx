# Pioneer-DDJ-200-Mixxx

This is a new impĺementation of the Pioneer DJ-200 controller script for [mixxx](https://github.com/mixxxdj/mixxx). At first I tried to fix some issue with the implemented controller script, but this brought me to completely rewrite the script.

### Features

Beside all standard features some special things have been taken over from the already existing DDJ-200 script or added:

- 4 Deck control possible

- Select and load tracks from within the controller

- use pad buttons for
  
  - hotcues (ok, standard)
  
  - loops
  
  - effects and samples
  
  - beatjump

### Controller Usage and Indications

To add all these extra functionality, it was required to mis-use some of the existing controls and indicators

#### 4 Deck control

| Key              | Effect                                                          | Feedback                                       |
| ---------------- | --------------------------------------------------------------- | ---------------------------------------------- |
| Shift + Master   | switch between 2Deck and 4Deck mode                             | check Computer Interface                       |
| Shift + Beatsync | 2Deck mode: Change RPM Range<br/>4Deck mode: Change active Deck | 4Deck mode: Blinking on alternate Deck control |

#### Select / Load Tracks

| Key                                           | Effect                                 | Feedback                 |
| --------------------------------------------- | -------------------------------------- | ------------------------ |
| Left Shift + Rotate any Jogwheel              | Scroll trough library                  | check Computer Interface |
| Shift + Left/Right Headphone Cue Button (PFL) | Load Selceted Track to Left/Right Deck | check Computer Interface |

#### Pad Button Options

| Key                                               | Effect                        | Feedback                            |
| ------------------------------------------------- | ----------------------------- | ----------------------------------- |
| Transition FX                                     | Select next Pad-Mode:         |                                     |
|                                                   | Hotcue Mode                   | Transition FX off                   |
|                                                   | Loop Mode                     | Transition FX on                    |
|                                                   | Effect Mode                   | Transition FX blinking              |
| Shift + Transition FX                             | Beatjump                      | All Pads and Transition FX blinking |
| Pad in Hotcue Mode                                | Set or Preview/Play Hotcue    | PAD is on when Hotcue set           |
| Shift + Pad in Hotcue Mode                        | Clear Hotcue                  | PAD is off                          |
| PAD 1 to 8 in Loop Mode                           | Set or Leave Beatloop         | PAD is on when Loop is active       |
| Shift + PAD 1 to 8 in Loop Mode                   | Set or Leave Beatlooproll     | PAD is on when Loop is active       |
| (Shift +) PAD 1 to 4 of Left Deck in Effect Mode  | Play/Stop Sampler 1 to 4      | PAD is on when Sampler is playing   |
| (Shift +) PAD 1 to 4 of Right Deck in Effect Mode | Play/Stop Sampler 5 to 8      | PAD is on when Sampler is playing   |
| (Shift +) PAD 5 to 7 of Left Deck in Effect Mode  | Activate Effect 1 to 3 of FX1 | PAD is on when Effect is active     |
| (Shift +) PAD 5 to 7 of Right Deck in Effect Mode | Activate Effect 1 to 3 of FX2 | PAD is on when Effect is active     |
| (Shift +) PAD 8 in Effect Mode                    | bpm tap- Button               |                                     |
