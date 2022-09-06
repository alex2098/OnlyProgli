function currentComand(comands) {
    let current_comand = [];
    for (let i = 0, k = 1; i < comands.length; i++) {
        if (Array.isArray(comands[i])) {
            current_comand.push(null);
        }
        else {
            current_comand.push(k);
            k++;
        }
    }
    return current_comand;
}

function numberingCycle(comands) {
    let copy_comands = [...comands];
    let comand = [...comands];
    for (let i = 0; i < copy_comands.length; i++) {
        if (copy_comands[i] === "end_cycle") {
            for (let j = i - 1; j >= 0; j--) {
                if (Array.isArray(copy_comands[j]) &&
                    (copy_comands[j][0] === "begin_cycle_number" ||
                        copy_comands[j][0] === "begin_cycle_check")) {
                    comand[i] = ["end_cycle", j];
                    copy_comands.splice(j, 1, " ");
                    break;
                }
            }
        }
    }
    return comand;
}

function newCoord(d, x, y) {
    let x_new = 0, y_new = 0;
    if (d === 0) {
        x_new = x - 1;
        y_new = y;
    }
    if (d === 1) {
        x_new = x;
        y_new = y + 1;
    }
    if (d === 2) {
        x_new = x + 1;
        y_new = y;
    }
    if (d === 3) {
        x_new = x;
        y_new = y - 1;
    }
    return [x_new, y_new];
}

function checkNo(comand_1, comand_2) {
    if ((comand_2 === "if_right" ||
        comand_2 === "if_left" ||
        comand_2 === "if_forward" ||
        comand_2 === "if_back") && 
        (comand_1 === "no" ||
        comand_1 === "or" ||
        comand_1 === "and" ||
        comand_1 === "check" ||
        comand_1 === "begin_cycle_check")) {
        return true;
    }
    return false;
}

function checkAndOr(comand_1, comand_2) {
    if ((comand_1 === "if_right" ||
        comand_1 === "if_left" ||
        comand_1 === "if_forward" ||
        comand_1 === "if_back" ||
        comand_1 === "check" ||
        comand_1 === "begin_cycle_check") &&
        (comand_2 === "if_right" ||
        comand_2 === "if_left" ||
        comand_2 === "if_forward" ||
        comand_2 === "if_back" ||
        comand_2 === "no")) {
        return true;
    }
    return false;
}

function checkElement(comand_1, comand_2) {
    if ((comand_1 === "no" ||
        comand_1 === "or" ||
        comand_1 === "and" ||
        comand_1 === "check" ||
        comand_1 === "begin_cycle_check") &&
        (comand_2 === "or" ||
        comand_2 === "and" ||
        comand_2 === undefined)) {
        return true;
    }
    return false;
}

function checkIf(comand) {
    for (let i = 0; i < comand.length; i++) {
        if (Array.isArray(comand[i])) {
            if (comand[i][0] === "check" ||
                comand[i][0] === "begin_cycle_check") {
                if (comand[i].length === 1) {
                    return "Ошибка. Нету условий в проверке!";
                }
                if (comand[i].length === 2 &&
                    (comand[i][1] === "no" ||
                        comand[i][1] === "and" ||
                        comand[i][1] === "or")) {
                    return "Ошибка. Неправильно составленное условие!";
                }
                for (let j = 1; j < comand[i].length; j++) {
                    if (comand[i][j] === "no" &&
                        !checkNo(comand[i][j - 1], comand[i][j + 1])) {
                        return "Ошибка. Неправильно составленное условие!";
                    }
                    if ((comand[i][j] === "or" ||
                        comand[i][j] === "and") &&
                        !checkAndOr(comand[i][j - 1], comand[i][j + 1])) {
                        return "Ошибка. Неправильно составленное условие!";
                    }
                    if ((comand[i][j] === "if_right" ||
                        comand[i][j] === "if_left" ||
                        comand[i][j] === "if_forward" ||
                        comand[i][j] === "if_back") &&
                        !checkElement(comand[i][j - 1], comand[i][j + 1])) {
                        return "Ошибка. Неправильно составленное условие!";
                    }
                }
            }
        }
    }
    return null;
}

function checkCycle(comand) {
    let comands = [...comand];
    let i = 0;
    while (1) {
        if (i >= comands.length) {
            break;
        }
        if (comands[i] === "end_cycle") {
            for (let j = i - 1; j >= 0; j--) {
                if (Array.isArray(comands[j]) &&
                    (comands[j][0] === "begin_cycle_number" ||
                    comands[j][0] === "begin_cycle_check")) {
                    comands.splice(j, i - j + 1);
                    i = 0;
                    break;
                }
            }
        }
        if (comands[i] === "end_check") {
            for (let j = i - 1; j >= 0; j--) {
                if (Array.isArray(comands[j]) &&
                    (comands[j][0] === "check")) {
                    comands.splice(j, i - j + 1);
                    i = 0;
                    break;
                }
            }
        }
        i++;
    }
    for (let j = 0; j < comands.length; j++) {
        if (Array.isArray(comands[j]) &&
            (comands[j][0] === "begin_cycle_number" ||
            comands[j][0] === "begin_cycle_check")) {
            return "Ошибка. Тело цикла не закрыто!";
        }
        if (Array.isArray(comands[j]) &&
            (comands[j][0] === "check")) {
            return "Ошибка. Тело проверки условия не закрыто!";
        }
        if (comands[j] === "end_cycle") {
            return "Ошибка. У тела цикла нет начала!";
        }
        if (comands[j] === "end_check") {
            return "Ошибка. У тела проверки условия нет начала!";
        }
    }
    return null;
}

class Interpreter {
    comands = undefined;
    robot_coord = undefined;
    current_comand = undefined;
    field = undefined;
    count_item = undefined;
    current_cycle = undefined;
    direction = undefined;
    massiv_condition = undefined;
    index = undefined;
    error = undefined;
    k = undefined;
    flag = undefined;

    setOnePobot(field, comands) {
        this.comands = [numberingCycle(comands)];
        this.field = field;
        this.robot_coord = [[0, 0]];
        this.current_comand = [currentComand(this.comands[0])];
        this.count_item = [0];
        this.current_cycle = [[0, 0]];
        this.direction = [1];
        this.index = [0];
        this.error = [false];
        this.massiv_condition = new Map();
        this.k = [1];
        this.flag = [false];
    }

    setTwoPobot(field, comands_1, comands_2) {
        this.comands = [numberingCycle(comands_1), numberingCycle(comands_2)];
        this.field = field;
        this.robot_coord = [[0, 0], [field.length - 1, field[0].length - 1]];
        this.current_comand = [currentComand(this.comands[0]), currentComand(this.comands[1])];
        this.count_item = [0, 0];
        this.current_cycle = [[0, 0], [0, 0]];
        this.direction = [1, 3];
        this.index = [0, 0];
        this.error = [false, false];
        this.massiv_condition = new Map();
        this.k = [1, 1];
        this.flag = [false, false];
    }

    checkComandIf(i) {
        let check = "";
        const x = this.robot_coord[i][0], y = this.robot_coord[i][1];
        for (let j = 1; j < this.comands[i][this.index[i]].length; j++) {
            let x_new = -1, y_new = -1;
            if (this.comands[i][this.index[i]][j] === "if_right") {
                [x_new, y_new] = newCoord((this.direction[i] + 1) % 4, x, y);
            }
            if (this.comands[i][this.index[i]][j] === "if_left") {
                [x_new, y_new] = newCoord((this.direction[i] - 1) % 4, x, y);
            }
            if (this.comands[i][this.index[i]][j] === "if_forward") {
                [x_new, y_new] = newCoord(this.direction[i], x, y);
            }
            if (this.comands[i][this.index[i]][j] === "if_back") {
                [x_new, y_new] = newCoord((this.direction[i] + 2) % 4, x, y);
            }
            if (this.comands[i][this.index[i]][j] === "no") {
                check += "!";
            }
            if (this.comands[i][this.index[i]][j] === "and") {
                check += " && ";
            }
            if (this.comands[i][this.index[i]][j] === "or") {
                check += " || "; 
            }
            if (x_new !== -1 && y_new !== -1) {
                if (x_new >= this.field.length || x_new < 0 ||
                    y_new >= this.field[0].length || y_new < 0) {
                    check += "false";
                    break;
                }
                const cells = this.field[x_new][y_new].split(" ");
                if ((i === 0 && cells[0] === "field_barrier_robot_2") ||
                    (i === 1 && cells[0] === "field_barrier_robot_1") ||
                    cells[0] === "field_barrier" ||
                    (i === 0 && cells[1] === "robot_2") ||
                    (i === 1 && cells[1] === "robot_1")) {
                    check += "false";
                }
                else {
                    check += "true";
                }
            }
        }
        if (eval(check)) {
            return true;
        }
        else {
            return false;
        }
    }

    checkBigComand(i) {
        if (Array.isArray(this.comands[i][this.index[i]])) {
            if (this.comands[i][this.index[i]][0] === "begin_cycle_number") {
                if (this.flag[i]) {
                    if (this.comands[i][this.index[i]][3] > 0) {
                        this.comands[i][this.index[i]][3]--;
                        this.current_cycle[i] = [this.comands[i][this.index[i]][2], this.comands[i][this.index[i]][3]];
                        this.index[i]++;
                    }
                    else {
                        for (let m = this.index[i]; m < this.comands[i].length; m++) {
                            if (this.comands[i][m][0] === "end_cycle" &&
                                this.comands[i][m][1] === this.index[i]) {
                                this.index[i] = m + 1;
                                break;
                            }
                        }
                        this.current_cycle[i] = [0, 0];
                        if (this.index[i] >= this.comands[i].length) {
                            this.error[i] = true;
                            return;
                        }
                    }
                }
                else {
                    this.comands[i][this.index[i]][2] = this.k[i];
                    this.comands[i][this.index[i]][3] = this.comands[i][this.index[i]][1] - 1;
                    this.current_cycle[i] = [this.comands[i][this.index[i]][2], this.comands[i][this.index[i]][3]];
                    this.k[i]++;
                    this.index[i]++;
                }
                this.flag[i] = false;
            }
            if (this.comands[i][this.index[i]][0] === "begin_cycle_check") {
                if (this.checkComandIf(i)) {
                    if (!this.flag[i]) {
                        this.comands[i][this.index[i]].push(this.k[i]);
                        this.k[i]++;
                    }
                    this.current_cycle[i] = [this.comands[i][this.index[i]][this.comands[i][this.index[i]].length - 1], 1];
                    this.index[i]++;
                    this.flag[i] = false;
                }
                else {
                    for (let m = this.index[i]; m < this.comands[i].length; m++) {
                        if (this.comands[i][m][0] === "end_cycle" &&
                            this.comands[i][m][1] === this.index[i]) {
                            this.index[i] = m + 1;
                            break;
                        }
                    }
                    this.current_cycle[i] = [0, 0];
                    if (this.index[i] >= this.comands[i].length) {
                        this.error[i] = true;
                        return;
                    }
                }
            }
            if (this.comands[i][this.index[i]][0] === "check") {
                if (!this.checkComandIf(i)) {
                    for (let m = this.index[i]; m < this.comands[i].length; m++) {
                        if (this.comands[i][m][0] === "end_cycle" &&
                            this.comands[i][m][1] === this.index[i]) {
                            this.index[i] = m + 1;
                            break;
                        }
                    }
                    if (this.index[i] >= this.comands[i].length) {
                        this.error[i] = true;
                        return;
                    }
                }
                else {
                    this.index[i]++;
                }
            }
            if (this.comands[i][this.index[i]][0] === "end_cycle") {
                this.index[i] = this.comands[i][this.index[i]][1];
                this.flag[i] = true;
            }
            return this.checkBigComand(i);
        }
    }

    computationRobot(i) {
        if (this.index[i] >= this.comands[i].length) {
            this.error[i] = true;
            return;
        }
        this.checkBigComand(i);
        const old_x = this.robot_coord[i][0];
        const old_y = this.robot_coord[i][1];
        if (this.comands[i][this.index[i]] === "paint") {
            const cells = this.field[old_x][old_y].split(" ");
            this.field[old_x][old_y] = "field_barrier_robot_" +
                (i + 1).toString() + " " +
                cells[1] + " " + cells[2];
        }
        if (this.comands[i][this.index[i]] === "rotate_right") {
            this.direction[i] = (this.direction[i] + 1) % 4;
            const cells = this.field[old_x][old_y].split(" ");
            this.field[old_x][old_y] = cells[0] + " " +
                cells[1] + " robot_direction_" +
                this.direction[i].toString();
        }
        if (this.comands[i][this.index[i]] === "rotate_left") {
            this.direction[i] = (this.direction[i] - 1) % 4;
            const cells = this.field[old_x][old_y].split(" ");
            this.field[old_x][old_y] = cells[0] + " " +
                cells[1] + " robot_direction_" +
                this.direction[i].toString();
        }
        if (this.comands[i][this.index[i]] === "forward") {
            let [x, y] = newCoord(this.direction[i], old_x, old_y);
            if (x >= this.field.length || x < 0 ||
                y >= this.field[0].length || y < 0) {
                this.error[i] = true;
                return;
            }
            const cells = this.field[x][y].split(" ");
            if ((i === 0 && cells[0] === "field_barrier_robot_2") ||
                (i === 1 && cells[0] === "field_barrier_robot_1") ||
                cells[0] === "field_barrier" ||
                (i === 0 && cells[1] === "robot_2") ||
                (i === 1 && cells[1] === "robot_1")) {
                this.error[i] = true;
                return;
            }
            else {
                this.robot_coord[i] = [x, y];
                if (cells[0] === "field_item") {
                    this.count_item[i]++;
                    cells[0] = "field_public";
                }

                this.robot_coord[i] = [x, y];
                const cells_old = this.field[old_x][old_y].split(" ");
                this.field[old_x][old_y] = cells_old[0];
                this.field[x][y] = cells[0] + " robot_" +
                    (i + 1).toString() + " robot_direction_" +
                    this.direction[i].toString();
            }
        }
        return;
    }

    computationOneRobot() {
        this.computationRobot(0);
        if (this.error[0]) {
            return null;
        }
        else { 
            let str = this.robot_coord.toString() +
                this.current_comand[0][this.index[0]].toString() +
                this.field.toString() +
                this.count_item.toString();
            if (this.current_cycle[0][0] !== 0) {
                str += this.current_cycle.toString();
            }
            this.index[0]++;
            if (this.massiv_condition.has(str)) {
                return null;
            }
            else {
                this.massiv_condition.set(str, str);
                return this.field;
            }
        }
    }

    computationTwoRobot() {
        this.computationRobot(0);
        this.computationRobot(1);
        if (this.error[0] && this.error[1]) {
            return null;
        }
        else {
            let str = this.robot_coord.toString() +
                this.current_comand[0][this.index[0]].toString() +
                this.current_comand[1][this.index[1]].toString() +
                this.field.toString() +
                this.count_item.toString();
            if (this.current_cycle[0][0] !== 0) {
                str += this.current_cycle.toString();
            }
            this.index[0]++;
            this.index[1]++;
            if (this.massiv_condition.has(str)) {
                return null;
            }
            else {
                this.massiv_condition.set(str, str);
                return this.field;
            }
        }
    }

    fullComputation() {
        while (1) {
            const result = this.computationTwoRobot();
            if (result === null) {
                break;
            }
        }
        if (this.count_item[0] > this.count_item[1]) {
            return 1;
        }
        else if (this.count_item[0] < this.count_item[1]) {
            return 2;
        }
        else {
            return 0;
        }
    }

    checkProgram(comands) {
        const result_check_if = checkIf(comands);
        if (result_check_if !== null) {
            return result_check_if;
        }
        const result_check_cycle = checkCycle(comands);
        if (result_check_cycle !== null) {
            return result_check_cycle;
        }
        return null;
    }
}

export default Interpreter;
