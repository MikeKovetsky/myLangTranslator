class GrammarLexeme {
    constructor(label) {
        this.label = label;
        this.equalsTo = [];
        this.lessThan = [];
        this.moreThan = [];
        this.firstPluses = [];
        this.lastPluses = [];
        this.isTerminal = !(label.includes('<') && label.includes('>'));
    }
}