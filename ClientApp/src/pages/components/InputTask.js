import React from "react";

import ConvertTime from "../function/ConvertTime";

function InputTask(props) {
    const min_begin_date = ConvertTime(new Date().toISOString().substring(0, 16));

    const min_end_date = (props.begin_date === "") ? min_begin_date : props.begin_date;

    const onCheckName = () => {
        if ((props.name.length <= 32 && props.name.length >= 4) || props.name.length === 0) {
            props.UpdateNameLabel("Название");
            props.UpdateNameStyle("input_current");
        }
        else {
            props.UpdateNameLabel("Название должно быть длиной от 4 до 32 символов!");
            props.UpdateNameStyle("input_error");
        }
    };

    const onCheckBeginDate = () => {
        if (Date.parse(props.end_date) < Date.parse(props.begin_date)) {
            props.UpdateBeginDate(props.end_date);
        }
        if (Date.parse(min_begin_date) > Date.parse(props.begin_date)) {
            props.UpdateBeginDate(min_begin_date);
        }
    }

    const onCheckEndDate = () => {
        if (Date.parse(props.end_date) < Date.parse(props.begin_date)) {
            props.UpdateEndDate(props.begin_date);
        }
    }

    return (
        <div>
            <span className={props.name_style}>{props.name_label}</span>
            <br />
            <input className={props.name_style}
                type="text"
                value={props.name}
                onChange={props.onChangeName}
                onBlur={onCheckName} />
            <br />
            <span className="input_current">Описание</span>
            <br />
            <textarea style={{ height: "80px" }}
                value={props.description}
                maxLength={1000}
                onChange={props.onChangeDescription} />
            <br />
            <span className={props.begin_date_style}>{props.begin_date_label}</span>
            <br />
            <input className={props.begin_date_style}
                type="datetime-local"
                min={min_begin_date}
                max={props.end_date}
                value={props.begin_date}
                onChange={event => props.UpdateBeginDate(event.target.value)}
                onBlur={onCheckBeginDate} />
            <br />
            <span className={props.end_date_style}>{props.end_date_label}</span>
            <br />
            <input className={props.end_date_style}
                type="datetime-local"
                min={min_end_date}
                value={props.end_date}
                onChange={event => props.UpdateEndDate(event.target.value)}
                onBlur={onCheckEndDate} />
        </div>
    );
}

export default InputTask;
