class PrecedenceRelationshipGrammar {
    constructor(sourceCode) {
        this.sourceCode = sourceCode;
        this.rightRules = this.sourceCode
            .split('\n')
            .map((line) => line.split('::=')[1])
            .map((rule) => {
                return rule
                    .split('|')
                    .map((subRule) => subRule
                        .split(' ')
                        .filter(el => !!el)
                    );
            });
        this.nonterminalNames =
            this.sourceCode
                .split('\n')
                .map((line) => line.split('::=')[0]);
        this.terminalNames =
            this.sourceCode
                .split('\n')
                .map(line => line.split('::=')[1])
                .join(' ')
                .replace(/<[^>]*>/g, ' ') //убрал <>
                .replace(/\|/g, '') // убрал |
                .split(' ')
                .filter(el => !!el)
                .filter((el, pos, arr) => arr.indexOf(el) == pos);
        this.terminalNames.push('#');
        this.lexemes = this.nonterminalNames.concat(this.terminalNames)
            .map(lexemeLabel => new GrammarLexeme(lexemeLabel));

    }

    setEquality() {
        this.lexemes.forEach(
            lexeme => this.rightRules.forEach(
                rule => rule.forEach(
                    subRule => {
                        let prevValue = '';
                        subRule.forEach(
                            lexemeLabel => {
                                // console.log('prevValue= ', prevValue, 'lexemeLabel= ', lexemeLabel);
                                prevValue === lexeme.label ? lexeme.equalsTo.push(lexemeLabel) : '';
                                prevValue = lexemeLabel;
                            }
                        )
                    }
                )
            )
        )
    }

    findFirstPluses(line, firstPluses = [], lineNumber) {

        let parsedRules =
            line.split('::=')[1]
                .split('|')
                .map(rule => rule.split(' '))
                .map(subRule => subRule
                    .filter(el => !!el));
        // console.log(firstPluses);
        parsedRules.forEach(
            rule => {
                if (!firstPluses.includes(rule[0])
                    && rule[0] !== this.lexemes[lineNumber].label)
                    firstPluses.push(rule[0])
            }
        );
        firstPluses.forEach(firstPlus => {
            if (this.nonterminalNames.includes(firstPlus) &&
                firstPlus !== this.nonterminalNames[lineNumber]) {
                let lines = this.sourceCode.split('\n');
                lines.forEach((line, newLineNumber) => {
                    if (this.nonterminalNames[newLineNumber] === firstPlus &&
                        this.nonterminalNames[lineNumber] !== firstPlus &&
                        newLineNumber > lineNumber)
                        firstPluses = this.findFirstPluses(line, firstPluses, newLineNumber)
                })
            }
        });
        return firstPluses;
    }

    findLastPluses(line, lastPluses = [], lineNumber) {

        let parsedRules =
            line.split('::=')[1]
                .split('|')
                .map(rule => rule.split(' '))
                .map(subRule => subRule
                    .filter(el => !!el));
        // console.log(firstPluses);
        parsedRules.forEach(
            rule => {
                let lastIndex = rule.length-1;
                if (!lastPluses.includes(rule[lastIndex])
                    && rule[lastIndex] !== this.lexemes[lineNumber].label)
                    lastPluses.push(rule[lastIndex])
            }
        );
        lastPluses.forEach(lastPlus => {
            if (this.nonterminalNames.includes(lastPlus) &&
                lastPlus !== this.nonterminalNames[lineNumber]) {
                let lines = this.sourceCode.split('\n');
                lines.forEach((line, newLineNumber) => {
                        if (this.nonterminalNames[newLineNumber] === lastPlus &&
                            this.nonterminalNames[lineNumber] !== lastPlus &&
                            newLineNumber > lineNumber)
                            lastPluses = this.findFirstPluses(line, lastPluses, newLineNumber)
                    }
                )
            }
        });
        return lastPluses;
    }

    findAllFirstPluses() {
        let lines = this.sourceCode.split('\n');
        lines.forEach((line, lineNumber) => {
            this.lexemes[lineNumber].firstPluses =
                this.findFirstPluses(line, [], lineNumber);
        });
    }

    findAllLastPluses() {
        let lines = this.sourceCode.split('\n');
        lines.forEach((line, lineNumber) => {
            this.lexemes[lineNumber].lastPluses =
                this.findLastPluses(line, [], lineNumber);
        });
    }

    setLess() {
        this.lexemes.forEach((lexemeR, index) =>
            lexemeR.equalsTo.forEach((lexemeV) => {
                let lexemeVObj = this.lexemes.find(
                    lexeme => lexeme.label === lexemeV
                );
                if (lexemeVObj && lexemeVObj.isTerminal) return;
                lexemeVObj.firstPluses.forEach(firstPlus => {
                    let firstPlusObj = this.lexemes.find(
                        lexeme => lexeme.label === firstPlus
                    );
                    if (firstPlusObj) {
                        this.lexemes[index].lessThan.push(firstPlusObj.label);
                    }
                });
            })
        )
    }

    setMore1() {
        this.lexemes.forEach(
            (lexemeR) => {
                // if (lexemeR.label === 'begin') debugger;
                lexemeR.equalsTo.forEach(
                    (lexemeV) => {
                        if (lexemeR.isTerminal) return;
                        lexemeR.lastPluses.forEach(lastPlus => {
                            let lastPlusObj = this.lexemes.find(
                                lexeme => lexeme.label === lastPlus
                            );
                            if (lastPlusObj) {
                                lastPlusObj.moreThan.push(lexemeV);
                            }
                        })
                    }
                )
            })
    }

    setMore2() {
        this.lexemes.forEach(
            (lexemeR, index) => {
                // if (lexemeR.label === 'begin') debugger;
                lexemeR.equalsTo.forEach(
                    (lexemeV) => {
                        let lexemeVObj = this.lexemes.find(
                            lexeme => lexeme.label === lexemeV
                        );
                        if (lexemeVObj && lexemeVObj.isTerminal || lexemeR.isTerminal) return;
                        lexemeR.lastPluses.forEach(lastPlus => {
                            let lastPlusObj = this.lexemes.find(
                                lexeme => lexeme.label === lastPlus
                            );
                            lexemeVObj.firstPluses.forEach(firstPlus => {
                                let firstPlusObj = this.lexemes.find(
                                    lexeme => lexeme.label === firstPlus
                                );
                                if (lastPlusObj && firstPlusObj) {
                                    lastPlusObj.moreThan.push(firstPlusObj.label);
                                }
                            });
                        })
                    }
                )
            })
    }

    raiseLexemes(lexemes) {
        const rules = this.rightRules.clone().reverse();
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            for (let subRule of rule) {
                if (subRule.length === lexemes.length) {
                    const found = subRule.every((subRuleLexeme, index) => {
                        return lexemes[index] && subRuleLexeme === lexemes[index].label
                    });
                    if (found) {
                        return this.nonterminalNames.clone().reverse()[i];
                    }
                }
            }
        }
    }

}