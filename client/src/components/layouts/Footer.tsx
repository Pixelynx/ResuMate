import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import styles from '../../styles/Footer.module.css';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      className={styles.footer}
    >
      <Typography variant="body2" className={styles.copyright}>
        {new Date().getFullYear()} Resumate
      </Typography>
      <Box className={styles.linkContainer}>
        <Link
          href="#"
          className={styles.link}
        >
          Terms
        </Link>
        <Link
          href="#"
          className={styles.link}
        >
          Privacy
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;