class RisingAnalyzer {

    constructor(precedenceRelationships, sourceLexemes) {
        this.precedenceRelationships = precedenceRelationships;
        this.sourceLexemes = sourceLexemes;
    }

    findGrammarItem(lexeme) {
        let lexemeType = '';
        if (lexeme.type === 'identifier') lexemeType = 'IDN';
        if (lexeme.type === 'const') lexemeType = 'CON';
        return this.precedenceRelationships.lexemes.find((item) => {
            return item.label === (lexemeType || lexeme.lexemeName);
        });
    }

    getSignBetween(el1, el2, checkReversed = false) {
        if (checkReversed) {
            return  el1.equalsTo.includes(el2.label) || el2.equalsTo.includes(el1.label) ? '=' :
                    el1.lessThan.includes(el2.label) || el2.lessThan.includes(el1.label) ? '<' :
                    el1.moreThan.includes(el2.label) || el2.moreThan.includes(el1.label) ? '>' : void 0;
        } else {
            return  el1.equalsTo.includes(el2.label) ? '=' :
                    el1.lessThan.includes(el2.label) ? '<' :
                    el1.moreThan.includes(el2.label) ? '>' : void 0
        }
    }

    findBase(stack) {
        let base = [stack[0]];
        for (let [index, el] of stack.entries()) {
            if (index > 0) {
                if (this.getSignBetween(stack[index - 1], el, true) === '=') {
                    base.push(el);
                } else return base;
            }
        }
    }

    renderTable(items) {
        $('#risingTable tbody').empty();
        items.forEach((row, index) => {
            $('#risingTable tbody').append(
                `<tr>
                <td>${index + 1}</td>
                <td>${row.getStack()}</td>
                <td>${row.relationSign}</td>
                <td>${row.getChain()}</td>
            </tr>`)
        });
    }

    analyze() {
        const hash = new GrammarLexeme('#');
        let sourceChain = this.sourceLexemes.clone();
        hash.lessThan = sourceChain.map((lexeme) => {
            return lexeme.lexemeName;
        });
        hash.lessThan.unshift('#');
        this.precedenceRelationships.lexemes.unshift(hash);
        let stack = [hash];
        let items = [];
        this.sourceLexemes.forEach((lexeme, index) => {
            const grammarItem = this.findGrammarItem(lexeme);
            let relationSign = this.getSignBetween(stack.last(), grammarItem);
            // if (grammarItem.label === 'begin' && !relationSign) {
            //     stack.last().moreThan.push('begin');
            //     relationSign = this.getSignBetween(stack.last(), grammarItem);
            // }
            // if (index === 13) {
            //     stack.last().moreThan.push('П');
            //     relationSign = this.getSignBetween(stack.last(), grammarItem);
            // }
            items.push(new RisingAnalyzerItem(stack, relationSign, sourceChain));
            if (relationSign === '<' || relationSign === '=') {
                stack.push(this.findGrammarItem(sourceChain.shift()));
            }
            if (relationSign === '>') {
                for (let stackEl of stack.clone().reverse()) {
                    const reversedStack = stack.clone().reverse();
                    const index = reversedStack.indexOf(stackEl);
                    if (index > 0) {
                        const prevStackEl = reversedStack[index - 1];
                        const sign = this.getSignBetween(stackEl, prevStackEl);
                        if (sign === '<' || sign === '=') {
                            const base = this.findBase(reversedStack);
                            const raisedLexemeName = this.precedenceRelationships.raiseLexemes(base.reverse());
                            const raisedLexeme = this.precedenceRelationships.lexemes.find(precedenceLexeme => {
                                return raisedLexemeName === precedenceLexeme.label;
                            });
                            const sign = this.getSignBetween(raisedLexeme, grammarItem);
                            stack = stack.slice(0, -base.length);
                            stack.push(raisedLexeme);
                            items.push(new RisingAnalyzerItem(stack, sign, sourceChain));
                            if (sign === '<' || sign === '=') {
                                stack.push(this.findGrammarItem(sourceChain.shift()));
                                break;
                            }
                        }
                    }
                }
            }
            this.renderTable(items);
        });
        return items;
    }

}
