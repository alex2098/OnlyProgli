import React from "react";

import style from "../css/Search.module.css";

function Search(props) {
    return (
        <div className={style.search}>
            <div className={style.div_input}>
                <div className={style.div_input}>
                    <input className={style.input}
                        type="text"
                        placeholder="Название"
                        value={props.name}
                            onChange={props.onChangeName} />
                </div>
                <div className={style.div_input}>
                    Начало
                    <input className={style.input}
                        type="datetime-local"
                        value={props.begin}
                        onChange={props.onChangeBegin} />
                </div>
                <div className={style.div_input}>
                    Конец
                    <input className={style.input}
                        type="datetime-local"
                        value={props.end}
                        onChange={props.onChangeEnd} />
                </div>
            </div>
            <button className={style.button}
                onClick={props.onClickSearch}>
                Поиск
            </button>
        </div>
    );
}

export default Search;
