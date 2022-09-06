import React from "react";

import style from "../css/Item.module.css";

function ItemCompetition(props) {
    return (
        <div className={style.item_competition}>
            <table className={style.table}>
                <tbody>
                    <tr>
                        <td className={style.td_text}>{props.name}</td>
                        <td className={style.td_date}>{props.begin_date}</td>
                        <td>{props.end_date}</td>
                        <td rowSpan={2} className={style.td_button}>
                            {!props.is_button ||
                            <button className={style.button} onClick={props.onClick}>
                                Вступить
                            </button>}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={3}>
                            <div className={style.description}>
                                {props.description}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ItemCompetition;

