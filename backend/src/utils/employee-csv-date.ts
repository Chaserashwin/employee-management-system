const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EXCEL_UNIX_EPOCH_SERIAL = 25569;
const EXCEL_FAKE_LEAP_DAY_SERIAL = 60;

const isLeapYear = (year: number) =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const getDaysInMonth = (year: number, month: number) => {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};

const isValidDatePart = (year: number, month: number, day: number) =>
  Number.isInteger(year) &&
  Number.isInteger(month) &&
  Number.isInteger(day) &&
  year >= 1 &&
  year <= 9999 &&
  month >= 1 &&
  month <= 12 &&
  day >= 1 &&
  day <= getDaysInMonth(year, month);

const createUtcDate = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
) => {
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));

  date.setUTCFullYear(year);

  return date;
};

export const createEmployeeCsvDate = createUtcDate;

const parseDateOnly = (value: string) => {
  const dayFirstMatch = /^(\d{1,2})([-/])(\d{1,2})\2(\d{4})$/.exec(value);

  if (dayFirstMatch) {
    const [, dayValue, , monthValue, yearValue] = dayFirstMatch;
    const day = Number(dayValue);
    const month = Number(monthValue);
    const year = Number(yearValue);

    return isValidDatePart(year, month, day) ? createUtcDate(year, month, day) : null;
  }

  const isoDateMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);

  if (!isoDateMatch) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = isoDateMatch;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  return isValidDatePart(year, month, day) ? createUtcDate(year, month, day) : null;
};

const parseIsoTimestamp = (value: string) => {
  const isoMatch =
    /^(\d{4})-(\d{2})-(\d{2})[Tt ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(?:([Zz])|([+-])(\d{2}):?(\d{2}))?$/.exec(
      value,
    );

  if (!isoMatch) {
    return null;
  }

  const [
    ,
    yearValue,
    monthValue,
    dayValue,
    hourValue,
    minuteValue,
    secondValue = "0",
    fractionValue = "",
    ,
    offsetDirection,
    offsetHourValue = "0",
    offsetMinuteValue = "0",
  ] = isoMatch;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const hour = Number(hourValue);
  const minute = Number(minuteValue);
  const second = Number(secondValue);
  const millisecond = Number(fractionValue.padEnd(3, "0").slice(0, 3) || "0");
  const offsetHour = Number(offsetHourValue);
  const offsetMinute = Number(offsetMinuteValue);

  if (
    !isValidDatePart(year, month, day) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59 ||
    offsetHour < 0 ||
    offsetHour > 23 ||
    offsetMinute < 0 ||
    offsetMinute > 59
  ) {
    return null;
  }

  const offsetMultiplier = offsetDirection === "-" ? -1 : 1;
  const offsetMs = offsetDirection
    ? offsetMultiplier * (offsetHour * 60 + offsetMinute) * 60 * 1000
    : 0;

  return new Date(
    createUtcDate(year, month, day, hour, minute, second, millisecond).getTime() - offsetMs,
  );
};

const parseExcelSerialDate = (value: string) => {
  if (!/^\d+(?:\.\d+)?$/.test(value)) {
    return null;
  }

  const serial = Number(value);

  if (
    !Number.isFinite(serial) ||
    serial <= 0 ||
    Math.floor(serial) === EXCEL_FAKE_LEAP_DAY_SERIAL
  ) {
    return null;
  }

  const timestamp = Math.round((serial - EXCEL_UNIX_EPOCH_SERIAL) * MS_PER_DAY);
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();

  return year >= 1900 && year <= 9999 ? date : null;
};

export const parseEmployeeCsvDate = (value: string) => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  return (
    parseDateOnly(normalizedValue) ??
    parseIsoTimestamp(normalizedValue) ??
    parseExcelSerialDate(normalizedValue)
  );
};
