import React from "react";
import { Link } from 'react-router-dom';

import style from "../css/Item.module.css";

function ItemTask(props) {
    const new_style = props.is_decided ? style.item_competition_selected :
        props.is_finish ? style.item_competition_finish : style.item_competition;

    return (
        <div className={new_style}>
            <table className={style.table}>
                <tbody>
                    <tr>
                        <td className={style.td_text}>{props.name}</td>
                        <td className={style.td_date}>{props.begin_date}</td>
                        <td>{props.end_date}</td>
                        <td rowSpan={2} className={style.td_button}>
                            {props.is_decided || (!props.is_author && props.is_finish) ||
                            <Link to={`/task/${props.task_id}/solution`}>
                                <button className={style.button}>
                                    Решить
                                </button>
                            </Link>}
                            {!props.is_author ||
                            <Link to={`/task/${props.task_id}/settings`}>
                                <button className={style.button}>
                                    Редактировать
                                </button>
                            </Link>}
                            <Link to={`/task/${props.task_id}/result`}>
                                <button className={style.button} >
                                    Результаты
                                </button>
                            </Link>
                            {!props.is_author ||
                            <button className={style.button} onClick={props.onClick}>
                                Провести соревнование
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

export default ItemTask;
