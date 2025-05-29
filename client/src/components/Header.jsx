import { AppBar, Toolbar, Typography } from "@mui/material";
import HeaderActions from "./HeaderActions";

export default function Header({ title = "", sx = {}, ...rest }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "var(--background-color)",
        borderBottom: "1px solid #404153",
        justifyContent: "center",
        zIndex: 1201,
        ...sx, // allow custom styles from parent
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64, // increased for more space
          px: 2,
          py: 1.5, // increased for more space
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Only show title if provided */}
        {title ? (
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        ) : <span />} {/* Empty span for alignment if no title */}
        <HeaderActions {...rest} />
      </Toolbar>
    </AppBar>
  );
}