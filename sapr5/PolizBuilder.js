Array.prototype.last = function() {
    return this[this.length-1];
};
class PolizBuilder  {
    constructor(lexemes) {
        this.inputLexemes = lexemes;
        this.isLoopNow = false;
        this.loopEnd = 0;
        this.loop = "";
        this.ind = false;
        this.priorityTable = [];
        this.poliz = [];
        this.polizLabels = [];
        this.polizCalls = [];
        this.stack = [];
        this.priorityTable.push(new Priority("begin", 0));
        this.priorityTable.push(new Priority("if", 1));
        this.priorityTable.push(new Priority("for", 1));
        this.priorityTable.push(new Priority("end", 1));
        //this.priorityTable.push(new Priority("<<", 1));
        //this.priorityTable.push(new Priority("cout", 1));
        //this.priorityTable.push(new Priority("cin", 1));
        //this.priorityTable.push(new Priority(">>", 1));
        this.priorityTable.push(new Priority("out", 1));
        this.priorityTable.push(new Priority("in", 1));
        this.priorityTable.push(new Priority(",", 1));
        this.priorityTable.push(new Priority("П", 1));
        this.priorityTable.push(new Priority("(", 2));
        //this.priorityTable.push(new Priority("[", 2));
        this.priorityTable.push(new Priority("else", 2));
        this.priorityTable.push(new Priority("to", 2));
        this.priorityTable.push(new Priority("step", 2));
        this.priorityTable.push(new Priority("do", 2));
        this.priorityTable.push(new Priority("next", 2));
        this.priorityTable.push(new Priority("endif", 2));
        this.priorityTable.push(new Priority(")", 3));
        //this.priorityTable.push(new Priority("]", 3));
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
        //this.priorityTable.push(new Priority("@", 8));
        this.priorityTable.push(new Priority("/", 8));
        this.priorityTable.push(new Priority("^", 9));
    }

    build() {
        while (this.inputLexemes.length > 0 && this.inputLexemes[0].token !== "begin") {
            this.inputLexemes.splice(0,1);
        }
        while (this.inputLexemes.length > 0) {
            if (this.inputLexemes[0].type === "idn" || this.inputLexemes[0].type === "con") {
                this.poliz.push(this.inputLexemes[0]);
                this.inputLexemes.splice(0,1);
            }
            else {
                if (this.stack.length === 0) {
                    this.stack.push(this.inputLexemes[0]);
                    this.inputLexemes.splice(0,1);
                } else {
                    if (this.inputLexemes[0].token === "for") {
                        let newLabel1 = "m" + (this.polizLabels.length + 1).toString();
                        let newLabel2 = "m" + (this.polizLabels.length + 2).toString();
                        let newLabel3 = "m" + (this.polizLabels.length + 3).toString();
                        this.polizLabels.push(new PolizLabel(newLabel1, this.polizLabels.length + 1));
                        this.polizLabels.push(new PolizLabel(newLabel2, this.polizLabels.length + 1));
                        this.polizLabels.push(new PolizLabel(newLabel3, this.polizLabels.length + 1));
                        this.stack.push(new WorkItem(newLabel3, "label"));
                        this.stack.push(new WorkItem(newLabel2, "label"));
                        this.stack.push(new WorkItem(newLabel1, "label"));
                        this.stack.push(this.inputLexemes[0]);
                        this.inputLexemes.splice(0,1);
                        this.isLoopNow = true;
                        this.loopEnd++;
                        continue;
                    }
                    else if (this.inputLexemes[0].token === "=" && this.isLoopNow) {
                        if (this.loopEnd === 1) {
                            this.loop = this.poliz.last().token;
                            this.loopEnd--;
                        }
                        this.stack.push(this.inputLexemes[0]);
                        this.inputLexemes.splice(0,1);
                        continue;
                    } else if (this.inputLexemes[0].token === "to") {
                        while (this.stack.last().token !== "for") {
                            this.poliz.push(this.stack.pop());
                        }
                        let newCell1 = "r" + (this.polizCalls.length + 1).toString();
                        let newCell2 = "r" + (this.polizCalls.length + 2).toString();
                        let newCell3 = "r" + (this.polizCalls.length + 3).toString();
                        this.polizCalls.push(new PolizCell(newCell1, this.polizCalls.length + 1));
                        this.polizCalls.push(new PolizCell(newCell2, this.polizCalls.length + 2));
                        this.polizCalls.push(new PolizCell(newCell3, this.polizCalls.length + 3));
                        this.poliz.push(new WorkItem(newCell1, "cell"));
                        this.poliz.push(new WorkItem("1", "con"));
                        this.poliz.push(new WorkItem("=", "operation"));
                        this.poliz.push(new WorkItem(this.stack[this.stack.length - 2].token + ":", "label"));
                        this.poliz.push(new WorkItem(newCell3, "cell"));
                        this.inputLexemes.splice(0,1);
                        continue;
                    }
                    else if (this.inputLexemes[0].token === "step") {
                        while (this.stack.last().token !== "for") {
                            this.poliz.push(this.stack.pop());
                        }
                        this.poliz.push(new WorkItem("=", "operation"));
                        this.poliz.push(new WorkItem(this.polizCalls[this.polizCalls.length - 2].cell, "cell"));
                        this.inputLexemes.splice(0,1);
                        continue;
                    }
                    else if (this.inputLexemes[0].token === "do") {
                        while (this.stack.last().token !== "for") {
                            this.poliz.push(this.stack.pop());
                        }
                        this.poliz.push(new WorkItem("=", "operation"));
                        this.poliz.push(new WorkItem(this.polizCalls[this.polizCalls.length - 3].cell, "cell"));
                        this.poliz.push(new WorkItem("0", "con"));
                        this.poliz.push(new WorkItem("==", "operation"));
                        this.poliz.push(new WorkItem(this.stack[this.stack.length - 3].token, "label"));
                        this.poliz.push(new WorkItem("УПХ", "operation"));
                        this.poliz.push(new WorkItem(this.loop, "idn"));
                        this.poliz.push(new WorkItem(this.loop, "idn"));
                        this.poliz.push(new WorkItem(this.polizCalls[this.polizCalls.length - 2].cell, "cell"));
                        this.poliz.push(new WorkItem("+", "operation"));
                        this.poliz.push(new WorkItem("=", "operation"));
                        this.poliz.push(new WorkItem(this.stack[this.stack.length - 3].token + ":", "label"));
                        this.poliz.push(new WorkItem(this.polizCalls[this.polizCalls.length - 3].cell, "cell"));
                        this.poliz.push(new WorkItem("0", "con"));
                        this.poliz.push(new WorkItem("=", "operation"));
                        this.poliz.push(new WorkItem(this.loop, "idn"));
                        this.poliz.push(new WorkItem(this.polizCalls[this.polizCalls.length - 1].cell, "cell"));
                        this.poliz.push(new WorkItem("-", "operation"));
                        this.poliz.push(new WorkItem(this.polizCalls[this.polizCalls.length - 2].cell, "cell"));
                        this.poliz.push(new WorkItem("*", "operation"));
                        this.poliz.push(new WorkItem("0", "con"));
                        this.poliz.push(new WorkItem("<=", "operation"));
                        this.poliz.push(new WorkItem(this.stack[this.stack.length - 4].token, "label"));
                        this.poliz.push(new WorkItem("УПХ", "operation"));
                        this.inputLexemes.splice(0,1);
                        continue;
                    }
                    // else if (this.inputLexemes[0].token === "cout" || this.inputLexemes[0].token === "cin") {
                    //     this.stack.push(this.inputLexemes[0]);
                    //     this.inputLexemes.splice(0,1);
                    //     continue;
                    // }
                    else if (this.inputLexemes[0].token === "(") {
                        this.stack.push(this.inputLexemes[0]);
                        this.inputLexemes.splice(0,1);
                        continue;
                    }
                    else if (this.inputLexemes[0].token === "next") {
                        while (this.stack.last().token !== "for") {
                            // if (this.stack.last().token !== "cout" || this.stack.last().token !== "cin")
                            //     this.poliz.push(this.stack.pop());
                            // else
                                this.stack.pop();
                        }
                        this.stack.pop();
                        if (this.stack.length > 1) {
                            this.poliz.push(this.stack.pop());
                            this.stack.pop();
                            this.poliz.push(new WorkItem("БП", "operation"));
                        }
                        this.poliz.push(new WorkItem(this.stack.pop().token + ":", "label"));
                        this.inputLexemes.splice(0,1);
                    } else if (this.inputLexemes[0].token === "if") {
                        this.ind = true;
                        this.stack.push(this.inputLexemes[0]);
                        this.inputLexemes.splice(0,1);
                        continue;
                    }
                    // console.log(this.inputLexemes);
                    if (this.inputLexemes.token === '+') debugger;
                    let priority1 = this.getPriority(this.stack.last().token);
                    let priority2 = this.getPriority(this.inputLexemes[0].token);
                    while (priority1 >= priority2 && this.stack.length > 0)
                    {
                        if (this.isLoopNow && this.stack.last().token === "for")
                            break;
                        if (this.loopEnd > 0 && this.stack.last().token === "for")
                            break;
                        // if (this.stack.last().token === "cout" || this.stack.last().token === "cin")
                        //     if (this.inputLexemes[0].token === "<<" || this.inputLexemes[0].token === ">>") {
                        //         break;
                        //     }
                        //     else if (this.inputLexemes[0].token === "П") {
                        //         this.stack.pop();
                        //         if (this.stack.length > 0)
                        //             priority1 = this.getPriority(this.stack.last().token);
                        //         break;
                        //     }
                        if (this.stack.last().token === "if") {
                            break;
                        } else {
                            this.poliz.push(this.stack.pop());
                            if (this.stack.length > 0)
                                priority1 = this.getPriority(this.stack.last().token);
                        }
                    }
                    if (this.inputLexemes[0].token === "П" && this.ind === true) {
                        while (this.stack.last().token !== "if") {
                            this.poliz.push(this.stack.pop());
                        }
                        let newLabel1 = "m" + (this.polizLabels.length + 1).toString();
                        this.polizLabels.push(new PolizLabel(newLabel1, this.polizLabels.length + 1));
                        this.stack.push(new WorkItem(newLabel1, "label"));
                        this.poliz.push(new WorkItem(newLabel1, "label"));
                        this.poliz.push(new WorkItem("УПХ", "operation"));
                        this.inputLexemes.splice(0,1);
                        this.ind = false;
                    }
                    else if (this.inputLexemes[0].token === "П") {
                        this.inputLexemes.splice(0,1);
                        continue;
                    }
                    else if (this.inputLexemes[0].token === ")") {
                        while (!(this.stack.last().token === "(")) {
                            this.poliz.push(this.stack.pop());
                        }
                        this.inputLexemes.splice(0,1);
                        this.stack.pop();
                    } else if (this.inputLexemes[0].token === "else") {
                        let temp = [];
                        temp.push(this.stack.pop());
                        while (this.stack.last().type === "label")
                            temp.push(this.stack.pop());
                        let newLabel2 = "m" + (this.polizLabels.length + 1).toString();
                        this.polizLabels.push(new PolizLabel(newLabel2, this.polizLabels.length + 1));
                        this.stack.push(new WorkItem(newLabel2, "label"));
                        this.poliz.push(new WorkItem(newLabel2, "label"));
                        this.poliz.push(new WorkItem("БП", "operation"));
                        while (this.stack.last().type !== "label") {
                            this.poliz.push(this.stack.pop());
                        }
                        this.poliz.push(new WorkItem(temp[temp.length - 1].token + ":", "label"));
                        this.inputLexemes.splice(0,1);
                    }
                    else if (this.inputLexemes[0].token === "endif") {
                        while (this.stack.last().token !== "if") {
                            if (this.stack.last().token !== "cout" && this.stack.last().token !== "cin") {
                                if (this.stack.last().type === "label")
                                    this.poliz.push(new WorkItem(this.stack.pop().token + ":", "label"));
                                else
                                    this.poliz.push(this.stack.pop());
                            } else
                                this.stack.pop();
                        }
                        this.stack.pop();
                        this.inputLexemes.splice(0,1);
                    }
                    else if (this.inputLexemes[0].token === "end") {
                        while (this.stack.last().token !== "begin") {
                            this.poliz.push(this.stack.pop());
                        }
                        this.inputLexemes.splice(0,1);
                        this.stack.pop();
                        this.SetPosition();
                        //return;
                    } else {
                        this.stack.push(this.inputLexemes[0]);
                        this.inputLexemes.splice(0,1);
                    }
                }
            }
        }
    }

    SetPosition() {
        for (let item in this.poliz) {
            this.polizLabels.forEach((label) => {
                if (item.type === "label" && item.token === label.label + ":") {
                    label.position = this.poliz.indexOf(item) + 1;
                }
            });
        }
    };

    getPriority(token) {
        let obj = this.priorityTable.find((o) => o.token === token);
        return obj ? obj.priority : -1;
    };
}