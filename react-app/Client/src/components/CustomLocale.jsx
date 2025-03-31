import th from "antd/es/date-picker/locale/th_TH";
import dayTh from "dayjs/locale/th";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);
dayjs.locale(dayTh);
const CustomLocale = {
  ...th,
  DatePicker: {
    ...th.DatePicker,
    lang: {
      ...th.lang,
      shortWeekDays: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
      months: [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ],
      shortMonths: [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ],
      yearFormat: "BBBB",
      today: "วันนี้",
      dateFormat: "DD/MM/YYYY",
    },
  },
};

export default CustomLocale;
