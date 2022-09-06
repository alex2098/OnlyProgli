import React from "react";
import { Link } from 'react-router-dom';

import style from "../css/Item.module.css";

function ItemUserCompetition(props) {
    const new_style = props.is_selected ? style.item_competition_selected :
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
                            {props.is_selected || (!props.is_author && props.is_finish) ||
                            <button className={style.button} onClick={props.onClickSelected}>
                                Выбрать
                            </button>}
                            {!props.is_author ||
                            <Link to={`/competition/${props.competition_id}/settings`}>
                                <button className={style.button}>
                                    Редактировать
                                </button>
                            </Link>}
                            {!props.is_finish ||
                            <Link to={`/competition/${props.competition_id}/result`}>
                                <button className={style.button} >
                                    Результаты
                                </button>
                            </Link>}
                            {props.is_author ||
                                <button className={style.button} onClick={props.onClickExit}>
                                    Выйти
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

export default ItemUserCompetition;