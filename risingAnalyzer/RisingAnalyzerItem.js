class RisingAnalyzerItem {
    constructor(stack, relationSign, chain) {
        this.stack = stack.clone();
        this.relationSign = relationSign;
        this.chain = chain.clone();
    }

    getStack() {
        return this.stack.reduce((prev, current) => {
            return prev + ' ' + current.label;
        }, '')
    }
    getChain() {
        return this.chain.reduce((prev, current) => {
            return prev + ' ' + current.lexemeName;
        }, '')
    }
}