/**
 * Created by Kovetsky on 21.12.2016.
 */

var MpaLexeme = function (number, lexeme, currentState, stack) {
    this.number = number;
    this.lexeme = lexeme;
    this.currentState = currentState;
    this.stack = stack;
};

var MpaAnalyzer = function(lexemes, langLexemes) {
    this.count = 0;
    this.stack = [];
    this.mpaLexemes = [];
    this.lexemes = lexemes;
    this.langLexemes = langLexemes;

    var self = this;

    this.analyze = function () {
        var stateNumber = 1;
        for (self.count = 0; self.count < self.lexemes.length; self.count++) {
            stateNumber = self.getState(stateNumber, self.stack);
        }
    };

    this.getLexeme = function () {
        // if (self.lexemes[self.count].lexemeCode === 32) {
        //     return idns[self.lexemes[self.count].typeCode - 1].lexemeName;
        // }
        // if (self.lexemes[self.count].lexemeCode === 33) {
        //     return "" + consts[self.lexemes[self.count].typeCode - 1].lexemeName;
        // }
        return self.langLexemes[self.lexemes[self.count].lexemeCode];
    };

    this.getStack = function() {
        var string = '';
        for (var i = 0; i < self.stack.length; i++) {
            string += ' ' + self.stack[i];
        }
        return string
    };

    this.getState = function (currentState, stack) {
        // console.log("current state " + currentState);
        // console.log("lexemes[self.count]");
        console.log(lexemes[self.count]);
        console.log(currentState)
        if (currentState === 23) {
            console.log(1)
        }

        if (currentState === 1) {
            console.log(1)
        }

        if (currentState === 11) {
            console.log(1)
        }

        for (var i = 0; i < states.length; i++) {
            var state = states[i];
            if (state.lexemeCode === self.lexemes[self.count].lexemeCode) {
                // console.log('state = ')
                // console.log(state)
                if (state.alpha === currentState) {
                    self.mpaLexemes.push(
                        new MpaLexeme(self.count + 1, self.getLexeme(), currentState, self.getStack()));
                    if (state.beta) {
                        if (state.stack) {
                            stack.push(state.stack);
                        }
                        return state.beta;
                    } else {
                        if (currentState == 10 || currentState == 23) { // ?
                            stack.push(state.mpaStack);
                            return state.mpaBeta;
                        } else {
                            return stack.pop();
                        }
                    }
                }
            }
        }
        for (var j = 0; j < states.length; j++) {
            if (i === 55) {
                // console.log(1)
                // console.log(states[1].toString())
            }
            state = states[j];
            if (state.alpha === currentState) {
                if (state.mpaBeta) {
                    if (state.mpaBeta === -1) {
                        self.mpaLexemes.push(
                            new MpaLexeme(self.count + 1, self.getLexeme(), currentState, self.getStack()));
                        return self.getState(stack.pop(), stack);
                    }
                    stack.push(state.stack);
                    self.mpaLexemes.push(
                        new MpaLexeme(self.count + 1, self.getLexeme(), state, self.getStack()));
                    return self.getState(state.beta, stack);
                } else {
                     throw new Error("Ошибка: " + state.inequalityMsg + " в строке № " + self.lexemes[self.count].lineNumber);
                }
            }
        }
        console.log(self.count)
        console.log(self.lexemes.length)
        // return 1;

    }
};

