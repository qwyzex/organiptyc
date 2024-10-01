import { SxProps, Theme } from "@mui/material";

const modalBoxStyle: SxProps<Theme> = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "500",
    bgcolor: "var(--background)",
    border: "2px solid var(--acc)",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

export default modalBoxStyle;
