class RisingAnalyzer {

    constructor(precedenceRelationships, sourceLexemes) {
        this.precedenceRelationships = precedenceRelationships;
        this.sourceLexemes = sourceLexemes;
        console.log(this.sourceLexemes);
        console.log(this.precedenceRelationships);
    }

    findGrammarItem(lexeme) {
        let lexemeType = '';
        if (lexeme.type === 'identifier') lexemeType = 'IDN';
        if (lexeme.type === 'const') lexemeType = 'CON';
        return this.precedenceRelationships.lexemes.find((item) => {
            return item.label === (lexemeType || lexeme.lexemeName);
        });
    }

    analyze() {
        const hash = new GrammarLexeme('#');
        let sourceChain = this.sourceLexemes.clone();
        hash.lessThan = sourceChain.map((lexeme) => {
            return lexeme.lexemeName;
        });
        hash.lessThan.unshift('#');
        let stack = [hash];
        this.precedenceRelationships.lexemes.unshift(hash);
        let items = [new RisingAnalyzerItem(stack, '<', sourceChain)];
        this.sourceLexemes.forEach((lexeme) => {
            const grammarItem = this.findGrammarItem(lexeme);
            const relationSign =
                stack.last().equalsTo.includes(grammarItem.label) ? '=' :
                stack.last().lessThan.includes(grammarItem.label) ? '<' :
                stack.last().moreThan.includes(grammarItem.label) ? '>' : void 0;
            if (relationSign === void 0)  {
                // debugger;
            }
            if (relationSign === '<' || relationSign === '=') {
                stack.push(this.findGrammarItem(sourceChain.shift()));
            }
            if (relationSign === '>') {
                stack.forEach((el, index) => {
                    if (index > 0) {
                        if (stack[index - 1].lessThan.includes(el.label)) {

                        }
                    }
                });
            }
            items.push(new RisingAnalyzerItem(stack, relationSign, sourceChain));
        });
        return items;
    }

}
