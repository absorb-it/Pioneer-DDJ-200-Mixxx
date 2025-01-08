/*

DDJ-200 Midi Overview
Deck n = 0/1:                                   Midi in         Midi out
                                                (to PC)         (from PC)
    Jog (Platter)   rotate      Vinyl mode on   Bn  22      hh      -           result = value - 64
                                Vinyl mode off  Bn  23      hh      -           result = value - 64
 seek                                shift           Bn  29      hh      -           result = value - 64
    Jog (Platter)   touch                       9n  36      hh      -           OFF=0x00, ON=0x7F
                                shift           9n  67      hh      -           OFF=0x00, ON=0x7F
    Jog (Side)      rotate      normal/shift    Bn  21      hh      -           result = value - 64
    Beat Sync       press                       9n  58      hh  [midi in]       OFF=0x00, ON=0x7F
                    long press                  9n  5C      hh      -           OFF=0x00, ON=0x7F
                    press       shift           9n  60      hh  [midi in]       OFF=0x00, ON=0x7F
    Tempo           slide       normal/shift    Bn  00/20   xx      -           MSB / LSB
    Play/Pause      press                       9n  0B  hh      [midi in]       OFF=0x00, ON=0x7F
                    press       shift           9n  47  hh      [midi in]       OFF=0x00, ON=0x7F
    Cue             press                       9n  0C  hh      [midi in]       OFF=0x00, ON=0x7F
                    press       shift           9n  48  hh      [midi in]       OFF=0x00, ON=0x7F
    Shift           press                       9n  3F  hh          -           OFF=0x00, ON=0x7F
    EQ Hi           rotate                      Bn  07/27   xx      -           MSB / LSB
    EQ Mid          rotate                      Bn  0B/2B   xx      -           MSB / LSB
    EQ Low          rotate                      Bn  0F/2F   xx      -           MSB / LSB
    Color Fx CH1    rotate                      B6  17/37   xx      -           MSB / LSB
    Color Fx CH2    rotate                      B6  18/38   xx      -           MSB / LSB
    Master Cue      press                       96  63      hh  [midi in]       OFF=0x00, ON=0x7F
                    press       shift           96  78      hh  [midi in]       OFF=0x00, ON=0x7F
    Cue (Headpho)   press                       9n  54      hh  [midi in]       OFF=0x00, ON=0x7F
                    press       shift           9n  68      hh  [midi in]       OFF=0x00, ON=0x7F
    Ch Fader        slide                       Bn  13/33   xx      -           MSB / LSB
    Crossfader      slide                       B6  1F/3F   xx      -           MSB / LSB
    both above      zero->notzero   shift       9n  66  hh      [midi in]       OFF=0x00, ON=0x7F (PLAY message for fader start)
                    notzero->zero   shift       9n  52  hh      [midi in]       OFF=0x00, ON=0x7F (CUE message for fader start)
    TransitionFX    press                       96  59  hh      [midi in]       OFF=0x00, ON=0x7F
                    press           shift       96  5A  hh      [midi in]       OFF=0x00, ON=0x7F

    Deck1 PAD p=7, Deck1 SHIFT PAD p=8, Deck2 PAD p=9, Deck2 SHIFT PAD p=A
    PAD 1           press                       9p  00  hh      [midi in]       OFF=0x00, ON=0x7F
    PAD 2           press                       9p  01  hh      [midi in]       OFF=0x00, ON=0x7F
    PAD 3           press                       9p  02  hh      [midi in]       OFF=0x00, ON=0x7F
    PAD 4           press                       9p  03  hh      [midi in]       OFF=0x00, ON=0x7F
    PAD 5           press                       9p  04  hh      [midi in]       OFF=0x00, ON=0x7F
    PAD 6           press                       9p  05  hh      [midi in]       OFF=0x00, ON=0x7F
    PAD 7           press                       9p  06  hh      [midi in]       OFF=0x00, ON=0x7F
    PAD 8           press                       9p  07  hh      [midi in]       OFF=0x00, ON=0x7F
*/

var DDJ200 = { };

DDJ200.init = function () {
    DDJ200.leftDeck = new DDJ200.Deck([1, 3], 1);
    DDJ200.rightDeck = new DDJ200.Deck([2, 4], 2);

    DDJ200.LEDsOff();

    // start with focus on library for selecting tracks (delay seems required)
    engine.beginTimer(500, function() {
        engine.setValue("[Library]", "MoveFocus", 1);
    }, true);

    engine.setValue("[Channel3]", "volume", 0);
    engine.setValue("[Channel4]", "volume", 0);
    for (var i = 1; i <= 8; i++) {
        engine.setValue("[Sampler" + i + "]", "pregain", 0.2);
    }

    // query the controller for current control positions on startup
    midi.sendSysexMsg([0xF0, 0x00, 0x40, 0x05, 0x00, 0x00, 0x02, 0x0a, 0x00, 0x03, 0x01, 0xf7], 12);
};

DDJ200.shutdown = function () {
    DDJ200.LEDsOff();
};

DDJ200.LEDsOff = function() {                         // turn off LED buttons:
    for (var i = 0; i <= 1; i++) {
        midi.sendShortMsg(0x96 + i, 0x63, 0x00);      // set headphone master
        midi.sendShortMsg(0x90 + i, 0x54, 0x00);      // pfl headphone
        midi.sendShortMsg(0x90 + i, 0x58, 0x00);      // beat sync
        midi.sendShortMsg(0x90 + i, 0x0B, 0x00);      // play
        midi.sendShortMsg(0x90 + i, 0x0C, 0x00);      // cue
        for (var j = 0; j <= 8; j++) {
            midi.sendShortMsg(0x97 + 2 * i, j, 0x00); // hotcue
        }
    }
};

DDJ200.padModes = [ "hotcue", "loop", "effect", "jump" ];
DDJ200.padModeIndex = 0;
DDJ200.transFxButton = new components.Button({
    midi: [0x96, 0x59],
    blinkConnection: undefined,
    input: function(channel, control, value, status, _g) {
        if (value) { // only if button pressed
            if (DDJ200.padModeIndex == (DDJ200.padModes.length - 1))
                DDJ200.padModeIndex = 0;
            else {
                DDJ200.padModeIndex = (DDJ200.padModeIndex + 1) % (DDJ200.padModes.length - 1);
            }
            DDJ200.leftDeck.pads.forEach(function(e) { e.updateOutKey(); });
            DDJ200.rightDeck.pads.forEach(function(e) { e.updateOutKey(); });
            this.output();
        }
    },
    shiftedInput: function(channel, control, value, status, _g) {
        if (value) { // only if button pressed
            if (DDJ200.padModeIndex == (DDJ200.padModes.length - 1))
                DDJ200.padModeIndex = 0;
            else {
                DDJ200.padModeIndex = DDJ200.padModes.length - 1;
            }
            DDJ200.leftDeck.pads.forEach(function(e) { e.updateOutKey() });
            DDJ200.rightDeck.pads.forEach(function(e) { e.updateOutKey() });
            this.output();
        }
    },
    output: function(value, _g, control) {
        if (this.blinkConnection) {
            this.blinkConnection.disconnect();
            this.blinkConnection = undefined;
        }
        switch (DDJ200.padModes[DDJ200.padModeIndex]) {
            case "hotcue":
                this.send(this.outValueScale(0));
                break;
            case "loop":
                this.send(this.outValueScale(1));
                break;
            case "effect":
                this.blinkConnection = engine.makeConnection("[App]", "indicator_250ms", function(value, _group, _control) {
                    midi.sendShortMsg(0x96, 0x59, 0x7F * value);
                });
                break;
            case "jump":
                this.blinkConnection = engine.makeConnection("[App]", "indicator_250ms", function(value, _group, _control) {
                    midi.sendShortMsg(0x96, 0x59, 0x7F * value);
                    for (var i = 0; i < 8; i++) {
                        midi.sendShortMsg(0x97, i, 0x7F * value);
                        midi.sendShortMsg(0x99, i, 0x7F * value);
                    };
                });
                break;
        }
    }
});

DDJ200.headMixButton = new components.Button({
    midi: [0x96, 0x63],
    key: 'headMix',
    type: components.Button.prototype.types.toggle,
    input: function(channel, control, value, status, _g) {
        if (value) { // only if button pressed
            var masterMixEnabled = (engine.getValue("[Master]", "headMix") >= 0);
            engine.setValue("[Master]", "headMix", masterMixEnabled ? -1 : 0);
            this.send(masterMixEnabled?0:0x7F); // set LED
        }
    },
    shiftedInput: function(channel, control, value, status, _g) {
        if (value) { // only if button pressed
            engine.setValue("[Skin]", "show_4decks", !engine.getValue("[Skin]", "show_4decks"));
            if (!engine.getValue("[Skin]", "show_4decks")) {
                DDJ200.leftDeck.setCurrentDeck("[Channel1]");
                DDJ200.rightDeck.setCurrentDeck("[Channel2]");
                if (DDJ200.leftDeck.syncButton.blinkConnection) {
                    DDJ200.leftDeck.syncButton.blinkConnection.disconnect();
                }
                if (DDJ200.rightDeck.syncButton.blinkConnection) {
                    DDJ200.rightDeck.syncButton.blinkConnection.disconnect();
                }
            }
        }
    }
});

DDJ200.shiftButton = new components.Button({
    input: function(channel, control, value, status, _g) {
        DDJ200.leftDeck.shiftPressed = value && (status == 0x90);
        DDJ200.rightDeck.shiftPressed = value && (status == 0x91);
        if (value) {
            DDJ200.leftDeck.shift();
            DDJ200.rightDeck.shift();
        } else {
            DDJ200.leftDeck.unshift();
            DDJ200.rightDeck.unshift();
        }
        DDJ200.leftDeck.reconnectComponents();
        DDJ200.rightDeck.reconnectComponents();
    }
});

DDJ200.Deck = function (deckNumbers, midiChannel) {
    components.Deck.call(this, deckNumbers);
    var theDeck = this;

    // set Pioneer CDJ cue mode for all decks
    engine.setValue(this.currentDeck, "cue_cdj", true);

    this.jogWheel = new components.JogWheelBasic({
        wheelResolution: 128, // how many ticks per revolution the jogwheel has
        alpha: 1/8, // alpha-filter
        beta: 1/8/32,
        rpm: 33 + 1/3,
        inValueScale: function(value) {
            return value - 64;
        },
        inKey: "jog",
        jogCounter: 0,
        inputSeek: function(_channel, _control, value, _status, group) {
            if (DDJ200.leftDeck.shiftPressed) {
                this.jogCounter += this.inValueScale(value);
                if (this.jogCounter > 9) {
                    engine.setValue("[Library]", "MoveDown", true);
                    this.jogCounter = 0;
                } else if (this.jogCounter < -9) {
                    engine.setValue("[Library]", "MoveUp", true);
                    this.jogCounter = 0;
                }
            } else {
                var oldPos = engine.getValue(group, "playposition");
                // Since ‘playposition’ is normalized to unity, we need to scale by
                // song duration in order for the jog wheel to cover the same amount
                // of time given a constant turning angle.
                var duration = engine.getValue(group, "duration");
                var newPos = Math.max(0, oldPos + (this.inValueScale(value) * 0.2 / duration));

                engine.setValue(group, "playposition", newPos); // Strip search
            }
        }
    });

    this.syncButton = new components.Button({
        midi: [0x8F + midiChannel, 0x58],
        key: "sync_enabled",
        input: function(channel, control, value, status, _g) {
            if (value) {
                if (engine.getValue(this.group, "sync_enabled") === 0) {
                    engine.setValue(this.group, "beatsync", 1);
                } else {
                    engine.setValue(this.group, "sync_enabled", 0);
                }
            }
        },
        inputLongPress: function(channel, control, value, status, _g) {
            if (value) {
                engine.setValue(this.group, "sync_enabled", 1);
            }
        },
        shiftedInput: function(channel, control, value, status, _g) {
            if (value) {
                if (engine.getValue("[Skin]", "show_4decks")) {
                    theDeck.toggle();
                    if (theDeck.currentDeck == "[Channel3]" || theDeck.currentDeck == "[Channel4]" ) {
                        this.blinkConnection = engine.makeConnection("[App]", "indicator_250ms", function(value, _group, _control) {
                            midi.sendShortMsg(0x8F + midiChannel, 0x58, 0x7F * value);
                        });
                    } else if (this.blinkConnection) {
                        this.blinkConnection.disconnect();
                    }
                } else {
                    currentRange = engine.getValue(this.group, "rateRange");
                    engine.setValue(this.group, "rateRange", (currentRange>0.9)?0.1:currentRange+0.1);
                }
            }
        }
    });

    this.playButton = new components.PlayButton({
        outKey: 'play_indicator',
        shift: function() {
            this.inKey = 'reverse';
            this.midi = [0x8F + midiChannel, 0x47];
        },
        input_faderStart: function(channel, control, value, status, _g) {
            console.log("input_faderStart");
            this.inKey = 'play';
            this.input(channel, control, value, status, _g);
            this.inKey = 'reverse';
        },
        unshift: function() {
            this.inKey = 'play';
            this.midi = [0x8F + midiChannel, 0x0B];
        }
    });

    this.cueButton = new components.CueButton({
        outKey: 'cue_indicator',
        shift: function() {
            this.inKey = 'cue_gotoandstop';
            this.midi = [0x8F + midiChannel, 0x48];
        },
        input_faderStop: function(channel, control, value, status, _g) {
            this.inKey = 'cue_set';
            this.input(channel, control, value, status, _g);
            this.inKey = 'cue_gotoandstop';
            this.input(channel, control, value, status, _g);
        },
        unshift: function() {
            this.inKey = 'cue_default';
            this.midi = [0x8F + midiChannel, 0x0C];
        }
    });

    this.pads = [];
    for (var i = 0; i < 8; i++) {
        this.pads[i] = new components.HotcueButton({
            number: i + 1,
            input: function(channel, control, value, status, _g) {
                this['input_' + DDJ200.padModes[DDJ200.padModeIndex]](channel, control, value, status, _g);
            },
            shiftedInput: function(channel, control, value, status, _g) {
                this['input_shift_' + DDJ200.padModes[DDJ200.padModeIndex]](channel, control, value, status, _g);
            },
            output: function(value, _g, _control) {
                this['output_' + DDJ200.padModes[DDJ200.padModeIndex]](value, _g, _control);
            },
            midi_normal: [0x97 + (midiChannel - 1)*2, 0x00 + i],
            midi_shift: [0x98 + (midiChannel - 1)*2, 0x00 + i],
            shift: function() {
                this.midi = this.midi_shift;
            },
            unshift: function() {
                this.midi = this.midi_normal;
            },
            outKey: this['outKey_' + DDJ200.padModes[DDJ200.padModeIndex]],
            connect: function() {
                if (DDJ200.padModes[DDJ200.padModeIndex] != "effect") {
                    components.HotcueButton.prototype.connect.call(this);
                } else {
                    this.outKey_effect_connect();
                }
            },
            updateOutKey: function() {
                this.outKey = this['outKey_' + DDJ200.padModes[DDJ200.padModeIndex]];
                this.disconnect();
                this.connect();
                this.trigger();
            },

            /* ----------- PADs in Hotcue Mode ----------- */
            input_hotcue: function(channel, control, value, status, _g) {
                engine.setValue(this.group, "hotcue_" + this.number + "_activate", value);
            },
            input_shift_hotcue: function(channel, control, value, status, _g) {
                if (value)
                    engine.setValue(this.group, "hotcue_" + this.number + "_clear", value);
            },
            outKey_hotcue: 'hotcue_' + (i + 1) + '_status',
            output_hotcue: function(value, _g, _control) {
                this.send(this.outValueScale(value));
            },

            /* ----------- PADs in Loop Mode ----------- */
            input_loop: function(channel, control, value, status, _g) {
                if (value) { // only if button pressed
                    var loopSize = (Math.pow(2, this.number) * 0.25);
                    var loopEnabled = engine.getValue(this.group, "loop_enabled");
                    var matchingLoopSize = (engine.getValue(this.group, "beatloop_size") === loopSize);

                    engine.setValue(this.group, "beatloop_size", loopSize);
                    if (matchingLoopSize || !loopEnabled) {
                        engine.setValue(this.group, "beatloop_activate", true);
                        this.send(this.outValueScale(value));
                    }
                }
            },
            input_shift_loop: function(channel, control, value, status, _g) {
                if (value) { // only if button pressed
                    var loopSize = (Math.pow(2, this.number) * 0.25);
                    var loopEnabled = engine.getValue(this.group, "loop_enabled");
                    var matchingLoopSize = (engine.getValue(this.group, "beatloop_size") === loopSize);

                    engine.setValue(this.group, "beatloop_size", loopSize);
                    if (matchingLoopSize || !loopEnabled) {
                        engine.setValue(this.group, "beatlooproll_activate", true);
                    }
                }
            },
            outKey_loop: 'loop_enabled',
            output_loop: function(value, _g, _control) {
                var loopSize = (Math.pow(2, this.number) * 0.25);
                var loopEnabled = engine.getValue(this.group, "loop_enabled");
                var matchingLoopSize = (engine.getValue(this.group, "beatloop_size") === loopSize);
                value = matchingLoopSize?loopEnabled:0;
                this.send(this.outValueScale(value));
            },

            /* ----------- PADs in Effect Mode ----------- */
            input_effect: function(channel, control, value, status, _g) {
                if (control < 4) {
                    var sampler = "[Sampler" + (control + 1 +(this.deckFromGroup(this.group)-1)*4) + "]"
                    if (engine.getValue(sampler, "play"))
                        engine.setValue(sampler, "stop", value);
                    else
                        engine.setValue(sampler, "cue_gotoandplay", value);
                } else if (control < 7) {
                    var effect = "[EffectRack1_EffectUnit" + this.deckFromGroup(this.group) + "_Effect" + (control - 3) +"]";
                    engine.setValue(effect, "enabled", value);
                } else {
                    if (value) {
                        bpm.tapButton(this.deckFromGroup(this.group));
                    }
                    this.send(this.outValueScale(value));
                }
            },
            input_shift_effect: function(channel, control, value, status, _g) {
                this.input_effect(channel, control, value, status, _g)
            },
            deckFromGroup: function(group) {
                var deckGroup = script.deckFromGroup(group);
                return (((deckGroup - 1) % 2) + 1);
            },
            outKey_effect_connect: function() {
                var control = this.number - 1;
                if (control < 4) {
                    var sampler = "[Sampler" + (control + 1 + (this.deckFromGroup(this.group)-1) * 4) + "]";
                    this.connections[0] = engine.makeConnection(sampler, "play", this.output.bind(this));
                } else if (control < 7) {
                    var effect = "[EffectRack1_EffectUnit" + this.deckFromGroup(this.group) + "_Effect" + (control - 3) +"]";
                    this.connections[0] = engine.makeConnection(effect, "enabled", this.output.bind(this));
                } else {
                    this.connections[0] = undefined;
                }
            },
            outKey_effect: undefined,
            output_effect: function(value, _g, _control) {
                this.send(this.outValueScale(value));
            },

            /* ----------- PADs in BeatJump Mode ----------- */
            input_jump: function(channel, control, value, status, _g) {
                if (value) { // only if button pressed
                    engine.setValue(this.group, "beatjump_size", Math.pow(2, control+2));
                    engine.setValue(this.group, "beatjump_forward", true);
                }
            },
            input_shift_jump: function(channel, control, value, status, _g) {
                if (value) { // only if button pressed
                    engine.setValue(this.group, "beatjump_size", Math.pow(2, control+2));
                    engine.setValue(this.group, "beatjump_backward", true);
                }
            },
            outKey_jump: 'hotcue_' + (i + 1) + '_status',
            output_jump: function(value, _g, _control) {
                this.send(this.outValueScale(0));
            }

        });
    }
    this.pads.forEach(function(e) { e.updateOutKey() });

    this.pflButton = new components.Button({
        key: 'pfl',
        type: components.Button.prototype.types.toggle,
        shift: function() {
            this.midi = [0x8F + midiChannel, 0x68];
        },
        unshift: function() {
            this.midi = [0x8F + midiChannel, 0x54];
        }
    });

    this.volume = new components.Pot({
        inKey: 'volume',
    });

    this.rate = new components.Pot({
        inKey: 'rate',
        invert: 1
    });

    this.eqKnob = [];
    for (var k = 0; k < 3; k++) {
        this.eqKnob[k] = new components.Pot({
            group: '[EqualizerRack1_' + this.currentDeck + '_Effect1]',
            inKey: 'parameter' + (k+1),
        });
    }

    this.super1 = new components.Pot({
        group: '[QuickEffectRack1_' + this.currentDeck + ']',
        inKey: 'super1',
    });

    this.reconnectComponents(function (c) {
        if (c.group === undefined) {
            c.group = this.currentDeck;
        }
    });

};

DDJ200.Deck.prototype = new components.Deck();
