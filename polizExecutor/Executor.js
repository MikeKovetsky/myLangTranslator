class PolizExecutor {
    constructor(poliz, polizLabels, polizCells, identifyTable) {
        this.poliz = poliz;
        this.polizLabels = polizLabels;
        this.polizCells = polizCells;
        this.currentPosition = 0;
        this.stack = [];
        this.outputData = [];
        this.identifiers = [];
        for (let row of identifyTable) {
            this.identifiers.push(new Identifier(row.lexemeName, row.dataType, null));
        }
    }

    execute() {
        let isEnd = false;
        while (!isEnd) {
            isEnd = this.executeNextStep();
        }
    }

    executeNextStep() {
        if (this.currentPosition > this.poliz.length - 1) { return true;}

        if (this.poliz[this.currentPosition].type === "label" &&
            this.poliz[this.currentPosition].token[this.poliz[this.currentPosition].token.length - 1] === ':')
        {
            this.currentPosition++;
        }
        else if (['idn','con','label','cell'].includes(this.poliz[this.currentPosition].type)) {
            this.stack.push(this.poliz[this.currentPosition]);
            this.currentPosition++;
        }
        else if (this.poliz[this.currentPosition].type === "operation") {
            if (this.poliz[this.currentPosition].token === "RD") {
                if (this.stack.length > 0) {
                    let idn = this.stack.last().token;
                    let obj = this.identifiers.find(o => o.token === idn);
                    if (obj) {
                        do {
                            obj.value = parseInt(prompt('Type in the value of ' + obj.token, '0'));
                        } while (isNaN(obj.value));
                    }
                    this.currentPosition++;
                }
            } else if (this.poliz[this.currentPosition].token === "WR") {
                if (this.stack.length > 0) {
                    let idn = this.stack.last().token;
                    let obj = this.identifiers.find(o => o.token === idn);
                    if (obj) {
                        this.outputData.push({token: obj.token + ':', value: obj.value});
                    }
                    this.currentPosition++;
                }
            }
            else if (this.poliz[this.currentPosition].token === "+" ||
                this.poliz[this.currentPosition].token === "/" ||
                this.poliz[this.currentPosition].token === "*" ||
                this.poliz[this.currentPosition].token === "-" ||
                this.poliz[this.currentPosition].token === "^")
            {
                if (this.stack.length > 1) {
                    let item1 = this.stack.pop();
                    let item2 = this.stack.pop();

                    let val2 = this.GetItemValue(item1);
                    let val1 = this.GetItemValue(item2);
                    let operation = this.poliz[this.currentPosition].token;
                    let res = 0;
                    switch (operation) {
                        case "+": res = val1 + val2; break;
                        case "-": res = val1 - val2; break;
                        case "*": res = val1 * val2; break;
                        case "/": res = val1 / val2; break;
                        case "^": res = Math.pow(val1, val2); break;
                    }
                    this.stack.push(new PolizItem(res.toString(), "con"));
                    this.currentPosition++;
                }
                else
                    console.error('Invalid operation');
            }
            else if (this.poliz[this.currentPosition].token === ">" ||
                this.poliz[this.currentPosition].token === "<" ||
                this.poliz[this.currentPosition].token === "<=" ||
                this.poliz[this.currentPosition].token === ">=" ||
                this.poliz[this.currentPosition].token === "==" ||
                this.poliz[this.currentPosition].token === "!=") {
                let item1 = this.stack.pop();
                let item2 = this.stack.pop();

                let val2 = this.GetItemValue(item1);
                let val1 = this.GetItemValue(item2);

                let operation = this.poliz[this.currentPosition].token;

                let res = false;

                switch (operation) {
                    case ">": res = val1 > val2; break;
                    case "<": res = val1 < val2; break;
                    case "<=": res = val1 <= val2; break;
                    case ">=": res = val1 >= val2; break;
                    case "==": res = val1 === val2; break;
                    case "!=": res = val1 !== val2; break;
                }
                this.stack.push(new PolizItem(res.toString(), "con"));
                this.currentPosition++;
            }
            else if (this.poliz[this.currentPosition].token === "=")
            {
                let item1 = this.stack.pop();
                let item2 = this.stack.pop();
                let val = this.GetItemValue(item1);
                let obj = new Identifier();
                let ob = new PolizCell();
                if (item2.type === "idn") {
                    obj = this.identifiers.find(o => o.token === item2.token);
                    if (obj.type === "int") {
                        obj.value = parseInt(val);
                    }
                    else console.error('Invalid Operation');
                }
                else if (item2.type === "cell") {
                    ob = this.polizCells.find(o => o.cell === item2.token);
                    ob.value = parseInt(val);
                }
                this.currentPosition++;
            }
            else if (this.poliz[this.currentPosition].token === "УПХ")
            {
                let item1 = this.stack.pop();
                let item2 = this.stack.pop();

                if (item2.token === "false") {
                    let obj = this.polizLabels.find(o => o.label === item1.token);
                    this.currentPosition = obj.position;
                }
                else
                    this.currentPosition++;
            }
            else if (this.poliz[this.currentPosition].token === "БП") {
                let item1 = this.stack.pop();
                let obj = this.polizLabels.find(o => o.label === item1.token);
                this.currentPosition = obj.position;
            }
            else if (this.poliz[this.currentPosition].token === "and") {
                let item1 = this.stack.pop();
                let item2 = this.stack.pop();
                if (item1.token === "true" && item2.token === "true")
                    this.stack.push(new PolizItem("true", "con"));
                else
                    this.stack.push(new PolizItem("false", "con"));

                this.currentPosition++;
            }
            else if (this.poliz[this.currentPosition].token === "or") {
                let item1 = this.stack.pop();
                let item2 = this.stack.pop();
                if (item1.token === "true" || item2.token === "true")
                    this.stack.push(new PolizItem("true", "con"));
                else
                    this.stack.push(new PolizItem("false", "con"));
                this.currentPosition++;
            }
            else if (this.poliz[this.currentPosition].token === "not") {
                let item1 = this.stack.pop();
                if (item1.token === "true")
                    this.stack.push(new PolizItem("false", "con"));
                else if (item1.token === "false")
                    this.stack.push(new PolizItem("true", "con"));
                else
                    console.error("Not can be used with logical value");
                this.currentPosition++;
            } else {
                console.error("undefined operation");
            }
        }
    }

        GetItemValue(item) {
            let result = 0;
            if (item.type === "con") {
                return parseInt(item.token);
            } else if (item.type === "idn") {
                let idn = this.identifiers.find(o => o.token === item.token);
                if (idn.type === "int")
                    if (idn.value !== undefined) result = parseInt(idn.value);
                    else console.error("The identify " + idn.token + " didn't initialized at" + this.currentPosition);
                else console.error('invalid Argument');
            }
            else if (item.type === "cell") {
                for (let cell of this.polizCells){
                    if (cell.cell === item.token)
                        result = cell.value;
                }
            }
            else console.error('invalid Argument');
            return result;
        }
    }