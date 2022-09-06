function ConvertTime(date) {
    const date_local = new Date(date + "Z");
    const new_date = new Date(date_local.getTime() - date_local.getTimezoneOffset() * 60 * 1000);
    const string_date = new_date.toISOString().substring(0, 16);
    return string_date;
}

export default ConvertTime;
