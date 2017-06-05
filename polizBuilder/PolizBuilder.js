Array.prototype.last = function() {
    return this[this.length-1];
};
class PolizBuilder  {
    constructor() {
        this.isLoopNow = false;
        this.loopEnd = 0;
        this.loop = "";
        this.ind = false;
        this.priorityTable = [];
        this.priorityTable.push(new Priority("begin", 0));
        this.priorityTable.push(new Priority("if", 1));
        this.priorityTable.push(new Priority("for", 1));
        this.priorityTable.push(new Priority("end", 1));
        this.priorityTable.push(new Priority("out", 1));
        this.priorityTable.push(new Priority("in", 1));
        this.priorityTable.push(new Priority(",", 1));
        this.priorityTable.push(new Priority("П", 1));
        this.priorityTable.push(new Priority("(", 2));
        this.priorityTable.push(new Priority("else", 2));
        this.priorityTable.push(new Priority("to", 2));
        this.priorityTable.push(new Priority("step", 2));
        this.priorityTable.push(new Priority("do", 2));
        this.priorityTable.push(new Priority("next", 2));
        this.priorityTable.push(new Priority("endif", 2));
        this.priorityTable.push(new Priority(")", 3));
        this.priorityTable.push(new Priority("or", 3));
        this.priorityTable.push(new Priority("=", 3));
        this.priorityTable.push(new Priority("and", 4));
        this.priorityTable.push(new Priority("not", 5));
        this.priorityTable.push(new Priority("<", 6));
        this.priorityTable.push(new Priority(">", 6));
        this.priorityTable.push(new Priority("<=", 6));
        this.priorityTable.push(new Priority(">=", 6));
        this.priorityTable.push(new Priority("==", 6));
        this.priorityTable.push(new Priority("!=", 6));
        this.priorityTable.push(new Priority("+", 7));
        this.priorityTable.push(new Priority("-", 7));
        this.priorityTable.push(new Priority("*", 8));
        this.priorityTable.push(new Priority("/", 8));
        this.priorityTable.push(new Priority("^", 9));
    }

    build(inputLexemes) {
        let polizLabels = [];
        let stack = [];
        let poliz = [];
        let polizCells = [];
        while (inputLexemes.length > 0 && inputLexemes[0].token !== "begin") {
            inputLexemes.splice(0,1);
        }
        while (inputLexemes.length > 0) {
            if (['idn', 'con'].includes(inputLexemes[0].type)) {
                poliz.push(inputLexemes[0]);
                inputLexemes.splice(0,1);
                continue;
            }
            if (stack.length === 0) {
                stack.push(inputLexemes[0]);
                inputLexemes.splice(0,1);
                continue;
            }
            switch (inputLexemes[0].token) {
                case "for":
                    let newLabel1 = "m" + (polizLabels.length + 1).toString();
                    let newLabel2 = "m" + (polizLabels.length + 2).toString();
                    let newLabel3 = "m" + (polizLabels.length + 3).toString();
                    polizLabels.push(new PolizLabel(newLabel1, polizLabels.length + 1));
                    polizLabels.push(new PolizLabel(newLabel2, polizLabels.length + 1));
                    polizLabels.push(new PolizLabel(newLabel3, polizLabels.length + 1));
                    stack.push(new PolizItem(newLabel3, "label"));
                    stack.push(new PolizItem(newLabel2, "label"));
                    stack.push(new PolizItem(newLabel1, "label"));
                    stack.push(inputLexemes[0]);
                    inputLexemes.splice(0,1);
                    this.isLoopNow = true;
                    this.loopEnd++;
                    continue;
                case "=":
                    if (this.isLoopNow) {
                        if (this.loopEnd === 1) {
                            this.loop = poliz.last().token;
                            this.loopEnd--;
                        }
                        stack.push(inputLexemes[0]);
                        inputLexemes.splice(0,1);
                        continue;
                    }
                    break;
                case "to":
                    while (stack.last().token !== "for") {
                        poliz.push(stack.pop());
                    }
                    let newCell1 = "r" + (polizCells.length + 1).toString();
                    let newCell2 = "r" + (polizCells.length + 2).toString();
                    let newCell3 = "r" + (polizCells.length + 3).toString();
                    polizCells.push(new PolizCell(newCell1, polizCells.length + 1));
                    polizCells.push(new PolizCell(newCell2, polizCells.length + 2));
                    polizCells.push(new PolizCell(newCell3, polizCells.length + 3));
                    poliz.push(new PolizItem(newCell1, "cell"));
                    poliz.push(new PolizItem("1", "con"));
                    poliz.push(new PolizItem("=", "operation"));
                    poliz.push(new PolizItem(stack[stack.length - 2].token + ":", "label"));
                    poliz.push(new PolizItem(newCell3, "cell"));
                    inputLexemes.splice(0,1);
                    continue;
                case "step":
                    while (stack.last().token !== "for") {
                        poliz.push(stack.pop());
                    }
                    poliz.push(new PolizItem("=", "operation"));
                    poliz.push(new PolizItem(polizCells[polizCells.length - 2].cell, "cell"));
                    inputLexemes.splice(0,1);
                    continue;
                case "do":
                    while (stack.last().token !== "for") {
                        poliz.push(stack.pop());
                    }
                    poliz.push(new PolizItem("=", "operation"));
                    poliz.push(new PolizItem(polizCells[polizCells.length - 3].cell, "cell"));
                    poliz.push(new PolizItem("0", "con"));
                    poliz.push(new PolizItem("==", "operation"));
                    poliz.push(new PolizItem(stack[stack.length - 3].token, "label"));
                    poliz.push(new PolizItem("УПХ", "operation"));
                    poliz.push(new PolizItem(this.loop, "idn"));
                    poliz.push(new PolizItem(this.loop, "idn"));
                    poliz.push(new PolizItem(polizCells[polizCells.length - 2].cell, "cell"));
                    poliz.push(new PolizItem("+", "operation"));
                    poliz.push(new PolizItem("=", "operation"));
                    poliz.push(new PolizItem(stack[stack.length - 3].token + ":", "label"));
                    poliz.push(new PolizItem(polizCells[polizCells.length - 3].cell, "cell"));
                    poliz.push(new PolizItem("0", "con"));
                    poliz.push(new PolizItem("=", "operation"));
                    poliz.push(new PolizItem(this.loop, "idn"));
                    poliz.push(new PolizItem(polizCells[polizCells.length - 1].cell, "cell"));
                    poliz.push(new PolizItem("-", "operation"));
                    poliz.push(new PolizItem(polizCells[polizCells.length - 2].cell, "cell"));
                    poliz.push(new PolizItem("*", "operation"));
                    poliz.push(new PolizItem("0", "con"));
                    poliz.push(new PolizItem("<=", "operation"));
                    poliz.push(new PolizItem(stack[stack.length - 4].token, "label"));
                    poliz.push(new PolizItem("УПХ", "operation"));
                    inputLexemes.splice(0,1);
                    continue;
                case "out": case "in":
                    stack.push(inputLexemes[0]);
                    inputLexemes.splice(0,1);
                    continue;
                case "(":
                    if (stack.last().token === "out" || stack.last().token === "in"){
                        inputLexemes.splice(0,1);
                        continue;
                    } else {
                        stack.push(inputLexemes[0]);
                        inputLexemes.splice(0,1);
                        continue;
                    }
                case ",":
                    if (stack.last().token === "out") {
                        poliz.push(new PolizItem("WR", "operation"));
                    }
                    if (stack.last().token === "in") {
                        poliz.push(new PolizItem("RD", "operation"));
                    }
                    inputLexemes.splice(0,1);
                    break;
                case "next":
                    while (stack.last().token !== "for") {
                        if (stack.last().token !== "out" || stack.last().token !== "in")
                            poliz.push(stack.pop());
                        else
                            stack.pop();
                    }
                    stack.pop();
                    if (stack.length > 1) {
                        poliz.push(stack.pop());
                        stack.pop();
                        poliz.push(new PolizItem("БП", "operation"));
                    }
                    poliz.push(new PolizItem(stack.pop().token + ":", "label"));
                    inputLexemes.splice(0,1);
                    break;
                case "if":
                    this.ind = true;
                    stack.push(inputLexemes[0]);
                    inputLexemes.splice(0,1);
                    continue;
            }
            //
            let priority1 = this.getPriority(stack.last().token);
            let priority2 = this.getPriority(inputLexemes[0].token);
            while (priority1 >= priority2 && stack.length > 0) {
                if (this.isLoopNow && stack.last().token === "for")
                    break;
                if (this.loopEnd > 0 && stack.last().token === "for")
                    break;
                if (stack.last().token === "out" || stack.last().token === "in") {
                    if (inputLexemes[0].token === ",") {
                        break;
                    }
                    else if (inputLexemes[0].token === "П") {
                        stack.pop();
                        if (stack.length > 0)
                            priority1 = this.getPriority(stack.last().token);
                        break;
                    }
                }
                if (stack.last().token === "if") {
                    break;
                } else {
                    poliz.push(stack.pop());
                    if (stack.length > 0)
                        priority1 = this.getPriority(stack.last().token);
                }
            }

            switch (inputLexemes[0].token) {
                case "П":
                    if (this.ind === true) {
                        while (stack.last().token !== "if") {
                            poliz.push(stack.pop());
                        }
                        let newLabel1 = "m" + (polizLabels.length + 1).toString();
                        polizLabels.push(new PolizLabel(newLabel1, polizLabels.length + 1));
                        stack.push(new PolizItem(newLabel1, "label"));
                        poliz.push(new PolizItem(newLabel1, "label"));
                        poliz.push(new PolizItem("УПХ", "operation"));
                        inputLexemes.splice(0,1);
                        this.ind = false;
                    } else {
                        inputLexemes.splice(0,1);
                        continue;
                    }
                    break;
                case ")":
                    while (!(stack.last().token === "out" || stack.last().token === "in")) {
                        poliz.push(stack.pop());
                    }
                    if (stack.last().token === "out"){
                        poliz.push(new PolizItem("WR", "operation"));
                    } else if (stack.last().token === "in") {
                        poliz.push(new PolizItem("RD", "operation"));
                    }
                    inputLexemes.splice(0,1);
                    stack.pop();
                    break;
                case "else":
                    let temp = [];
                    temp.push(stack.pop());
                    while (stack.last().type === "label")
                        temp.push(stack.pop());
                    let newLabel2 = "m" + (polizLabels.length + 1).toString();
                    polizLabels.push(new PolizLabel(newLabel2, polizLabels.length + 1));
                    stack.push(new PolizItem(newLabel2, "label"));
                    poliz.push(new PolizItem(newLabel2, "label"));
                    poliz.push(new PolizItem("БП", "operation"));
                    while (stack.last().type !== "label") {
                        poliz.push(stack.pop());
                    }
                    poliz.push(new PolizItem(temp[temp.length - 1].token + ":", "label"));
                    inputLexemes.splice(0,1);
                    break;
                case "endif":
                    while (stack.last().token !== "if") {
                        if (stack.last().token !== "out" && stack.last().token !== "in") {
                            if (stack.last().type === "label")
                                poliz.push(new PolizItem(stack.pop().token + ":", "label"));
                            else
                                poliz.push(stack.pop());
                        } else
                            stack.pop();
                    }
                    stack.pop();
                    inputLexemes.splice(0,1);
                    break;
                case "end":
                    while (stack.last().token !== "begin") {
                        poliz.push(stack.pop());
                    }
                    inputLexemes.splice(0,1);
                    stack.pop();
                    this.SetPosition(poliz, polizLabels);
                    break;
                default:
                    stack.push(inputLexemes[0]);
                    inputLexemes.splice(0,1);
            }
        }
        return {
            chain: poliz, polizLabels, polizCells
        };
    }

    SetPosition(poliz, polizLabels) {
        for (let item of poliz) {
            polizLabels.forEach((label) => {
                if (item.type === "label" && item.token === label.label + ":") {
                    label.position = poliz.indexOf(item) + 1;
                    console.log(label);
                }
            });
        }
    };

    getPriority(token) {
        let obj = this.priorityTable.find((o) => o.token === token);
        return obj ? obj.priority : -1;
    };
}