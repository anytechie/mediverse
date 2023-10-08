import { FilledTextFieldProps, OutlinedTextFieldProps, StandardTextFieldProps, TextField, TextFieldVariants } from "@mui/material";
import { JSX } from "react/jsx-runtime";

const StyledTextField = (props: JSX.IntrinsicAttributes & { variant?: TextFieldVariants; } & Omit<FilledTextFieldProps | OutlinedTextFieldProps | StandardTextFieldProps, "variant">) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      sx={{
        marginBottom: "16px",
        input: { color: "var(--tg-theme-text-color)" },
        label: { color: "grey" },
        notch: { color: "var(--tg-theme-text-color)" }
      }}
      {...props} // Spread the props to pass any additional props to the TextField component
    />
  );
};

export default StyledTextField;
