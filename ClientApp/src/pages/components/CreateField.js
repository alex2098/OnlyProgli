import React, { useState } from "react";

import style from "../css/Field.module.css";

function CreateField(props) {
    const [size, setSize] = useState("35px");
    const onClickPlusSize = () => {
        const int_size = parseInt(size.substring(0, 2));
        if (int_size < 50) {
            setSize((int_size + 5).toString() + "px");
        }
    }
    const onClickMinusSize = () => {
        const int_size = parseInt(size.substring(0, 2));
        if (int_size > 10) {
            setSize((int_size - 5).toString() + "px");
        }
    }
    return (
        <div className={style.div_create}>
            <button onClick={onClickPlusSize} className={style.button}>
                +
            </button>
            <button onClick={onClickMinusSize} className={style.button}>
                -
            </button>
            <div className={style.div_table}>
                <table>
                    <tbody>
                        {props.matrix_1.map((items, index) =>
                            <tr key={index}>{items.map((cells, c_index) => 
                                <td className={cells} style={{
                                    width: size,
                                    height: size,
                                    border: "0.5px solid black",
                                    minWidth: size,
                                    minHeight: size
                                }}
                                    key={c_index}
                                    onClick={(cells === "field_private") ? undefined : props.onClick} />
                            )}</tr>
                        )}
                        {props.matrix_2.map((items, index) =>
                            <tr key={index}>{items.map((cells, c_index) =>
                                <td className={cells} style={{
                                    width: size,
                                    height: size,
                                    border: "0.5px solid black",
                                    minWidth: size,
                                    minHeight: size
                                }}
                                    key={c_index} />
                            )}</tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CreateField;
