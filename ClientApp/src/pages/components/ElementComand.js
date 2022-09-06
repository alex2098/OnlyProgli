import React from "react";

import style from "../css/Elements.module.css";

function ElementComand(props) {
    return (
        <div className={style.div}>
            <table>
                <tbody>
                    <tr>
                        <td colSpan={2}>{props.name}</td>
                    </tr>
                    <tr>
                        <td>
                            <div className={[style.img, props.element].join(' ')} />
                        </td>
                        <td>
                            <button onClick={props.onClick}>
                                Добавить
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ElementComand;
