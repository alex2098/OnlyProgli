import React, { Component } from "react";

import style from "../css/Program.module.css";

function Program(props) {
    if (props.comand === "add") {
        return (
            <tr>
                <td className={[props.comand, style.cells_1].join(' ')}
                    onClick={props.onClickComand} />
            </tr>
        );
    }
    let comand = [];
    if (props.is_add_comand) {
        comand.push(
            <tr>
                <td className={["add_mini", style.cells_2].join(' ')}
                    onClick={props.onClickComand} />
            </tr>
        );
    }
    if (Array.isArray(props.comand)) {
        if (props.comand[0] === "begin_cycle_number") {
            comand.push(
                <tr>
                    <td className={style.border}>
                        <table>
                            <tbody>
                                <tr>
                                    <td onClick={props.onClickDeleteComand}
                                        className={[props.comand[0], style.cells_1].join(' ')} />
                                </tr>
                                <tr>
                                    <td>
                                        <input type="number"
                                            value={props.comand[1]}
                                            onChange={props.onChangeNumber}
                                            className={style.input} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            );
        }
        else {
            let check_if = [];
            for (let i = 1; i < props.comand.length; i++) {
                if (props.is_add_if) {
                    check_if.push(
                        <tr>
                            <td />
                            <td className={["add_mini", style.cells_3].join(' ')}
                                onClick={props.onClickIf} />
                        </tr>
                    );
                }
                check_if.push(
                    <tr>
                        <td />
                        <td onClick={() => props.onClickDeleteIf(i)}
                            className={[props.comand[i], style.cells_3].join(' ')} />
                    </tr>
                );
            }
            if (props.is_add_if) {
                check_if.push(
                    <tr>
                        <td />
                        <td className={["add_mini", style.cells_3].join(' ')}
                            onClick={props.onClickIf} />
                    </tr>
                );
            }
            comand.push(
                <tr>
                    <td onClick={props.onClickDeleteComand}
                        className={style.border}>
                        <table>
                            <tbody>
                                <tr>
                                    <td className={[props.comand[0], style.cells_1].join(' ')}
                                        colSpan={2} />
                                </tr>
                                {check_if}
                            </tbody>
                        </table>
                    </td>
                </tr>
            );

        }
    }
    else {
        comand.push(
            <tr>
                <td onClick={props.onClickDeleteComand}
                    className={[props.comand, style.cells_1].join(' ')} />
            </tr>
        );
    }
    if (props.is_add_comand && props.is_end) {
        comand.push(
            <tr>
                <td className={["add_mini", style.cells_2].join(' ')}
                    onClick={props.onClickComand} />
            </tr>
        );
    }

    return comand;
}

export default Program;
