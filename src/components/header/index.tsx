import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useGetIdentity } from "@refinedev/core";
import { HamburgerMenu, RefineThemedLayoutV2HeaderProps } from "@refinedev/mui";
import React from "react";

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const { data: user } = useGetIdentity<IUser>();

  return (
    <AppBar position={sticky ? "sticky" : "relative"}>
      <Toolbar>
        <Stack
          direction="row"
          width="100%"
          justifyContent="flex-end"
          alignItems="center"
        >
          <HamburgerMenu />
          {(user?.avatar || user?.name) && (
            <Stack
              direction="row"
              width="100%"
              justifyContent="flex-end"
              alignItems="center"
              gap="16px"
            >
              {user?.name && (
                <Typography
                  sx={{
                    display: {
                      xs: "none",
                      sm: "inline-block",
                    },
                  }}
                  variant="subtitle2"
                >
                  {user?.name}
                </Typography>
              )}
              <Avatar src={user?.avatar} alt={user?.name} />
            </Stack>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
