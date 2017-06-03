class PolizBuilder  {
    constructor(input) {
        this.isLoopNow = false;
        this.loopEnd = 0;
        this.loop = "";
        this.ind = false;
        this.InputItems = input;
        this.TablePriority = [];
        this.Poliz = [];
        this.PolizLabels = [];
        this.PolizCells = [];
        this.table = [];
        this._Stack = [];
        this.TablePriority.push(new PriorityTable("{", 0));
        this.TablePriority.push(new PriorityTable("if", 1));
        this.TablePriority.push(new PriorityTable("for", 1));
        this.TablePriority.push(new PriorityTable("}", 1));
        this.TablePriority.push(new PriorityTable("<<", 1));
        this.TablePriority.push(new PriorityTable("cout", 1));
        this.TablePriority.push(new PriorityTable("cin", 1));
        this.TablePriority.push(new PriorityTable(">>", 1));
        this.TablePriority.push(new PriorityTable(";", 1));
        this.TablePriority.push(new PriorityTable("(", 2));
        this.TablePriority.push(new PriorityTable("[", 2));
        this.TablePriority.push(new PriorityTable("else", 2));
        this.TablePriority.push(new PriorityTable("to", 2));
        this.TablePriority.push(new PriorityTable("step", 2));
        this.TablePriority.push(new PriorityTable("do", 2));
        this.TablePriority.push(new PriorityTable("next", 2));
        this.TablePriority.push(new PriorityTable("endif", 2));
        this.TablePriority.push(new PriorityTable(")", 3));
        this.TablePriority.push(new PriorityTable("]", 3));
        this.TablePriority.push(new PriorityTable("or", 3));
        this.TablePriority.push(new PriorityTable("=", 3));
        this.TablePriority.push(new PriorityTable("and", 4));
        this.TablePriority.push(new PriorityTable("not", 5));
        this.TablePriority.push(new PriorityTable("<", 6));
        this.TablePriority.push(new PriorityTable(">", 6));
        this.TablePriority.push(new PriorityTable("<=", 6));
        this.TablePriority.push(new PriorityTable(">=", 6));
        this.TablePriority.push(new PriorityTable("==", 6));
        this.TablePriority.push(new PriorityTable("!=", 6));
        this.TablePriority.push(new PriorityTable("+", 7));
        this.TablePriority.push(new PriorityTable("-", 7));
        this.TablePriority.push(new PriorityTable("*", 8));
        this.TablePriority.push(new PriorityTable("@", 8));
        this.TablePriority.push(new PriorityTable("/", 8));
        this.TablePriority.push(new PriorityTable("^", 9));
    }

    build() {
        while (this.InputItems.length > 0 && this.InputItems[0].token !== "{") {
            this.InputItems.splice(0,1);
        }
        while (this.InputItems.length > 0) {
            this.table.push(new Table_7(this.GetInput(), this.GetStack(), this.GetPoliz()));
            if (this.InputItems[0].type === "idn" || this.InputItems[0].type === "con") {
                this.Poliz.push(this.InputItems[0]);
                this.InputItems.splice(0,1);
            }
            else {
                if (this._Stack.length === 0) {
                    this._Stack.push(this.InputItems[0]);
                    this.InputItems.splice(0,1);
                } else {
                    if (this.InputItems[0].token === "for") {
                        let newLabel1 = "m" + (this.PolizLabels.length + 1).toString();
                        let newLabel2 = "m" + (this.PolizLabels.length + 2).toString();
                        let newLabel3 = "m" + (this.PolizLabels.length + 3).toString();
                        this.PolizLabels.push(new PolizLabel(newLabel1, this.PolizLabels.length + 1));
                        this.PolizLabels.push(new PolizLabel(newLabel2, this.PolizLabels.length + 1));
                        this.PolizLabels.push(new PolizLabel(newLabel3, this.PolizLabels.length + 1));
                        this._Stack.push(new WorkItem(newLabel3, "label"));
                        this._Stack.push(new WorkItem(newLabel2, "label"));
                        this._Stack.push(new WorkItem(newLabel1, "label"));
                        this._Stack.push(this.InputItems[0]);
                        this.InputItems.splice(0,1);
                        this.isLoopNow = true;
                        this.loopEnd++;
                        continue;
                    }
                    else if (this.InputItems[0].token === "=" && this.isLoopNow) {
                        if (this.loopEnd === 1) {
                            this.loop = this.Poliz[this.Poliz.length - 1].token;
                            this.loopEnd--;
                        }
                        this._Stack.push(this.InputItems[0]);
                        this.InputItems.splice(0,1);
                        continue;
                    } else if (this.InputItems[0].token === "to") {
                        while (this._Stack.last().token !== "for") {
                            this.Poliz.push(this._Stack.pop());
                        }
                        let newCell1 = "r" + (this.PolizCells.length + 1).toString();
                        let newCell2 = "r" + (this.PolizCells.length + 2).toString();
                        let newCell3 = "r" + (this.PolizCells.length + 3).toString();
                        this.PolizCells.push(new PolizCell(newCell1, this.PolizCells.length + 1));
                        this.PolizCells.push(new PolizCell(newCell2, this.PolizCells.length + 2));
                        this.PolizCells.push(new PolizCell(newCell3, this.PolizCells.length + 3));
                        this.Poliz.push(new WorkItem(newCell1, "cell"));
                        this.Poliz.push(new WorkItem("1", "con"));
                        this.Poliz.push(new WorkItem("=", "operation"));
                        this.Poliz.push(new WorkItem(this._Stack[1].token + ":", "label"));
                        this.Poliz.push(new WorkItem(newCell3, "cell"));
                        this.InputItems.splice(0,1);
                        continue;
                    }
                    else if (this.InputItems[0].token === "step") {
                        while (this._Stack.last().token !== "for") {
                            this.Poliz.push(this._Stack.pop());
                        }
                        this.Poliz.push(new WorkItem("=", "operation"));
                        this.Poliz.push(new WorkItem(this.PolizCells[this.PolizCells.length - 2].cell, "cell"));
                        this.InputItems.splice(0,1);
                        continue;
                    }
                    else if (this.InputItems[0].token === "do") {
                        while (this._Stack.last().token !== "for") {
                            this.Poliz.push(this._Stack.pop());
                        }
                        this.Poliz.push(new WorkItem("=", "operation"));
                        this.Poliz.push(new WorkItem(this.PolizCells[this.PolizCells.length - 3].cell, "cell"));
                        this.Poliz.push(new WorkItem("0", "con"));
                        this.Poliz.push(new WorkItem("==", "operation"));
                        this.Poliz.push(new WorkItem(this._Stack[2].token, "label"));
                        this.Poliz.push(new WorkItem("УПХ", "operation"));
                        this.Poliz.push(new WorkItem(this.loop, "idn"));
                        this.Poliz.push(new WorkItem(this.loop, "idn"));
                        this.Poliz.push(new WorkItem(this.PolizCells[this.PolizCells.length - 2].cell, "cell"));
                        this.Poliz.push(new WorkItem("+", "operation"));
                        this.Poliz.push(new WorkItem("=", "operation"));
                        this.Poliz.push(new WorkItem(this._Stack[2].token + ":", "label"));
                        this.Poliz.push(new WorkItem(this.PolizCells[this.PolizCells.length - 3].cell, "cell"));
                        this.Poliz.push(new WorkItem("0", "con"));
                        this.Poliz.push(new WorkItem("=", "operation"));
                        this.Poliz.push(new WorkItem(this.loop, "idn"));
                        this.Poliz.push(new WorkItem(this.PolizCells[this.PolizCells.length - 1].cell, "cell"));
                        this.Poliz.push(new WorkItem("-", "operation"));
                        this.Poliz.push(new WorkItem(this.PolizCells[this.PolizCells.length - 2].cell, "cell"));
                        this.Poliz.push(new WorkItem("*", "operation"));
                        this.Poliz.push(new WorkItem("0", "con"));
                        this.Poliz.push(new WorkItem("<=", "operation"));
                        this.Poliz.push(new WorkItem(this._Stack[3].token, "label"));
                        this.Poliz.push(new WorkItem("УПХ", "operation"));
                        this.InputItems.splice(0,1);
                        continue;
                    }
                    else if (this.InputItems[0].token === "cout" || this.InputItems[0].token === "cin") {
                        this._Stack.push(this.InputItems[0]);
                        this.InputItems.splice(0,1);
                        continue;
                    }
                    else if (this.InputItems[0].token === "(" || this.InputItems[0].token === "[") {
                        this._Stack.push(this.InputItems[0]);
                        this.InputItems.splice(0,1);
                        continue;
                    }
                    else if (this.InputItems[0].token === "next") {
                        while (this._Stack.last().token !== "for") {
                            if (this._Stack.last().token !== "cout" || this._Stack.last().token !== "cin")
                                this.Poliz.push(this._Stack.pop());
                            else
                                this._Stack.pop();
                        }
                        this._Stack.pop();
                        if (this._Stack.length > 1) {
                            this.Poliz.push(this._Stack.pop());
                            this._Stack.pop();
                            this.Poliz.push(new WorkItem("БП", "operation"));
                        }
                        this.Poliz.push(new WorkItem(this._Stack.pop().token + ":", "label"));
                        this.InputItems.splice(0,1);
                    } else if (this.InputItems[0].token === "if") {
                        this.ind = true;
                        this._Stack.push(this.InputItems[0]);
                        this.InputItems.splice(0,1);
                        continue;
                    }

                    let priority1 = this.GetPriority(this._Stack.last().token);
                    let priority2 = this.GetPriority(this.InputItems[0].token);
                    while (priority1 >= priority2 && this._Stack.length > 0)
                    {
                        if (this.isLoopNow && this._Stack.last().token === "for")
                            break;
                        if (this.loopEnd > 0 && this._Stack.last().token === "for")
                            break;
                        if (this._Stack.last().token === "cout" || this._Stack.last().token === "cin")
                            if (this.InputItems[0].token === "<<" || this.InputItems[0].token === ">>") {
                                break;
                            }
                            else if (this.InputItems[0].token === ";") {
                                this._Stack.pop();
                                if (this._Stack.length > 0)
                                    priority1 = this.GetPriority(this._Stack.last().token);
                                break;
                            }
                        if (this._Stack.last().token === "if") {
                            break;
                        } else {
                            this.Poliz.push(this._Stack.pop());
                            if (this._Stack.length > 0)
                                priority1 = this.GetPriority(this._Stack.last().token);
                        }
                    }
                    if (this.InputItems[0].token === ";" && this.ind === true) {
                        while (this._Stack.last().token !== "if") {
                            this.Poliz.push(this._Stack.pop());
                        }
                        let newLabel1 = "m" + (this.PolizLabels.length + 1).toString();
                        this.PolizLabels.push(new PolizLabel(newLabel1, this.PolizLabels.length + 1));
                        this._Stack.push(new WorkItem(newLabel1, "label"));
                        this.Poliz.push(new WorkItem(newLabel1, "label"));
                        this.Poliz.push(new WorkItem("УПХ", "operation"));
                        this.InputItems.splice(0,1);
                        this.ind = false;
                    }
                    else if (this.InputItems[0].token === ";") {
                        this.InputItems.splice(0,1);
                        continue;
                    }
                    else if (this.InputItems[0].token === ")" || this.InputItems[0].token === "]") {
                        while (!(this._Stack.last().token === "(" || this._Stack.last().token === "[")) {
                            this.Poliz.push(this._Stack.pop());
                        }
                        this.InputItems.splice(0,1);
                        this._Stack.pop();
                    } else if (this.InputItems[0].token === "else") {
                        let temp = [];
                        temp.push(this._Stack.pop());
                        while (this._Stack.last().type === "label")
                            temp.push(this._Stack.pop());
                        let newLabel2 = "m" + (this.PolizLabels.length + 1).toString();
                        this.PolizLabels.push(new PolizLabel(newLabel2, this.PolizLabels.length + 1));
                        this._Stack.push(new WorkItem(newLabel2, "label"));
                        this.Poliz.push(new WorkItem(newLabel2, "label"));
                        this.Poliz.push(new WorkItem("БП", "operation"));
                        while (this._Stack.last().type !== "label") {
                            this.Poliz.push(this._Stack.pop());
                        }
                        this.Poliz.push(new WorkItem(temp[temp.length - 1].token + ":", "label"));
                        this.InputItems.splice(0,1);
                    }
                    else if (this.InputItems[0].token === "endif") {
                        while (this._Stack.last().token !== "if") {
                            if (this._Stack.last().token !== "cout" && this._Stack.last().token !== "cin") {
                                if (this._Stack.last().type === "label")
                                    this.Poliz.push(new WorkItem(this._Stack.pop().token + ":", "label"));
                                else
                                    this.Poliz.push(this._Stack.pop());
                            } else
                                this._Stack.pop();
                        }
                        this._Stack.pop();
                        this.InputItems.splice(0,1);
                    }
                    else if (this.InputItems[0].token === "}") {
                        while (this._Stack.last().token !== "{") {
                            this.Poliz.push(this._Stack.pop());
                        }
                        this.InputItems.splice(0,1);
                        this._Stack.pop();
                        this.SetPosition();
                        //return;
                    } else {
                        this._Stack.push(this.InputItems[0]);
                        this.InputItems.splice(0,1);
                    }
                }
            }
        }
    }

    SetPosition() {
        for (let item in this.Poliz) {
            this.PolizLabels.forEach((label) => {
                if (item.type === "label" && item.token === label.label + ":") {
                    label.position = this.Poliz.indexOf(item) + 1;
                }
            });
        }
    };

    GetPriority(token) {
        let obj = this.TablePriority.find((o) => o.token === token);
        if (obj)
            return obj.priority;
        else
            return -1;
    };

    GetPolizString() {
        let result = "";
        for (let i = 0; i < this.Poliz.length; i++) {
            result += this.Poliz[i].token + " ";
        }
        return result;
    };

    GetInput() {
        return this.InputItems[0].token;
    };

    GetStack() {
        let result = "";
        for (let i = 0; i < this._Stack.length; i++) {
            result += this._Stack[i].token + " ";
        }
        return result;
    };

    GetPoliz() {
        let result = "";
        for (let i = 0; i < this.Poliz.length; i++) {
            result += this.Poliz[i].token + " ";
        }
        return result;
    }
}