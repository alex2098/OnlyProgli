import React from "react";

import style from "../css/Elements.module.css";

function Element(props) {
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
                            {props.is_select ||
                            <button onClick={props.onClickTrue}>
                                Выбрать
                            </button>}
                            {!props.is_select ||
                            <button onClick={props.onClickFalse}>
                                Отмена
                            </button>}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Element;
