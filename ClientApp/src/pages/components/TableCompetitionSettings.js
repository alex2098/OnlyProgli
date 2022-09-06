import React from "react";

import style from "../css/TableCompetitionSettings.module.css";

function TR(props) {
    return (
        <tr>
            <td className={style.td_1}>{props.name}</td>
            <td className={style.td_2}>
                {!props.flag || <button onClick={() => props.onClick(props.id)}>Исключить</button>}
            </td>
        </tr>
    );
}

function TableCompetitionSettings(props) {
    return (
        <div className={style.div}>
            <table className={style.table}>
                <thead>
                    <tr>
                        <td className={style.td_1}>Имя</td>
                        <td>Действие</td>
                    </tr>
                </thead>
                <tbody>
                    {props.user.map((user, index) =>
                        <TR key={index}
                            id={index}
                            name={user[1]}
                            flag={user[2]}
                            onClick={props.onClick} />
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TableCompetitionSettings;
