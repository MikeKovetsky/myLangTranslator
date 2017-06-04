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
        this.polizLabels = [];
        this.polizCalls = [];
        this.stack = [];
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
        let poliz = [];
        while (inputLexemes.length > 0 && inputLexemes[0].token !== "begin") {
            inputLexemes.splice(0,1);
        }
        while (inputLexemes.length > 0) {
            if (inputLexemes[0].type === "idn" || inputLexemes[0].type === "con") {
                poliz.push(inputLexemes[0]);
                inputLexemes.splice(0,1);
            }
            else {
                if (this.stack.length === 0) {
                    this.stack.push(inputLexemes[0]);
                    inputLexemes.splice(0,1);
                } else {
                    if (inputLexemes[0].token === "for") {
                        let newLabel1 = "m" + (this.polizLabels.length + 1).toString();
                        let newLabel2 = "m" + (this.polizLabels.length + 2).toString();
                        let newLabel3 = "m" + (this.polizLabels.length + 3).toString();
                        this.polizLabels.push(new PolizLabel(newLabel1, this.polizLabels.length + 1));
                        this.polizLabels.push(new PolizLabel(newLabel2, this.polizLabels.length + 1));
                        this.polizLabels.push(new PolizLabel(newLabel3, this.polizLabels.length + 1));
                        this.stack.push(new PolizItem(newLabel3, "label"));
                        this.stack.push(new PolizItem(newLabel2, "label"));
                        this.stack.push(new PolizItem(newLabel1, "label"));
                        this.stack.push(inputLexemes[0]);
                        inputLexemes.splice(0,1);
                        this.isLoopNow = true;
                        this.loopEnd++;
                        continue;
                    }
                    else if (inputLexemes[0].token === "=" && this.isLoopNow) {
                        if (this.loopEnd === 1) {
                            this.loop = poliz.last().token;
                            this.loopEnd--;
                        }
                        this.stack.push(inputLexemes[0]);
                        inputLexemes.splice(0,1);
                        continue;
                    } else if (inputLexemes[0].token === "to") {
                        while (this.stack.last().token !== "for") {
                            poliz.push(this.stack.pop());
                        }
                        let newCell1 = "r" + (this.polizCalls.length + 1).toString();
                        let newCell2 = "r" + (this.polizCalls.length + 2).toString();
                        let newCell3 = "r" + (this.polizCalls.length + 3).toString();
                        this.polizCalls.push(new PolizCell(newCell1, this.polizCalls.length + 1));
                        this.polizCalls.push(new PolizCell(newCell2, this.polizCalls.length + 2));
                        this.polizCalls.push(new PolizCell(newCell3, this.polizCalls.length + 3));
                        poliz.push(new PolizItem(newCell1, "cell"));
                        poliz.push(new PolizItem("1", "con"));
                        poliz.push(new PolizItem("=", "operation"));
                        poliz.push(new PolizItem(this.stack[this.stack.length - 2].token + ":", "label"));
                        poliz.push(new PolizItem(newCell3, "cell"));
                        inputLexemes.splice(0,1);
                        continue;
                    }
                    else if (inputLexemes[0].token === "step") {
                        while (this.stack.last().token !== "for") {
                            poliz.push(this.stack.pop());
                        }
                        poliz.push(new PolizItem("=", "operation"));
                        poliz.push(new PolizItem(this.polizCalls[this.polizCalls.length - 2].cell, "cell"));
                        inputLexemes.splice(0,1);
                        continue;
                    }
                    else if (inputLexemes[0].token === "do") {
                        while (this.stack.last().token !== "for") {
                            poliz.push(this.stack.pop());
                        }
                        poliz.push(new PolizItem("=", "operation"));
                        poliz.push(new PolizItem(this.polizCalls[this.polizCalls.length - 3].cell, "cell"));
                        poliz.push(new PolizItem("0", "con"));
                        poliz.push(new PolizItem("==", "operation"));
                        poliz.push(new PolizItem(this.stack[this.stack.length - 3].token, "label"));
                        poliz.push(new PolizItem("УПХ", "operation"));
                        poliz.push(new PolizItem(this.loop, "idn"));
                        poliz.push(new PolizItem(this.loop, "idn"));
                        poliz.push(new PolizItem(this.polizCalls[this.polizCalls.length - 2].cell, "cell"));
                        poliz.push(new PolizItem("+", "operation"));
                        poliz.push(new PolizItem("=", "operation"));
                        poliz.push(new PolizItem(this.stack[this.stack.length - 3].token + ":", "label"));
                        poliz.push(new PolizItem(this.polizCalls[this.polizCalls.length - 3].cell, "cell"));
                        poliz.push(new PolizItem("0", "con"));
                        poliz.push(new PolizItem("=", "operation"));
                        poliz.push(new PolizItem(this.loop, "idn"));
                        poliz.push(new PolizItem(this.polizCalls[this.polizCalls.length - 1].cell, "cell"));
                        poliz.push(new PolizItem("-", "operation"));
                        poliz.push(new PolizItem(this.polizCalls[this.polizCalls.length - 2].cell, "cell"));
                        poliz.push(new PolizItem("*", "operation"));
                        poliz.push(new PolizItem("0", "con"));
                        poliz.push(new PolizItem("<=", "operation"));
                        poliz.push(new PolizItem(this.stack[this.stack.length - 4].token, "label"));
                        poliz.push(new PolizItem("УПХ", "operation"));
                        inputLexemes.splice(0,1);
                        continue;
                    }
                        else if (inputLexemes[0].token === "out" || inputLexemes[0].token === "in"){
                        this.stack.push(inputLexemes[0]);
                        inputLexemes.splice(0,1);
                        continue;
                    }
                    else if (inputLexemes[0].token === "(") {
                        if (this.stack.last().token === "out" || this.stack.last().token === "in"){
                            inputLexemes.splice(0,1);
                            continue;
                        } else {
                            this.stack.push(inputLexemes[0]);
                            inputLexemes.splice(0,1);
                            continue;
                        }
                    }
                    else if (inputLexemes[0].token === ","){
                        if (this.stack.last().token === "out"){
                            poliz.push(new PolizItem("RD", "operation"));
                        } else if (this.stack.last().token === "in"){
                            poliz.push(new PolizItem("WR", "operation"));
                        }
                        inputLexemes.splice(0,1);
                        continue;
                    }
                    else if (inputLexemes[0].token === "next") {
                        while (this.stack.last().token !== "for") {
                            if (this.stack.last().token !== "out" || this.stack.last().token !== "in")
                                 poliz.push(this.stack.pop());
                             else
                                this.stack.pop();
                        }
                        this.stack.pop();
                        if (this.stack.length > 1) {
                            poliz.push(this.stack.pop());
                            this.stack.pop();
                            poliz.push(new PolizItem("БП", "operation"));
                        }
                        poliz.push(new PolizItem(this.stack.pop().token + ":", "label"));
                        inputLexemes.splice(0,1);
                    } else if (inputLexemes[0].token === "if") {
                        this.ind = true;
                        this.stack.push(inputLexemes[0]);
                        inputLexemes.splice(0,1);
                        continue;
                    }
                    let priority1 = this.getPriority(this.stack.last().token);
                    let priority2 = this.getPriority(inputLexemes[0].token);
                    while (priority1 >= priority2 && this.stack.length > 0)
                    {
                        if (this.isLoopNow && this.stack.last().token === "for")
                            break;
                        if (this.loopEnd > 0 && this.stack.last().token === "for")
                            break;
                        if (this.stack.last().token === "out" || this.stack.last().token === "in")
                            if (inputLexemes[0].token === ",") {
                                break;
                            }
                            else if (inputLexemes[0].token === "П") {
                                this.stack.pop();
                                if (this.stack.length > 0)
                                    priority1 = this.getPriority(this.stack.last().token);
                                break;
                            }
                        if (this.stack.last().token === "if") {
                            break;
                        } else {
                            poliz.push(this.stack.pop());
                            if (this.stack.length > 0)
                                priority1 = this.getPriority(this.stack.last().token);
                        }
                    }
                    if (inputLexemes[0].token === "П" && this.ind === true) {
                        while (this.stack.last().token !== "if") {
                            poliz.push(this.stack.pop());
                        }
                        let newLabel1 = "m" + (this.polizLabels.length + 1).toString();
                        this.polizLabels.push(new PolizLabel(newLabel1, this.polizLabels.length + 1));
                        this.stack.push(new PolizItem(newLabel1, "label"));
                        poliz.push(new PolizItem(newLabel1, "label"));
                        poliz.push(new PolizItem("УПХ", "operation"));
                        inputLexemes.splice(0,1);
                        this.ind = false;
                    }
                    else if (inputLexemes[0].token === "П") {
                        inputLexemes.splice(0,1);
                        continue;
                    }
                    else if (inputLexemes[0].token === ")") {
                        while (!(this.stack.last().token === "out" || this.stack.last().token === "in")) {
                            poliz.push(this.stack.pop());
                        }
                        if (this.stack.last().token === "out"){
                            poliz.push(new PolizItem("RD", "operation"));
                        } else if (this.stack.last().token === "in") {
                            poliz.push(new PolizItem("WR", "operation"));
                        }
                        inputLexemes.splice(0,1);
                        this.stack.pop();
                    } else if (inputLexemes[0].token === "else") {
                        let temp = [];
                        temp.push(this.stack.pop());
                        while (this.stack.last().type === "label")
                            temp.push(this.stack.pop());
                        let newLabel2 = "m" + (this.polizLabels.length + 1).toString();
                        this.polizLabels.push(new PolizLabel(newLabel2, this.polizLabels.length + 1));
                        this.stack.push(new PolizItem(newLabel2, "label"));
                        poliz.push(new PolizItem(newLabel2, "label"));
                        poliz.push(new PolizItem("БП", "operation"));
                        while (this.stack.last().type !== "label") {
                            poliz.push(this.stack.pop());
                        }
                        poliz.push(new PolizItem(temp[temp.length - 1].token + ":", "label"));
                        inputLexemes.splice(0,1);
                    }
                    else if (inputLexemes[0].token === "endif") {
                        while (this.stack.last().token !== "if") {
                            if (this.stack.last().token !== "out" && this.stack.last().token !== "in") {
                                if (this.stack.last().type === "label")
                                    poliz.push(new PolizItem(this.stack.pop().token + ":", "label"));
                                else
                                    poliz.push(this.stack.pop());
                            } else
                                this.stack.pop();
                        }
                        this.stack.pop();
                        inputLexemes.splice(0,1);
                    }
                    else if (inputLexemes[0].token === "end") {
                        while (this.stack.last().token !== "begin") {
                            poliz.push(this.stack.pop());
                        }
                        inputLexemes.splice(0,1);
                        this.stack.pop();
                        this.SetPosition();
                        //return;
                    } else {
                        this.stack.push(inputLexemes[0]);
                        inputLexemes.splice(0,1);
                    }
                }
            }
        }
        return poliz;
    }

    SetPosition(poliz) {
        for (let item in this.poliz) {
            this.polizLabels.forEach((label) => {
                if (item.type === "label" && item.token === label.label + ":") {
                    label.position = poliz.indexOf(item) + 1;
                }
            });
        }
    };

    getPriority(token) {
        let obj = this.priorityTable.find((o) => o.token === token);
        return obj ? obj.priority : -1;
    };
}