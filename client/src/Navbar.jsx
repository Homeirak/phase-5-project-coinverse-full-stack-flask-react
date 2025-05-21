import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
    return (
        <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Logo */}
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    GoalGrind
                </Typography>

                {/* Navigation Links */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        component="a"
                        href="/"
                        sx={{ color: '#fff', textTransform: 'none' }}
                    >
                        Home
                    </Button>
                    <Button
                        component="a"
                        href="/about"
                        sx={{ color: '#fff', textTransform: 'none' }}
                    >
                        About
                    </Button>
                    <Button
                        component="a"
                        href="/goals"
                        sx={{ color: '#fff', textTransform: 'none' }}
                    >
                        Goals
                    </Button>
                    <Button
                        component="a"
                        href="/contact"
                        sx={{ color: '#fff', textTransform: 'none' }}
                    >
                        Contact
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;