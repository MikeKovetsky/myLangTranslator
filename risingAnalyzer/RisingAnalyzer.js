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

    getSignBetween(el1, el2) {
        return  el1.equalsTo.includes(el2.label) ? '=' :
                el1.lessThan.includes(el2.label) ? '<' :
                el1.moreThan.includes(el2.label) ? '>' : void 0
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
        this.sourceLexemes.forEach((lexeme) => {
            const grammarItem = this.findGrammarItem(lexeme);
            const relationSign = this.getSignBetween(stack.last(), grammarItem);
            items.push(new RisingAnalyzerItem(stack, relationSign, sourceChain));
            if (relationSign === '<' || relationSign === '=') {
                stack.push(this.findGrammarItem(sourceChain.shift()));
            }
            if (relationSign === '>') {
                stack.clone().reverse().forEach((el, index, reversedStack) => {
                    if (index > 0) {
                        const sign = this.getSignBetween(el, reversedStack[index - 1]);
                        if (sign === '<' || sign === '=') {
                            const raisedLexemeName = this.precedenceRelationships.raiseLexeme(reversedStack[index - 1]);
                            const raisedLexeme = this.precedenceRelationships.lexemes.find(lexeme => {
                                return raisedLexemeName === lexeme.label;
                            });
                            console.log(this.precedenceRelationships);
                            const sign = this.getSignBetween(raisedLexeme, grammarItem);
                            stack[stack.length - 1] = raisedLexeme;
                            items.push(new RisingAnalyzerItem(stack, sign, sourceChain));
                        }
                    }
                });
            }
        });
        return items;
    }

}
