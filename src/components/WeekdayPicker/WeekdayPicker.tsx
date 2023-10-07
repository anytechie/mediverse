import Select from "react-select";
import "./WeekdayPicker.scss";

const WeekdayDropdown = ({ onChange }) => {
  const days = [
    { value: 0, label: "Monday" },
    { value: 1, label: "Tuesday" },
    { value: 2, label: "Wednesday" },
    { value: 3, label: "Thursday" },
    { value: 4, label: "Friday" },
    { value: 5, label: "Saturday" },
    { value: 6, label: "Sunday" },
  ];

  return (
    <Select
      isMulti
      styles={{
        multiValue: (styles) => {
          return {
            ...styles,
            backgroundColor: "var(--tg-theme-bg-color)",
            borderRadius: "4px",
            padding: "2px 4px",
            marginRight: "4px",
            border: "1px solid #2196f3",
            marginBottom: "4px",
          };
        },
        multiValueLabel: (styles) => ({
          ...styles,
          color: "var(--tg-theme-text-color)",
          fontSize: "14px",
          fontWeight: "bold",
        }),
        multiValueRemove: (styles) => ({
          ...styles,
          color: "var(--tg-theme-text-color)",
          ":hover": {
            // material blue 500
            backgroundColor: "#2196f3",
            color: "#000",
          },
        }),
        placeholder: (styles) => ({
          ...styles,
          color: "var(--tg-theme-text-color)",
        }),
        control: (styles) => ({
          ...styles,
          backgroundColor: "var(--tg-theme-bg-color)",
          border: "1px solid #2196f3",
          borderRadius: "4px",
          padding: "2px 4px",
          marginBottom: "4px",
          ':hover': {
            border: "1px solid #2196f3",
          }
        }),
        menu: (styles) => ({
          ...styles,
          backgroundColor: "var(--tg-theme-bg-color)",
          border: "1px solid #2196f3",
          borderRadius: "4px",
          padding: "2px 4px",
          marginBottom: "4px",
        }),
        option: (styles) => ({
          ...styles,
          color: "var(--tg-theme-text-color)",
          backgroundColor: "var(--tg-theme-bg-color)",
          ':hover': {
            backgroundColor: "#2196f3",
            color: "#fff",
          }
        }),
      }}
      name="weekdays"
      defaultValue={[days[0], days[1], days[2], days[3], days[4]]}
      closeMenuOnSelect={false}
      options={days}
      isSearchable={ false }
      isClearable={false}
      className="weekday_dropdown"
      classNamePrefix="select"
      onChange={onChange}
    />
  );
};

export default WeekdayDropdown;
