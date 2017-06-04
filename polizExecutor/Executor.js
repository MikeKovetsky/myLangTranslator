class PolizExecutor {
    constructor(poliz, polizLabels, polizCells, identifyTable) {
        this._Poliz = poliz;
        this._PolizLabels = polizLabels;
        this._PolizCells = polizCells;
        this._Status = "";
        this._Position = 0;
        this._Stack = [];
        this._OutParam = {};
        this._IdentifyTable = [];
        for (let row of identifyTable) {
            this._IdentifyTable.push(new Identifier(row.lexemeName, row.dataType, null));
        }
    }

    execute() {
        let idnInputs = [];
        let consoleOutput = [];
        while (this._Status !== "Successful Done") {
            while (this._Status === "") {
                this.GoNextStep();
            }
            if (this._Status.indexOf("Input") !== -1) {
                idnInputs.push(this._Stack.last().token);
            }
            else if (this._Status.indexOf("Output") !== -1) {
                let ind = this._IdentifyTable.find(o => o.token === this._Stack.last().token);
                consoleOutput.push(new Identifier(this._Stack.last().token, "int", ind.value));
                this._Status = "";
                this._Position++;
            }
        }
        return {idnInputs, consoleOutput};
    }

    GoNextStep() {
        this._Status = "";
        if (this._Position > this._Poliz.length - 1)
        {
            this._Status = "Successful Done";
            return;
        }
        if (this._Poliz[this._Position].type === "label" &&
            this._Poliz[this._Position].token[this._Poliz[this._Position].token.length - 1] === ':')
        {
            this._Position++;
        }
        else if (this._Poliz[this._Position].type === "idn" ||
            this._Poliz[this._Position].type === "con" ||
            this._Poliz[this._Position].type === "label" ||
            this._Poliz[this._Position].type === "cell")
        {
            this._Stack.push(this._Poliz[this._Position]);
            this._Position++;
        }
        else if (this._Poliz[this._Position].type === "operation")
        {
            if (this._Poliz[this._Position].token === ">>")
            {
                this._Status = "Input ";
                if (this._Stack.length > 0)
                {
                    let idn = this._Stack.last().token;
                    let obj = this._IdentifyTable.find(o => o.token === idn);
                    if (obj) {
                        this._Status += obj.type;
                    }
                }
            }
            else if (this._Poliz[this._Position].token === "<<")
            {
                this._Status = "Output ";
                if (this._Stack.length > 0)
                {
                    let idn = this._Stack.last().token;
                    let obj = this._IdentifyTable.find(o => o.token === idn);
                    if (obj) {
                        this._Status += obj.type;
                        this._OutParam = obj.value;
                        return;
                    }
                    return;
                }
            }
            else if (this._Poliz[this._Position].token === "+" ||
                this._Poliz[this._Position].token === "/" ||
                this._Poliz[this._Position].token === "*" ||
                this._Poliz[this._Position].token === "-" ||
                this._Poliz[this._Position].token === "^")
            {
                if (this._Stack.length > 1) {
                    let item1 = this._Stack.pop();
                    let item2 = this._Stack.pop();

                    let val2 = this.GetItemValue(item1);
                    let val1 = this.GetItemValue(item2);
                    let operation = this._Poliz[this._Position].token;
                    let res = 0;
                    if (operation === "+")
                        res = val1 + val2;
                    else if (operation === "-")
                        res = val1 - val2;
                    else if (operation === "*")
                        res = val1 * val2;
                    else if (operation === "/")
                        res = val1 / val2;
                    else if (operation === "^")
                        res = Math.pow(val1, val2);
                    this._Stack.push(new PolizItem(res.toString(), "con"));
                    this._Position++;
                }
                else
                    console.error('Invalid operation');
            }
            // else if (this._Poliz[this._Position].token === "@")
            // {
            //     let item1 = this._Stack.pop();
            //     let val1 = this.GetItemValue(item1);
            //     let res = -val1;
            //     this._Stack.push(new PolizItem(res.toString(), "con"));
            //     this._Position++;
            // }
            else if (this._Poliz[this._Position].token === ">" ||
                this._Poliz[this._Position].token === "<" ||
                this._Poliz[this._Position].token === "<=" ||
                this._Poliz[this._Position].token === ">=" ||
                this._Poliz[this._Position].token === "==" ||
                this._Poliz[this._Position].token === "!=")
            {
                let item1 = this._Stack.pop();
                let item2 = this._Stack.pop();

                let val2 = this.GetItemValue(item1);
                let val1 = this.GetItemValue(item2);

                let operation = this._Poliz[this._Position].token;

                let res = false;

                if (operation === ">")
                    res = val1 > val2;
                else if (operation === "<")
                    res = val1 < val2;
                else if (operation === "<=")
                    res = val1 <= val2;
                else if (operation === ">=")
                    res = val1 >= val2;
                else if (operation === "==")
                    res = val1 === val2;
                else if (operation === "!=")
                    res = val1 !== val2;
                this._Stack.push(new PolizItem(res.toString(), "con"));
                this._Position++;
            }
            else if (this._Poliz[this._Position].token === "=")
            {
                let item1 = this._Stack.pop();
                let item2 = this._Stack.pop();
                let val = this.GetItemValue(item1);
                let obj = new Identifier();
                let ob = new PolizCell();
                if (item2.type === "idn") {
                    obj = this._IdentifyTable.find(o => o.token === item2.token);
                    if (obj.type === "int") {
                        let res = parseInt(val);
                        obj.value = res;
                    }
                    else
                        console.error('Invalid Operation');
                }
                else if (item2.type === "cell") {
                    ob = this._PolizCells.find(o => o.cell === item2.token);
                    let res = parseInt(val);
                    ob.position = res;
                }
                this._Position++;
            }
            else if (this._Poliz[this._Position].token === "УПХ")
            {
                let item1 = this._Stack.pop();
                let item2 = this._Stack.pop();

                if (item2.token === "False") {
                    let obj = this._PolizLabels.find(o => o.label === item1.token);
                    this._Position = obj.position;
                }
                else
                    this._Position++;
            }
            else if (this._Poliz[this._Position].token === "БП") {
                let item1 = this._Stack.pop();
                let obj = this._PolizLabels.find(o => o.label === item1.token);
                this._Position = obj.position;
            }
            else if (this._Poliz[this._Position].token === "and") {
                let item1 = this._Stack.pop();
                let item2 = this._Stack.pop();
                if (item1.token === "True" && item2.token === "True")
                    this._Stack.push(new PolizItem("True", "con"));
                else
                    this._Stack.push(new PolizItem("False", "con"));

                this._Position++;
            }
            else if (this._Poliz[this._Position].token === "or")
            {
                let item1 = this._Stack.pop();
                let item2 = this._Stack.pop();
                if (item1.token === "True" || item2.token === "True")
                    this._Stack.push(new PolizItem("True", "con"));
                else
                    this._Stack.push(new PolizItem("False", "con"));
                this._Position++;
            }
            else if (this._Poliz[this._Position].token === "not")
            {
                let item1 = this._Stack.pop();
                if (item1.token === "True")
                    this._Stack.push(new PolizItem("False", "con"));
                else if (item1.token === "False")
                    this._Stack.push(new PolizItem("True", "con"));
                else
                    console.error("Not can be used with logical value");
                this._Position++;
            }
            else
            {
                console.error("undefined operation");
            }
        }
    }
    GetStack() {
        let result = "";
        for (let i = 0; i < this._Stack.length; i++)
            result += this._Stack[i].token + " ";
        return result;
    }

    GetPoliz() {
        let result = "";
        for (let i = 0; i < this._Poliz.length; i++)
            result += this._Poliz[i].token + " ";
        return result;
    }

    GetItemValue(item) {
        let result = 0;
        if (item.type === "con") {
            return parseFloat(result);
        } else if (item.type === "idn") {
            let idn = this._IdentifyTable.find(o => o.token === item.token);
            if (idn.type === "int")
                if (idn.value !== undefined) result = parseInt(idn.value);
                else console.error("The identify " + idn.token + " didn't initialized at" + this._Position);
            else console.error('invalid Argument');
        }
        else if (item.type === "cell") {
                let cell = this._PolizCells.find(o => o.cell === item.token);
                result = parseInt(cell.position);
                console.log(result);
            // }
            // for (let cell of this._PolizCells){
            //     if (cell.cell === item.token)
            //         result = cell.value;
            // }
        }
        else console.error('invalid Argument');
        return result;
    }
}