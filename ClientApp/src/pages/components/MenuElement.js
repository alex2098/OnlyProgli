import React from "react";

import ElementComand from "./ElementComand";
import Element from "./Element";

import style from "../css/MenuElement.module.css"

function MenuElement(props) {
   return (
        <div className={style.div_solution}>
            <details open={true}>
                <summary>Команды</summary>
                <ElementComand name="Движение вперед"
                    element="forward"
                    onClick={() => props.onClickComand("forward")} />
                <ElementComand name="Поворот направо"
                    element="rotate_right"
                    onClick={() => props.onClickComand("rotate_right")} />
                <ElementComand name="Поворот налево"
                    element="rotate_left"
                    onClick={() => props.onClickComand("rotate_left")} />
                <ElementComand name="Закрасить ячейку"
                    element="paint"
                    onClick={() => props.onClickComand("paint")} />
                <ElementComand name="Начало проверки условия"
                    element="check"
                    onClick={() => props.onClickComand("check")} />
               <ElementComand name="Конец проверки условия"
                   element="end_check"
                   onClick={() => props.onClickComand("end_check")} />
                <ElementComand name="Начало цикла со счетчиком"
                    element="begin_cycle_number"
                    onClick={() => props.onClickComand("begin_cycle_number")} />
                <ElementComand name="начало цикла с условием"
                   element="begin_cycle_check"
                    onClick={() => props.onClickComand("begin_cycle_check")} />
               <ElementComand name="Конец цикла"
                   element="end_cycle"
                   onClick={() => props.onClickComand("end_cycle")} />
                <Element name="Удалить команду"
                    is_select={props.is_delete_comand}
                    onClickFalse={() => props.onClickDeleteComand(false)}
                    onClickTrue={() => props.onClickDeleteComand(true)} />
            </details>
            <details open={true}>
                <summary>Условия</summary>
                <ElementComand name="Если впереди свободно"
                    element="if_forward"
                    onClick={() => props.onClickIf("if_forward")} />
                <ElementComand name="Если справа свободно"
                    element="if_right"
                    onClick={() => props.onClickIf("if_right")} />
                <ElementComand name="Если слева свободно"
                    element="if_left"
                    onClick={() => props.onClickIf("if_left")} />
                <ElementComand name="Если сзади свободно"
                    element="if_back"
                    onClick={() => props.onClickIf("if_back")} />
                <ElementComand name="И"
                    element="and"
                    onClick={() => props.onClickIf("and")} />
                <ElementComand name="Или"
                    element="or"
                    onClick={() => props.onClickIf("or")} />
                <ElementComand name="Не"
                    element="no"
                    onClick={() => props.onClickIf("no")} />
                <Element name="Удалить условие"
                    is_select={props.is_delete_if}
                    onClickFalse={() => props.onClickDeleteIf(false)}
                    onClickTrue={() => props.onClickDeleteIf(true)} />
            </details>
        </div>
    );
}

export default MenuElement;
